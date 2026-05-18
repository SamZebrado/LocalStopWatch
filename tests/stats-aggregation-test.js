const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');

const storage = new Map();

const fakeElement = () => ({
  style: {}, classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {}, appendChild() {}, removeChild() {},
  querySelectorAll() { return []; }, querySelector() { return fakeElement(); },
  setAttribute() {}, getAttribute() { return ''; }, textContent: '', innerHTML: '',
  value: '', checked: false, disabled: false, files: [], clientWidth: 400,
});

function createContext() {
  return {
    console, Date, Intl, Math, Number, String, Array, JSON, Error, RegExp,
    parseFloat, parseInt, isFinite,
    setTimeout() { return 0; }, clearTimeout() {},
    setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() {},
    alert() { throw new Error('Unexpected alert'); },
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
      body: fakeElement(), documentElement: { style: { setProperty() {} } },
      addEventListener() {}, createElement() { return fakeElement(); },
      querySelectorAll() { return []; }, querySelector() { return fakeElement(); },
      getElementById(id) { return fakeElement(); },
    },
    window: { addEventListener() {}, currentLang: 'zh' },
    FileReader: class FileReader {
      readAsText(file) { this.onload({ target: { result: file } }); }
    },
  };
}

const hourMs = 60 * 60 * 1000;
const now = 1766400000000;

console.log('=== 统计聚合测试 ===\n');

storage.clear();
let ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });

vm.runInContext(`Date.now = function() { return ${now}; };`, ctx);
vm.runInContext(`intervals = [{ id: 'a', durationMs: ${hourMs}, endTime: ${now}, tag: '#工作', memo: '', withdrawn: false }];`, ctx);

let ds = vm.runInContext(`buildStatsDataset(intervals, 7)`, ctx);
assert.strictEqual(ds.activeRecords.length, 1, 'should include 1 active record');
assert.strictEqual(ds.totalDurationMs, hourMs, 'total duration should be 1 hour');
assert.ok(ds.tagStats['#工作'], 'should have #工作 tag');
assert.strictEqual(ds.tagStats['#工作'].recordCount, 1, '#工作 recordCount should be 1');
console.log('✓ 基础统计功能正常');

console.log('\n=== 多标签时长模式测试 ===\n');

storage.clear();
ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });
vm.runInContext(`Date.now = function() { return ${now}; };`, ctx);

const H = hourMs;
const NOW = now;
vm.runInContext(`
  const H = ${H};
  const NOW = ${NOW};
  intervals = [
    { id: 'a', durationMs: 1 * H, endTime: NOW, tag: '#工作', memo: '', withdrawn: false },
    { id: 'b', durationMs: 1 * H, endTime: NOW, tag: '#学习', memo: '', withdrawn: false },
    { id: 'c', durationMs: 1 * H, endTime: NOW, tag: '#运动', memo: '', withdrawn: false },
    { id: 'd', durationMs: 2 * H, endTime: NOW, tag: '#工作 #学习', memo: '', withdrawn: false }
  ];
`, ctx);

ds = vm.runInContext(`buildStatsDataset(intervals, 7, {})`, ctx);
assert.strictEqual(ds.totalDurationMs, 5 * H, '[未均摊] 真实总时长 = 5小时');
assert.strictEqual(ds.totalTagDurationMs, 7 * H, '[未均摊] 标签归属 = 7小时');
assert.strictEqual(ds.tagStats['#工作'].duration, 3 * H, '[未均摊] #工作 = 3小时');
assert.strictEqual(ds.tagStats['#学习'].duration, 3 * H, '[未均摊] #学习 = 3小时');
console.log('✓ 未均摊模式：每条记录完整计入每个标签');

ds = vm.runInContext(`buildStatsDataset(intervals, 7, { splitMultiTagDuration: true })`, ctx);
assert.strictEqual(ds.totalDurationMs, 5 * H, '[均摊] 真实总时长 = 5小时');
assert.strictEqual(ds.totalTagDurationMs, 5 * H, '[均摊] 标签归属 = 5小时');
assert.strictEqual(ds.tagStats['#工作'].duration, 2 * H, '[均摊] #工作 = 2小时');
assert.strictEqual(ds.tagStats['#学习'].duration, 2 * H, '[均摊] #学习 = 2小时');
console.log('✓ 均摊模式：多标签记录时长均分');

