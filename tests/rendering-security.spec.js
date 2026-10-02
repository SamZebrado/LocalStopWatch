const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');

test('imported markup stays literal in records, export controls and statistics', async ({ page }) => {
  const payload = `"><img src=x onerror="window.__injected=true">`;
  const tag = `#x');window.__injected=true;//`;
  const itemId = `id');window.__injected=true;//`;
  await page.addInitScript(() => { localStorage.clear(); window.__injected = false; });
  await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
  await page.evaluate(({ payload, tag, itemId }) => {
    intervals = [{ id: itemId, memo: payload, tag, setDuration: payload, durationMs: 60000, endTime: Date.now(), parsed: true }];
    isAdvancedMode = true;
    renderIntervals();
  }, { payload, tag, itemId });
  await expect(page.locator('.interval-record input').nth(0)).toHaveValue(payload);
  await expect(page.locator('.interval-record input').nth(1)).toHaveValue(tag);
  await expect(page.locator('.interval-record img')).toHaveCount(0);
  await page.evaluate(() => { isAdvancedMode = false; renderIntervals(); renderCatExportTab(); });
  const prefixInput = page.locator('#cat-export-tag-filter input[type=text]');
  // Dispatch the real handler without requiring its hidden tab to be open.
  await prefixInput.evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, payload);
  await page.locator('#cat-export-tag-filter input[type=checkbox]').evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
  await expect(page.locator('#cat-export-event-list img')).toHaveCount(0);
  await expect(page.locator('#cat-export-event-list')).toContainText(payload);
  const note = page.locator('#cat-export-event-list textarea');
  await note.evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, payload);
  await expect(note).toHaveValue(payload);
  expect(await page.evaluate(id => catExportNotes[id], itemId)).toBe(payload);
  await page.evaluate((payload) => {
    const stats = { [payload]: { duration: 60000, recordCount: 1 } };
    renderPieChart(stats, Object.entries(stats), false);
    renderBarChart({ '2026-10-02': { [payload]: 60000 } }, ['2026-10-02'], { '2026-10-02': 60000 }, false, 7);
  }, payload);
  await expect(page.locator('#stats-pie img, #stats-bar img')).toHaveCount(0);
  await expect(page.locator('#stats-pie')).toContainText(payload);
  await expect.poll(() => page.evaluate(() => window.__injected)).toBe(false);
});

test('backup keys render literally and export button preserves the key', async ({ page }) => {
  const key = `intervals_manual_'><img src=x onerror="window.__injected=true">`;
  await page.addInitScript(() => { localStorage.clear(); window.__injected = false; });
  await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
  await page.evaluate(key => { localStorage.setItem(key, '[]'); listAllBackups(); window.exportBackupToCSV = value => { window.__exportedKey = value; }; }, key);
  await expect(page.locator('#backup-list')).toContainText(key);
  await expect(page.locator('#backup-list img')).toHaveCount(0);
  await page.locator('#backup-list button').evaluate(el => el.click());
  expect(await page.evaluate(() => window.__exportedKey)).toBe(key);
  expect(await page.evaluate(() => window.__injected)).toBe(false);
});
