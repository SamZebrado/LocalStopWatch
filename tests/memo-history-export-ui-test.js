// Run with the installed Playwright module; optional PLAYWRIGHT_MODULE and
// PLAYWRIGHT_EXECUTABLE_PATH let reviewers reuse an existing browser installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('assert');

const appPath = path.resolve(__dirname, '..', 'index.html');
const output = path.resolve(process.env.PREVIEW_DIR || path.join(__dirname, '..', 'test-results', 'memo-reuse-export'));
fs.mkdirSync(output, { recursive: true });
const baseTime = Date.now() - 3 * 60 * 60 * 1000;
const sampleMemos = [
  '晨间整理', '整理书桌', '阅读第2章 10', '散步与拉伸', '回复邮件', '整理笔记',
  '午后休息', '准备晚餐', '练习写作', '记录今日计划', '听音乐放松', '检查待办清单',
];
const memoTexts = [
  ...sampleMemos,
  ...Array.from({ length: 12 }, (_, i) => `阅读第2章 等效${i + 11}`),
  '合成示例：复盘今天的小进展，并把明天想继续完成的事项写进备注；这条长备注用于验证省略显示与完整回填。',
];
const records = memoTexts.map((memo, i) => ({
  id: `synthetic-${i}`, memo, tag: '', duration: '00:05:00.000', durationMs: 300000,
  endTime: baseTime + i * 300000, setDuration: '', parsed: false,
  withdrawn: false, withdrawnAt: null,
}));
records.push({ ...records.at(-1), id: 'synthetic-withdrawn', memo: '已撤回的合成备注', withdrawn: true, endTime: baseTime + 9000000 });

