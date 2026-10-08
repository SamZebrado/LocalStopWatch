const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
const storage = new Map();
const elements = new Map();
const alerts = [];
const fakeElement = () => ({
  style: {}, classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {}, appendChild() {}, removeChild() {},
  querySelectorAll() { return []; }, querySelector() { return fakeElement(); },
  setAttribute() {}, getAttribute() { return ''; },
  textContent: '', innerHTML: '', value: '', checked: false, disabled: false,
  files: [], hidden: true, open: false,
  showModal() { this.open = true; }, close() { this.open = false; },
});
const context = {
  console, Date, Intl, Math, Number, String, Array, JSON, Error, RegExp,
  parseFloat, parseInt, isFinite,
  setTimeout() { return 0; }, clearTimeout() {},
  setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() {},
  alert(message) { alerts.push(message); },
  navigator: { clipboard: { writeText() {} } }, location: { reload() {} },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  Blob: function Blob(parts) { this.parts = parts; },
  localStorage: {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }, key(i) { return [...storage.keys()][i] || null; },
    get length() { return storage.size; },
  },
  document: {
    body: fakeElement(), documentElement: { style: { setProperty() {} } },
    addEventListener() {}, createElement() { return fakeElement(); },
    querySelectorAll() { return []; }, querySelector() { return fakeElement(); },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, fakeElement());
      return elements.get(id);
    },
  },
  window: { addEventListener() {}, currentLang: 'zh' }, FileReader: class {},
};
vm.createContext(context);
vm.runInContext(scripts, context, { filename: 'index.html' });
const run = code => vm.runInContext(code, context);
const plain = value => JSON.parse(JSON.stringify(value));

for (const [memo, expected] of [
  ['阅读等效10', '阅读'], ['阅读 10等效', '阅读'], ['阅读等效 2.5', '阅读'],
  ['  阅读  ', '阅读'], ['第2章阅读 30', '第2章阅读'],
  ['等效分析第2章 30', '等效分析第2章'],
  ['阅读等效 2 min', '阅读等效 2 min'],
  ['阅读等效phstsc17', '阅读等效phstsc'],
  ['', ''], ['   ', ''], ['10', '10'], ['20', '20'], ['等效10', '等效10'],
]) {
  assert.strictEqual(run(`normalizeMemoHistoryKey(${JSON.stringify(memo)})`), expected, memo);
}

const records = [
  ...Array.from({ length: 12 }, (_, i) => ({ memo: `条目 ${String.fromCharCode(65 + i)}`, endTime: i + 1 })),
  ...Array.from({ length: 15 }, (_, i) => ({ memo: `条目 L 等效${i + 1}`, endTime: i + 13 })),
  { memo: '已撤回', withdrawn: true, endTime: 100 },
  { memo: ' ', endTime: 101 }, null, { endTime: 102 },
];
context.records = records;
const beforeRecords = JSON.stringify(records);
const recent = plain(run('getRecentUniqueMemos(records)'));
assert.strictEqual(recent.length, 10, 'scan beyond first ten duplicates');
assert.strictEqual(recent[0], '条目 L 等效15', 'newest original text retained');
assert.strictEqual(recent[9], '条目 C');
assert.strictEqual(JSON.stringify(records), beforeRecords, 'history never mutated');
assert.deepStrictEqual(plain(run(`getRecentUniqueMemos([
  {memo:'旧备注', endTime:1}, {memo:'新备注 9', endTime:8},
  {memo:'旧备注等效5', endTime:6}, {memo:'新备注 3', endTime:2}
])`)), ['新备注 9', '旧备注等效5'], 'imports ordered by end time');
assert.deepStrictEqual(plain(run(`getRecentUniqueMemos([
  {memo:'旧备注 1', endTime:9}, {memo:'旧备注等效2', endTime:9}
])`)), ['旧备注等效2'], 'latest array entry wins timestamp ties');
assert.deepStrictEqual(plain(run(`getRecentUniqueMemos([
  {memo:'10'}, {memo:'20'}, {memo:'10'}, {memo:'等效'}, {memo:'', withdrawn:false}
])`)), ['等效', '10', '20'], 'empty normalized keys preserve distinct real entries');
assert.deepStrictEqual(plain(run(`getRecentUniqueMemos([
  {memo:'编辑后的当前备注', originalMemo:'旧原文20', parsed:true}
])`)), ['编辑后的当前备注'], 'use current saved memo, not stale originalMemo');
assert.deepStrictEqual(plain(run('getRecentUniqueMemos([])')), []);

