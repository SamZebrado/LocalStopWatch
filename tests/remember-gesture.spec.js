const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('intervals', JSON.stringify([
      { id: 'synthetic-a', memo: '整理文件等效20', endTime: Date.now() - 60000, durationMs: 60000, withdrawn: false },
      { id: 'synthetic-b', memo: '整理文件30', endTime: Date.now() - 30000, durationMs: 30000, withdrawn: false },
    ]));
    localStorage.setItem('lang', 'zh');
  });
  await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
});

async function mouseDownOnRemember(page) {
  const rect = await page.locator('#remember-btn').boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  return rect;
}

test('real long press cannot emit a short record on release; subsequent short press records once', async ({ page }) => {
  const before = await page.evaluate(() => ({ count: intervals.length, last: t_Last, stored: localStorage.getItem('intervals') }));
  await mouseDownOnRemember(page);
  await expect(page.locator('#memo-history-panel')).toBeVisible();
  await page.mouse.up();
  expect(await page.evaluate(() => ({ count: intervals.length, last: t_Last, stored: localStorage.getItem('intervals') }))).toEqual(before);
  await expect(page.locator('.memo-history-choice')).toHaveCount(1);
  await page.locator('.memo-history-choice').click();
  await expect(page.locator('#memo-input')).toHaveValue('整理文件30');
  await page.locator('#remember-btn').click();
  expect(await page.evaluate(() => intervals.length)).toBe(before.count + 1);
  await expect(page.locator('#memo-input')).toHaveValue('');
});

test('moving off the button cancels a pending hold; keyboard history remains accessible', async ({ page }) => {
  const before = await page.evaluate(() => intervals.length);
  const rect = await mouseDownOnRemember(page);
  await page.mouse.move(rect.x + 20, rect.y - 20);
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(page.locator('#memo-history-panel')).toBeHidden();
  expect(await page.evaluate(() => intervals.length)).toBe(before);
  await page.locator('#remember-btn').press('ArrowDown');
  await expect(page.locator('.memo-history-choice')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#remember-btn')).toBeFocused();
  expect(await page.evaluate(() => intervals.length)).toBe(before);
});

test('disabled-mid-hold and focus loss suppress trailing clicks', async ({ page }) => {
  const before = await page.evaluate(() => intervals.length);
  await mouseDownOnRemember(page);
  await page.locator('#remember-btn').evaluate(el => { el.disabled = true; });
  await page.waitForTimeout(600);
  await page.locator('#remember-btn').evaluate(el => { el.disabled = false; });
  await page.mouse.up();
  await expect(page.locator('#memo-history-panel')).toBeHidden();
  expect(await page.evaluate(() => intervals.length)).toBe(before);
  await mouseDownOnRemember(page);
  await page.locator('#memo-input').focus();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(page.locator('#memo-history-panel')).toBeHidden();
  expect(await page.evaluate(() => intervals.length)).toBe(before);
});