console.log('\n=== #未分类 测试 ===\n');

storage.clear();
ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });
vm.runInContext(`Date.now = function() { return ${now}; };`, ctx);
vm.runInContext(`intervals = [{ id: 'a', durationMs: ${hourMs}, endTime: ${now}, tag: '', memo: '', withdrawn: false }];`, ctx);

ds = vm.runInContext(`buildStatsDataset(intervals, 7)`, ctx);
assert.ok(ds.tagStats['#未分类'], 'untagged record should go to #未分类');
assert.strictEqual(ds.tagStats['#未分类'].recordCount, 1, '#未分类 recordCount should be 1');
console.log('✓ 无标签记录归入 #未分类');

console.log('\n=== withdrawn 测试 ===\n');

storage.clear();
ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });
vm.runInContext(`Date.now = function() { return ${now}; };`, ctx);
vm.runInContext(`intervals = [{ id: 'a', durationMs: ${hourMs}, endTime: ${now}, tag: '#休息', memo: '', withdrawn: true }];`, ctx);

ds = vm.runInContext(`buildStatsDataset(intervals, 7)`, ctx);
assert.ok(!ds.tagStats['#休息'], 'withdrawn record should not appear in stats');
assert.strictEqual(ds.activeRecords.length, 0, 'withdrawn record not in activeRecords');
console.log('✓ withdrawn 记录不参与统计');

console.log('\n=== 跨零点拆分测试 ===\n');

storage.clear();
ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });

const crossMidnight = now - 23 * hourMs;
const afterMidnight = now - 1 * hourMs;
vm.runInContext(`intervals = [{ id: 'cross', durationMs: ${afterMidnight} - ${crossMidnight}, endTime: ${afterMidnight}, tag: '#工作', memo: '', withdrawn: false }];`, ctx);

ds = vm.runInContext(`buildStatsDataset(intervals, 7)`, ctx);
assert.ok(Object.keys(ds.dailyStats).length >= 2, 'cross-midnight should span 2 days');
console.log('✓ 跨零点记录拆分到多天');

const segs = vm.runInContext(`splitTimeRangeByLocalDay(${crossMidnight}, ${afterMidnight})`, ctx);
assert.strictEqual(segs.length, 2, 'should split into 2 segments');
console.log('✓ 跨零点拆分正确');

console.log('\n=== 时区安全测试 ===\n');

const wd = vm.runInContext(`getWeekdayFromDayKey('2026-01-07')`, ctx);
assert.strictEqual(wd, 3, '2026-01-07 is Wednesday (3)');
console.log('✓ getWeekdayFromDayKey 本地时区解析正确');

console.log('\n=== LocalStorage 持久化测试 ===\n');

storage.clear();
ctx = createContext();
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.localStorage = ctx.localStorage;
vm.createContext(ctx);
vm.runInContext(scripts, ctx, { filename: 'index.html' });

vm.runInContext(`setStatsSplitMultiTagDuration(true)`, ctx);
let isEnabled = vm.runInContext(`getStatsSplitMultiTagDuration()`, ctx);
assert.strictEqual(isEnabled, true, 'should persist enabled to localStorage');
console.log('✓ 均摊设置保存到 LocalStorage');

vm.runInContext(`setStatsSplitMultiTagDuration(false)`, ctx);
let isDisabled = vm.runInContext(`getStatsSplitMultiTagDuration()`, ctx);
assert.strictEqual(isDisabled, false, 'should persist disabled to localStorage');
console.log('✓ 取消均摊设置保存到 LocalStorage');

console.log('\n=== 测试总结 ===');
console.log('所有测试通过！');
console.log('- 基础统计功能: OK');
console.log('- 未均摊模式: OK（每标签完整计入）');
console.log('- 均摊模式: OK（时长均分）');
console.log('- #未分类: OK');
console.log('- withdrawn: OK');
console.log('- 跨零点拆分: OK');
console.log('- 时区安全: OK');
console.log('- LocalStorage 持久化: OK');
