const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
const source = html.slice(html.indexOf('let memoHistoryTrigger = null;'), html.indexOf('// === 撤回/恢复功能 ==='));

function setup() {
  let time = 0, nextId = 1;
  const timers = new Map();
  const nodes = new Map();
  const storage = new Map();
  const stats = { records: 0, opens: 0 };
  const observers = [];
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      id, disabled: false, hidden: true, isConnected: true, style: {}, listeners: {},
      setAttribute() {}, contains(target) { return target === this; },
      addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
      getBoundingClientRect() { return { left: 0, top: 0, right: 320, bottom: 58 }; },
      querySelectorAll() { return []; }, focus() {},
    });
    return nodes.get(id);
  }
  const document = node('document');
  document.getElementById = node;
  document.querySelectorAll = () => [];
  const window = node('window');
  const ctx = vm.createContext({
    document, window, Math, Set,
    getI18n: key => key,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout(fn, delay) { const id = nextId++; timers.set(id, { fn, at: time + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    MutationObserver: class { constructor(fn) { observers.push(fn); } observe() {} },
    rememberInterval() { stats.records++; },
  });
  vm.runInContext(source, ctx);
  ctx.openMemoHistory = () => stats.opens++;
  vm.runInContext('initMemoHistory()', ctx);
  const remember = node('remember-btn');
  function emit(target, type, props = {}) {
    const event = { target, currentTarget: target, detail: 1, pointerId: 1, isPrimary: true, button: 0,
      clientX: 20, clientY: 20, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...props };
    for (const listener of target.listeners[type] || []) listener(event);
    return event;
  }
  function down(props) { emit(remember, 'pointerdown', props); emit(document, 'pointerdown', { target: remember, ...props }); }
  function up(props) { emit(document, 'pointerup', { target: remember, ...props }); }
  function click(detail = 1) { ctx.handleRememberClick({ currentTarget: remember, detail, preventDefault() {} }); }
  function advance(ms) {
    const until = time + ms;
    while (true) {
      const due = [...timers].filter(([, task]) => task.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      time = due[1].at; timers.delete(due[0]); due[1].fn();
    }
    time = until;
  }
  return { ctx, stats, node, remember, document, window, emit, down, up, click, advance, observers, storage };
}

let count = 0;
function test(name, action) { action(setup()); count++; console.log(`✓ ${name}`); }
test('549ms release is one short record; no history popup', t => {
  t.down(); t.advance(549); t.up(); t.click(); t.advance(1);
  assert.deepStrictEqual(t.stats, { records: 1, opens: 0 });
});
test('550ms long press opens history; release/click cannot record', t => {
  t.down(); t.advance(550); t.up(); t.click(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 1 });
});
test('short press after a long press works without sticky suppression', t => {
  t.down(); t.advance(550); t.up(); t.click();
  t.down(); t.advance(50); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 1, opens: 1 });
});
test('rapid separate short presses record exactly once each', t => {
  for (let i = 0; i < 3; i++) { t.down(); t.advance(20); t.up(); t.click(); }
  assert.deepStrictEqual(t.stats, { records: 3, opens: 0 });
});
test('10px movement is allowed; more than 10px cancels', t => {
  t.down(); t.emit(t.document, 'pointermove', { clientX: 30 }); t.advance(550); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 1 });
  t.down(); t.emit(t.document, 'pointermove', { clientX: 30.1 }); t.advance(550); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 1 });
});
for (const cause of ['pointercancel', 'scroll', 'blur', 'window-blur', 'visibility', 'leave-bounds']) {
  test(`${cause} cancels both long press and trailing short click`, t => {
    t.down(); t.advance(300);
    if (cause === 'pointercancel') t.emit(t.document, 'pointercancel');
    if (cause === 'scroll') t.emit(t.window, 'scroll');
    if (cause === 'blur') t.emit(t.remember, 'blur');
    if (cause === 'window-blur') t.emit(t.window, 'blur');
    if (cause === 'visibility') { t.document.hidden = true; t.emit(t.document, 'visibilitychange'); }
    if (cause === 'leave-bounds') t.emit(t.document, 'pointermove', { clientY: -1 });
    t.advance(550); t.up(); t.click();
    assert.deepStrictEqual(t.stats, { records: 0, opens: 0 });
  });
}
test('second pointer cancels the initial pending press', t => {
  t.down(); t.advance(300);
  t.emit(t.document, 'pointerdown', { pointerId: 2, isPrimary: false });
  t.advance(550); t.up(); t.up({ pointerId: 2 }); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 0 });
});
test('non-primary pointer cannot start a long or short record', t => {
  t.down({ isPrimary: false }); t.advance(550); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 0 });
});
test('disabled and disabled-mid-press states cannot trigger actions', t => {
  t.remember.disabled = true; t.down(); t.advance(550); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 0 });
  t.remember.disabled = false; t.down(); t.advance(300);
  t.remember.disabled = true; t.observers.forEach(fn => fn());
  t.remember.disabled = false; t.advance(550); t.up(); t.click();
  assert.deepStrictEqual(t.stats, { records: 0, opens: 0 });
});
test('context menu is prevented without consuming the long press', t => {
  t.down(); const event = t.emit(t.remember, 'contextmenu'); t.advance(550); t.up(); t.click();
  assert(event.defaultPrevented);
  assert.deepStrictEqual(t.stats, { records: 0, opens: 1 });
});
test('ArrowDown is an immediate, explicit keyboard history operation', t => {
  const event = t.emit(t.remember, 'keydown', { key: 'ArrowDown' });
  assert(event.defaultPrevented);
  assert.deepStrictEqual(t.stats, { records: 0, opens: 1 });
});
test('keyboard activation records once; held activation key does not repeat', t => {
  t.click(0);
  for (const key of ['Enter', ' ']) assert(t.emit(t.remember, 'keydown', { key, repeat: true }).defaultPrevented);
  assert.deepStrictEqual(t.stats, { records: 1, opens: 0 });
});
test('discovery hint is marked seen once in persistent local settings', t => {
  assert.strictEqual(t.storage.get('remember_history_hint_seen_v1'), '1');
});
console.log(`${count} gesture boundary checks passed.`);
