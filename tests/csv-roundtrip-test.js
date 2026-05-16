const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');

const storage = new Map();
let fakeCsvFile = '';

const fakeElement = () => ({
  style: {},
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {},
  appendChild() {},
  removeChild() {},
  querySelectorAll() { return []; },
  querySelector() { return fakeElement(); },
  setAttribute() {},
  getAttribute() { return ''; },
  textContent: '',
  innerHTML: '',
  value: '',
  checked: false,
  disabled: false,
  files: [fakeCsvFile],
});

const context = {
  console,
  Date,
  Intl,
  Math,
  Number,
  String,
  Array,
  JSON,
  Error,
  RegExp,
  parseFloat,
  parseInt,
  isFinite,
  setTimeout() { return 0; },
  clearTimeout() {},
  setInterval() { return 0; },
  clearInterval() {},
  requestAnimationFrame() {},
  alert(message) { throw new Error(`Unexpected alert: ${message}`); },
  navigator: { clipboard: { writeText() {} } },
  location: { reload() {} },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  Blob: function Blob(parts) { this.parts = parts; },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
    key(index) { return Array.from(storage.keys())[index] || null; },
    get length() { return storage.size; },
  },
  document: {
    body: fakeElement(),
    documentElement: { style: { setProperty() {} } },
    addEventListener() {},
    createElement() { return fakeElement(); },
    querySelectorAll() { return []; },
    querySelector() { return fakeElement(); },
    getElementById(id) {
      if (id === 'import-backup-file') return { files: [fakeCsvFile] };
      return fakeElement();
    },
  },
  window: { addEventListener() {}, currentLang: 'zh' },
  FileReader: class FileReader {
    readAsText(file) {
      this.onload({ target: { result: file } });
    }
  },
};
context.window.window = context.window;
context.window.document = context.document;
context.window.localStorage = context.localStorage;

vm.createContext(context);
vm.runInContext(scripts, context, { filename: 'index.html' });

vm.runInContext(`
  intervals = [
    {
      id: 'a',
      duration: '00:12:30.123',
      durationMs: 750123,
      memo: '读 paper, 写了 "quote"\\n第二行',
      tag: '#学习 #工作',
      setDuration: '13',
      endTime: 1765856400123,
      parsed: true,
      withdrawn: false,
      withdrawnAt: null
    },
    {
      id: 'b',
      duration: '00:01:00.000',
      durationMs: 60000,
      memo: '误点记录, should stay only in backup',
      tag: '#撤回',
      setDuration: '',
      endTime: 1765856460123,
      parsed: false,
      withdrawn: true,
      withdrawnAt: 1765856465123
    }
  ];
`, context);

const normalCsv = vm.runInContext('buildIntervalsCsv(false)', context);
assert(normalCsv.includes('结束时间戳'), 'CSV should include machine-readable EndTimeMs column');
assert(!normalCsv.includes('误点记录'), 'normal CSV should exclude withdrawn records');

const backupCsv = vm.runInContext('buildIntervalsCsv(true)', context);
assert(backupCsv.includes('误点记录'), 'backup CSV should include withdrawn records');
assert(backupCsv.includes('"读 paper, 写了 ""quote""'), 'CSV should escape quotes and keep comma-containing memo quoted');

fakeCsvFile = backupCsv;
vm.runInContext('importBackupFromCSV()', context);
const imported = JSON.parse(storage.get('intervals'));

assert.strictEqual(imported.length, 2, 'round-trip should import two records');
assert.strictEqual(imported[0].memo, '读 paper, 写了 "quote"\n第二行', 'memo with comma, quote and newline should round-trip');
assert.strictEqual(imported[0].durationMs, 750123, 'durationMs should round-trip from minutes column');
assert.strictEqual(imported[0].endTime, 1765856400123, 'endTime should round-trip from EndTimeMs column');
assert.strictEqual(imported[0].setDuration, '13', 'setDuration should round-trip');
assert.strictEqual(imported[0].parsed, true, 'parsed status should round-trip');
assert.strictEqual(imported[1].withdrawn, true, 'withdrawn status should round-trip');
assert.deepStrictEqual(JSON.parse(storage.get('undoStack')), [], 'import should clear undoStack');
assert.deepStrictEqual(JSON.parse(storage.get('redoStack')), [], 'import should clear redoStack');

const oldStyleEndTime = vm.runInContext(`parseCsvEndTimeToMs('5/16/2026, 9:00:00 AM UTC.123')`, context);
assert.strictEqual(oldStyleEndTime, 1778922000123, 'old human-readable end time with millisecond suffix should parse');

fakeCsvFile = [
  '"持续时间（分钟）","格式化时间","备注","标签","结束时间","状态"',
  '"1.00","00:01:00.123","旧备份, 含逗号","#旧","5/16/2026, 9:00:00 AM UTC.123","withdrawn"'
].join('\n');
vm.runInContext('importBackupFromCSV()', context);
const importedOld = JSON.parse(storage.get('intervals'));
assert.strictEqual(importedOld.length, 1, 'old-style CSV should import');
assert.strictEqual(importedOld[0].memo, '旧备份, 含逗号', 'old-style CSV memo with comma should import');
assert.strictEqual(importedOld[0].withdrawn, true, 'old-style withdrawn string should import');
assert.strictEqual(importedOld[0].endTime, 1778922000123, 'old-style end time should import with millisecond suffix preserved');

console.log('CSV round-trip test passed.');