run(`
  intervals = [
    {id:'active', memo:'合成备注20', durationMs:60000, endTime:1760000000000, withdrawn:false},
    {id:'withdrawn', memo:'合成撤回', durationMs:60000, endTime:1760000060000, withdrawn:true}
  ];
  localStorage.setItem('intervals', JSON.stringify(intervals));
  undoStack = [{index:1, itemId:'withdrawn'}];
  redoStack = [{index:0, itemId:'active'}];
  localStorage.setItem('undoStack', JSON.stringify(undoStack));
  localStorage.setItem('redoStack', JSON.stringify(redoStack));
  const downloads = [];
  downloadCsvContent = (csv, filename) => downloads.push({csv, filename});
`);
const beforeState = run('JSON.stringify([intervals, undoStack, redoStack, t_Last])');
const beforeStorage = [...storage];
run('confirmCsvExport(); confirmCsvExport();');
assert.strictEqual(elements.get('confirm-csv-dialog').open, true);
assert.strictEqual(run('downloads.length'), 0, 'opening must not download');
run(`document.getElementById('confirm-csv-dialog').close(); exportConfirmedCSV();`);
assert.strictEqual(run('downloads.length'), 0, 'closed/cancelled dialog cannot export');
assert.strictEqual(run('JSON.stringify([intervals, undoStack, redoStack, t_Last])'), beforeState);
assert.deepStrictEqual([...storage], beforeStorage);
run('confirmCsvExport(); exportConfirmedCSV(); exportConfirmedCSV();');
assert.strictEqual(run('downloads.length'), 1, 'duplicate confirm produces one download');
assert.match(run('downloads[0].filename'), /^Uncleared_.*\.csv$/);
assert(!run('downloads[0].csv').includes('合成撤回'));
assert.strictEqual(run('JSON.stringify([intervals, undoStack, redoStack, t_Last])'), beforeState);
assert.deepStrictEqual([...storage], beforeStorage);
run(`confirmExportAndClear(); document.getElementById('confirm-clear-dialog').close(); exportThenClear();`);
assert.strictEqual(run('downloads.length'), 1);
assert.strictEqual(run('JSON.stringify([intervals, undoStack, redoStack, t_Last])'), beforeState);
run('confirmExportAndClear(); exportThenClear(); exportThenClear();');
assert.strictEqual(run('downloads.length'), 2, 'clear confirm does not prompt ordinary export again');
assert.match(run('downloads[1].filename'), /^Cleared_.*\.csv$/);
assert.deepStrictEqual(plain(run('[intervals, undoStack, redoStack]')), [[], [], []]);
assert.strictEqual(storage.get('intervals'), '[]');
assert.strictEqual(storage.get('undoStack'), '[]');
assert.strictEqual(storage.get('redoStack'), '[]');
assert.strictEqual(run('t_Last'), JSON.parse(beforeState)[3], 'export does not reset clock');
run('window.currentLang = "en"; confirmCsvExport(); confirmExportAndClear();');
assert.deepStrictEqual(alerts, ['No active records to export', 'No active records to export']);
assert.strictEqual(run('downloads.length'), 2);
assert.strictEqual(elements.get('confirm-csv-dialog').open, false);
assert.strictEqual(elements.get('confirm-clear-dialog').open, false);
run(`intervals = [{memo:'仅撤回', withdrawn:true}]; confirmCsvExport();`);
assert.strictEqual(run('downloads.length'), 2);
assert.strictEqual(run('intervals.length'), 1);
console.log('Memo history normalization, selection source and CSV confirmation tests passed.');
