// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Local Stopwatch Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到本地文件
    await page.goto('file:///Users/samzebrado/Library/CloudStorage/GoogleDrive-sz68@nyu.edu/My Drive/Personal/PersonalCoding/LocalStopWatch/stopwatch_combined.html');
  });

  test('测试长按高级模式按钮显示字体配置', async ({ page }) => {
    // 检查初始状态下字体配置是否隐藏
    const fontSizeControl = page.locator('#font-size-control');
    await expect(fontSizeControl).toBeHidden();

    // 长按高级模式按钮
    const advancedToggle = page.locator('#advanced-toggle');
    await advancedToggle.click(); // 先切换到高级模式
    
    // 长按按钮显示字体配置
    await advancedToggle.dispatchEvent('mousedown');
    await page.waitForTimeout(600); // 等待长按触发
    await advancedToggle.dispatchEvent('mouseup');

    // 检查字体配置是否显示
    await expect(fontSizeControl).toBeVisible();

    // 再次长按隐藏字体配置
    await advancedToggle.dispatchEvent('mousedown');
    await page.waitForTimeout(600); // 等待长按触发
    await advancedToggle.dispatchEvent('mouseup');

    // 检查字体配置是否隐藏
    await expect(fontSizeControl).toBeHidden();
  });

  test('测试精简模式下显示解析后标签', async ({ page }) => {
    // 确保在精简模式下
    const advancedToggle = page.locator('#advanced-toggle');
    const currentText = await advancedToggle.textContent();
    if (currentText.includes('精简模式')) {
      await advancedToggle.click(); // 切换到精简模式
    }

    // 添加一条记录
    await page.fill('#memo-input', '测试备注');
    await page.click('button:has-text("记下")');

    // 解析Memo
    await page.click('button:has-text("解析Memo")');

    // 检查是否显示标签
    const intervalRecord = page.locator('.interval-record');
    await expect(intervalRecord).toContainText('标签');
  });
});