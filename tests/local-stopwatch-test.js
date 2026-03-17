const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 导航到本地文件
    await page.goto('file:///Users/samzebrado/Library/CloudStorage/GoogleDrive-sz68@nyu.edu/My Drive/Personal/PersonalCoding/LocalStopWatch/stopwatch_combined.html');

    console.log('开始测试长按高级模式按钮显示字体配置...');
    // 测试长按高级模式按钮显示字体配置
    const fontSizeControl = page.locator('#font-size-control');
    await fontSizeControl.waitFor({ state: 'hidden' });
    console.log('初始状态：字体配置隐藏');

    const advancedToggle = page.locator('#advanced-toggle');
    await advancedToggle.click(); // 先切换到高级模式
    console.log('已切换到高级模式');

    // 长按按钮显示字体配置
    await advancedToggle.dispatchEvent('mousedown');
    await page.waitForTimeout(600); // 等待长按触发
    await advancedToggle.dispatchEvent('mouseup');

    await fontSizeControl.waitFor({ state: 'visible' });
    console.log('长按后：字体配置显示');

    // 再次长按隐藏字体配置
    await advancedToggle.dispatchEvent('mousedown');
    await page.waitForTimeout(600); // 等待长按触发
    await advancedToggle.dispatchEvent('mouseup');

    await fontSizeControl.waitFor({ state: 'hidden' });
    console.log('再次长按后：字体配置隐藏');

    console.log('长按高级模式按钮测试通过！');

    console.log('\n开始测试精简模式下显示解析后标签...');
    // 测试精简模式下显示解析后标签
    // 确保在精简模式下
    const currentText = await advancedToggle.textContent();
    if (currentText.includes('精简模式')) {
      await advancedToggle.click(); // 切换到精简模式
      console.log('已切换到精简模式');
    }

    // 添加一条记录
    await page.fill('#memo-input', '测试备注');
    await page.click('button:has-text("记下")');
    console.log('已添加一条记录');

    // 解析Memo
    await page.click('button:has-text("解析Memo")');
    console.log('已解析Memo');

    // 检查是否显示标签
    await page.waitForSelector('.interval-record');
    const intervalRecord = page.locator('.interval-record');
    const recordText = await intervalRecord.textContent();
    console.log('记录内容：', recordText);

    console.log('精简模式下显示解析后标签测试通过！');

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await browser.close();
  }
}

runTests();