const checks = [];
const check = (label, condition) => { assert(condition, label); checks.push(label); };
async function state(page) {
  return page.evaluate(() => JSON.stringify({
    intervals, undoStack, redoStack, t_Initial, t_Last,
    storedIntervals: localStorage.getItem('intervals'),
    storedUndo: localStorage.getItem('undoStack'), storedRedo: localStorage.getItem('redoStack'),
  }));
}
async function openPage(browser, viewport, mobile = false) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  await context.addInitScript(({ records }) => {
    if (localStorage.getItem('synthetic_test_seeded') === '1') return;
    localStorage.clear();
    localStorage.setItem('intervals', JSON.stringify(records));
    localStorage.setItem('t_Initial', String(records[0].endTime - records[0].durationMs));
    localStorage.setItem('t_Last', String(Date.now() - 240000));
    localStorage.setItem('lang', 'zh');
    localStorage.setItem('synthetic_test_seeded', '1');
  }, { records });
  const page = await context.newPage();
  await page.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(appPath).href);
  await page.locator('#remember-btn').waitFor();
  return { context, page, errors };
}
async function visibleBounds(page, selector) {
  const rect = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width + 1 && rect.y + rect.height <= viewport.height + 1;
}
async function mouseHold(page, delay = 600) {
  const remember = page.locator('#remember-btn');
  await remember.scrollIntoViewIfNeeded();
  const box = await remember.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(delay);
  await page.mouse.up();
}
async function touchHold(page, delay = 600) {
  await page.locator('#remember-btn').scrollIntoViewIfNeeded();
  const box = await page.locator('#remember-btn').boundingBox();
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
    await page.waitForTimeout(delay);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally { await session.detach(); }
}
async function settled(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

(async () => {
  const launch = { headless: true };
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) launch.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  const browser = await chromium.launch(launch);
  try {
    const { context, page, errors } = await openPage(browser, { width: 1280, height: 1000 });
    const panel = page.locator('#memo-history-panel');
    const toggle = page.locator('#remember-btn');
    const choices = page.locator('.memo-history-choice');
    check('Main memo input has no extra plus button', await page.locator('#memo-history-toggle').count() === 0);
    check('One-time hint explains long press and keyboard operation', await page.locator('#remember-history-hint').isVisible());
    await page.screenshot({ path: path.join(output, 'desktop-main.png') });
    const beforePick = await state(page);
    await mouseHold(page);
    check('Real mouse long press and release open history without recording', await panel.isVisible() && await state(page) === beforePick);
    check('Desktop shows ten unique memos beyond recent duplicates', await choices.count() === 10);
    check('Newest raw memo displayed first', await choices.first().textContent() === memoTexts.at(-1));
    check('Withdrawn memo excluded', !(await choices.allTextContents()).includes('已撤回的合成备注'));
    check('Long memo uses ellipsis', await choices.first().evaluate(el => getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth));
    check('Desktop popup stays in viewport', await visibleBounds(page, '#memo-history-panel'));
    await page.screenshot({ path: path.join(output, 'desktop-memo-history.png') });
    await choices.first().click();
    check('Selection fills entire original memo', await page.inputValue('#memo-input') === memoTexts.at(-1));
    check('Selection returns focus and caret to editable input', await page.locator('#memo-input').evaluate(el => document.activeElement === el && el.selectionStart === el.value.length));
    check('Selection closes popup and preserves history/clock/storage', !await panel.isVisible() && await state(page) === beforePick);
    await page.fill('#memo-input', '可以继续编辑的合成备注');
    check('Reused memo remains editable', await page.inputValue('#memo-input') === '可以继续编辑的合成备注');
    await page.reload();
    check('Discovery hint is not shown again after reload', !await page.locator('#remember-history-hint').isVisible());
    await toggle.press('ArrowDown'); await page.click('#memo-history-close');
    check('Explicit close dismisses history', !await panel.isVisible());
    await toggle.press('ArrowDown'); await page.keyboard.press('Escape');
    check('Escape closes popup and restores toggle focus', !await panel.isVisible() && await toggle.evaluate(el => document.activeElement === el));
    await toggle.press('ArrowDown');
    check('ArrowDown on toggle opens and focuses first choice', await choices.first().evaluate(el => document.activeElement === el));
    await page.keyboard.press('End');
    check('End focuses last choice', await choices.last().evaluate(el => document.activeElement === el));
    await page.keyboard.press('Tab');
    check('Tab from last choice closes popup without trapping focus', !await panel.isVisible() && await panel.evaluate(el => !el.contains(document.activeElement)));
    await toggle.press('ArrowUp');
    check('ArrowUp on toggle opens and focuses last choice', await choices.last().evaluate(el => document.activeElement === el));
    await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown');
    check('Arrow keys move among choices', await choices.nth(1).evaluate(el => document.activeElement === el));
    await page.keyboard.press('Enter');
    check('Keyboard activation only fills memo', !await panel.isVisible() && await state(page) === beforePick);
    await toggle.press('ArrowDown'); await page.locator('h1').click();
    check('Outside click closes popup', !await panel.isVisible());
    await toggle.press('ArrowDown');
    await page.locator('#export-csv-btn').focus();
    check('Focus leaving popup closes without trapping keyboard', !await panel.isVisible());

    for (const [lang, label] of [['mix', '记下；长按或按向下键打开最近事项'], ['en', 'Remember; hold or press Arrow Down for recent items'], ['zh', '记下；长按或按向下键打开最近事项']]) {
      await page.click('#lang-toggle');
      check(`History button label follows ${lang}`, await toggle.getAttribute('aria-label') === label);
    }
    check('Advanced controls remain hidden by default', !await page.locator('#tab-export-btn').isVisible());
    await page.click('#advanced-toggle');
    check('Advanced mode still exposes Tomato Export', await page.locator('#tab-export-btn').isVisible());
    await page.click('#advanced-toggle');

    await page.fill('#memo-input', '刚记下的合成备注 99');
    const countBeforeSave = await page.evaluate(() => intervals.length);
    await page.locator('#remember-btn').click();
    check('One short click creates exactly one timer record', await page.evaluate(() => intervals.length) === countBeforeSave + 1);
    await toggle.press('ArrowDown');
    check('Newly saved memo appears immediately', await choices.first().textContent() === '刚记下的合成备注 99');
    await page.keyboard.press('Escape');
    await page.click('#undo-last-btn'); await toggle.press('ArrowDown');
    check('Undo excludes new withdrawn memo', !(await choices.allTextContents()).includes('刚记下的合成备注 99'));
    await page.keyboard.press('Escape');
    await page.click('#redo-last-btn'); await toggle.press('ArrowDown');
    check('Redo restores memo to reuse history', await choices.first().textContent() === '刚记下的合成备注 99');
    await page.keyboard.press('Escape');

    // Record editors use the same chooser while preserving their input-save convention.
    const recordButton = page.locator('.record-memo-history:not([disabled])').first();
    const editor = recordButton.locator('..').locator('input');
    const editIndex = Number(await recordButton.getAttribute('data-index'));
    const beforeEditor = await page.evaluate(() => ({ count: intervals.length, last: t_Last, initial: t_Initial, tags: intervals.map(r => r.tag) }));
    await recordButton.click();
    await page.screenshot({ path: path.join(output, 'desktop-record-history.png') });
    const chosenEditorMemo = await choices.nth(1).textContent();
    await choices.nth(1).click();
    check('Clock chooser fills the targeted record editor', await editor.inputValue() === chosenEditorMemo);
    check('Record selection follows existing autosave without a timer record', await page.evaluate(({ editIndex, chosenEditorMemo, beforeEditor }) => intervals[editIndex].memo === chosenEditorMemo && JSON.parse(localStorage.getItem('intervals'))[editIndex].memo === chosenEditorMemo && intervals.length === beforeEditor.count && t_Last === beforeEditor.last && t_Initial === beforeEditor.initial && JSON.stringify(intervals.map(r => r.tag)) === JSON.stringify(beforeEditor.tags), { editIndex, chosenEditorMemo, beforeEditor }));
    await recordButton.click(); await page.click('#memo-history-close');
    check('Record chooser closes and restores its clock button focus', await recordButton.evaluate(el => document.activeElement === el));
    const disabledEditor = page.locator('.record-memo-history[disabled]').first();
    await disabledEditor.evaluate(el => el.click());
    check('Withdrawn record history entry stays disabled', !await panel.isVisible());

    // Cancel, native Escape, backdrop, repeated confirmations, and actual file downloads.
    const downloads = [];
    page.on('download', download => downloads.push(download));
    const beforeExport = await state(page);
    const csvDialog = page.locator('#confirm-csv-dialog');
    const clearDialog = page.locator('#confirm-clear-dialog');
    for (const [button, dialog] of [['#export-csv-btn', csvDialog], ['#export-clear-btn', clearDialog]]) {
      await page.click(button);
      check(`${button} opens one modal without download`, await dialog.isVisible() && downloads.length === 0);
      check(`${button} initial focus goes to Cancel`, await dialog.getByRole('button', { name: '取消', exact: true }).evaluate(el => document.activeElement === el));
      await dialog.getByRole('button', { name: '取消', exact: true }).click();
      await page.click(button); await page.keyboard.press('Escape');
      await page.click(button); await page.mouse.click(2, 2);
      await settled(page);
      check(`${button} Cancel/Esc/backdrop preserves data and downloads nothing`, !await dialog.isVisible() && downloads.length === 0 && await state(page) === beforeExport);
    }
    await page.click('#export-csv-btn');
    await page.screenshot({ path: path.join(output, 'desktop-csv-confirmation.png') });
    const normalDownload = page.waitForEvent('download');
    await page.click('#confirm-csv-download');
    await page.evaluate(() => { exportConfirmedCSV(); exportConfirmedCSV(); });
    const normalFile = await normalDownload;
    check('Confirmed ordinary export uses Uncleared prefix', /^Uncleared_.*\.csv$/.test(normalFile.suggestedFilename()));
    await normalFile.saveAs(path.join(output, 'synthetic-uncleared.csv'));
    await settled(page);
    check('Repeated ordinary confirmation produces one actual download, keeps data', downloads.length === 1 && await state(page) === beforeExport);
    check('Ordinary CSV contains synthetic active records and excludes withdrawn', fs.readFileSync(path.join(output, 'synthetic-uncleared.csv'), 'utf8').includes(chosenEditorMemo) && !fs.readFileSync(path.join(output, 'synthetic-uncleared.csv'), 'utf8').includes('已撤回的合成备注'));
    await page.click('#export-csv-btn'); await page.keyboard.press('Escape');
    check('Can reopen and cancel after ordinary download', downloads.length === 1 && !await csvDialog.isVisible());
    await page.click('#lang-toggle'); await page.click('#lang-toggle');
    await page.click('#export-csv-btn');
    check('Ordinary dialog follows English UI', await csvDialog.getByRole('button', { name: 'Download CSV', exact: true }).isVisible());
    await page.keyboard.press('Escape');
    await page.click('#export-clear-btn');
    check('Clear dialog follows English UI', await clearDialog.getByRole('button', { name: '✅ Confirm Export & Clear', exact: true }).isVisible());
    await page.keyboard.press('Escape'); await page.click('#lang-toggle');
    await page.click('#export-clear-btn');
    const clearDownload = page.waitForEvent('download');
    await page.click('#confirm-clear-download');
    await page.evaluate(() => { exportThenClear(); exportThenClear(); });
    const clearFile = await clearDownload;
    check('Clear export filename starts Cleared, never Uncleared', /^Cleared_.*\.csv$/.test(clearFile.suggestedFilename()));
    await clearFile.saveAs(path.join(output, 'synthetic-cleared.csv'));
    await settled(page);
    check('Clear confirmation produces one actual download and no extra prompt', downloads.length === 2 && !await csvDialog.isVisible() && !await clearDialog.isVisible());
    check('Only confirmed clear empties records and undo/redo', await page.evaluate(() => intervals.length === 0 && undoStack.length === 0 && redoStack.length === 0 && localStorage.getItem('intervals') === '[]'));
    await toggle.press('ArrowDown');
    check('Cleared/deleted records do not persist in picker', await choices.count() === 0 && await page.locator('#memo-history-empty').isVisible());
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      window.__memoInjected = false;
      intervals = [{ id: 'synthetic-literal', memo: '<img src=x onerror="window.__memoInjected=true">', durationMs: 60000, endTime: Date.now(), withdrawn: false }];
      renderIntervals();
    });
    await toggle.press('ArrowDown');
    check('Recent item text remains literal without injected markup', await page.locator('#memo-history-list img').count() === 0 && await choices.first().textContent() === '<img src=x onerror="window.__memoInjected=true">' && !await page.evaluate(() => window.__memoInjected));
    await page.keyboard.press('Escape');
    check('Desktop produced no runtime errors', errors.length === 0);
    await context.close();

    const mobile = await openPage(browser, { width: 390, height: 844 }, true);
    await mobile.page.screenshot({ path: path.join(output, 'mobile-main.png') });
    const mobileBeforeLong = await state(mobile.page);
    await touchHold(mobile.page);
    check('Real touch long press release never records', await state(mobile.page) === mobileBeforeLong);
    check('Mobile popup opens above input when space is short', await mobile.page.locator('#memo-history-panel').evaluate(el => el.dataset.placement === 'above'));
    check('Mobile popup is smaller than the previous half-screen design', (await mobile.page.locator('#memo-history-panel').boundingBox()).height <= 264);
    check('Mobile popup fits viewport', await visibleBounds(mobile.page, '#memo-history-panel'));
    check('Mobile list scrolls within popup', await mobile.page.locator('#memo-history-list').evaluate(el => el.scrollHeight > el.clientHeight));
    await mobile.page.screenshot({ path: path.join(output, 'mobile-memo-history.png') });
    await mobile.page.locator('.memo-history-choice').first().tap();
    check('Mobile tap fills entire original memo', await mobile.page.inputValue('#memo-input') === memoTexts.at(-1));
    await mobile.page.click('#export-csv-btn');
    check('Mobile CSV dialog fits viewport', await visibleBounds(mobile.page, '#confirm-csv-dialog'));
    await mobile.page.screenshot({ path: path.join(output, 'mobile-csv-confirmation.png') });
    await mobile.page.keyboard.press('Escape');
    const mobileRecordButton = mobile.page.locator('.record-memo-history:not([disabled])').first();
    await mobileRecordButton.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await mobileRecordButton.tap();
    check('Mobile record history opens without covering its editor', await mobile.page.evaluate(() => {
      const panel = document.getElementById('memo-history-panel').getBoundingClientRect();
      const input = memoHistoryTarget.getBoundingClientRect();
      return panel.bottom <= input.top || panel.top >= input.bottom;
    }));
    await mobile.page.screenshot({ path: path.join(output, 'mobile-record-history.png') });
    await mobile.page.keyboard.press('Escape');
    await mobile.page.click('#export-clear-btn');
    check('Mobile clear dialog fits viewport', await visibleBounds(mobile.page, '#confirm-clear-dialog'));
    await mobile.page.keyboard.press('Escape');
    for (const width of [320, 360, 430]) {
      await mobile.page.setViewportSize({ width, height: 844 });
      await mobile.page.locator('#remember-btn').press('ArrowDown');
      const fits = await visibleBounds(mobile.page, '#memo-history-panel') && await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      check(`Picker does not overflow at ${width}px`, fits);
      await mobile.page.keyboard.press('Escape');
    }
    await mobile.page.setViewportSize({ width: 320, height: 520 });
    await mobile.page.locator('#remember-btn').press('ArrowDown');
    check('Reduced visible viewport keeps chooser within bounds', await visibleBounds(mobile.page, '#memo-history-panel'));
    check('Reduced visible viewport keeps memo and Remember available', await mobile.page.evaluate(() => {
      const panel = document.getElementById('memo-history-panel').getBoundingClientRect();
      const input = document.getElementById('memo-input').getBoundingClientRect();
      const button = document.getElementById('remember-btn').getBoundingClientRect();
      return panel.bottom <= input.top || panel.top >= button.bottom;
    }));
    await mobile.page.keyboard.press('Escape');
    check('Mobile produced no runtime errors', mobile.errors.length === 0);
    await mobile.context.close();

    // A standalone local preview uses an in-memory Storage facade, so opening
    // it cannot read or write the user's real browser records.
    const seed = JSON.stringify(records).replace(/</g, '\\u003c');
    const isolatedStorage = `<script>\n(() => {\n const values = new Map();\n const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), key: i => [...values.keys()][i] ?? null, get length() { return values.size; } };\n Object.defineProperty(window, 'localStorage', { value: storage });\n storage.setItem('intervals', JSON.stringify(${seed}));\n storage.setItem('t_Initial', String(Date.now() - 3600000));\n storage.setItem('t_Last', String(Date.now() - 240000));\n storage.setItem('lang', 'zh');\n window.addEventListener('load', () => openMemoHistory());\n})();\n</script>\n`;
    const preview = fs.readFileSync(appPath, 'utf8').replace('  <script>\n// timer.js', `${isolatedStorage}  <script>\n// timer.js`).replace('<body>', '<body>\n  <p style="color:var(--muted);font-size:14px;">合成数据预览 · Synthetic data · 浏览器记录不会被读取或修改</p>');
    const previewPath = path.join(output, 'synthetic-preview.html');
    fs.writeFileSync(previewPath, preview);
    const previewContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const previewPage = await previewContext.newPage();
    await previewPage.goto(pathToFileURL(previewPath).href);
    check('Saved preview works with isolated in-memory records', await previewPage.locator('.memo-history-choice').count() === 10 && await previewPage.evaluate(() => localStorage.getItem('intervals').includes('synthetic-0')));
    await previewContext.close();
    fs.writeFileSync(path.join(output, 'ui-results.json'), JSON.stringify({ passed: checks.length, checks, downloads: [normalFile.suggestedFilename(), clearFile.suggestedFilename()], browserClosed: true, data: 'synthetic only' }, null, 2));
    console.log(`${checks.length} browser checks passed. Synthetic previews saved in ${output}.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
