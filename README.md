# 🕒 本地网页秒表（Local Stopwatch with Memos）

我非常欣赏 [on-line stopwatch](https://stopwatch.online-timers.com/stopwatch-with-time-intervals)，但有时我希望在离线状态下使用支持备注和标签的秒表。  
I really admire the [on-line stopwatch](https://stopwatch.online-timers.com/stopwatch-with-time-intervals), but sometimes I need an offline stopwatch with memo and tag support.

于是我和 ChatGPT 合作制作了这个版本。  
So I built this one together with ChatGPT.

第一次尝试失败了，我们在一些小细节上卡住了。ChatGPT 一直在道歉却从未成功帮我实现我想要的功能。  
The first attempt failed—we got stuck in many little details. ChatGPT kept apologizing but never quite delivered what I needed.

当然我那天状态也不好，可能是前额叶麻痹了（笑），我花了大量时间和 GPT 扭在一起，却没意识到“换个对话”可能才是最简单的解法。  
To be fair, I wasn’t in the best mood either—maybe my prefrontal cortex was offline, lol. I spent way too long tangled in that one thread without realizing that just starting over might help.

于是我刻意让自己不要再用 GPT 编程，直到几天后工作告一段落、心情转好，我才重拾这个项目。  
So I deliberately stopped using GPT for coding, until a few days later—when work was done and I was in a better mindset—I returned to it.

我请第一个对话的 GPT 帮我写了一份需求总结文档，然后开启了一个新的对话。  
I asked the original GPT to help me draft a spec document, and then started a brand-new conversation.

我是在 B 站视频 [普通人也可以看的 AI 编程指南](https://www.bilibili.com/video/BV1yorUYWEGD/) 中学到这个做法的：把设计需求与代码实现分开。  
I got this idea from a [Bilibili video on AI programming](https://www.bilibili.com/video/BV1yorUYWEGD/): separate design from implementation.

这一回进展顺利得多，终于，我做出了我想要的网页 😂  
That second time went way more smoothly. Finally—I got what I wanted 😭

---

## ✅ 功能亮点（Features）

- 离线网页秒表，支持备注、标签与多段 Interval  
  Offline stopwatch with memo, tag, and multi-interval support  
- 刷新网页后数据不丢失，所有内容保存在浏览器  
  Data is stored in localStorage and survives page reload  
- 支持 Memo 解析规则，自动打标签  
  Custom parsing rules for automated tagging  
- 支持导出 CSV 与“番茄土豆格式”  
  Export to CSV and tomato-potato format  
- 支持运行日志记录与刷新  
  Log refresh history and interval end times  
- 支持中英文界面切换  
  Bilingual UI: 中文 / English  
- 无需联网，无需服务器，直接双击网页即可使用  
  No network or server needed. Just open the HTML file.

---

## 📁 文件说明（Files）

- `stopwatch.html`：主网页文件，双击即可使用  
  The main offline stopwatch web page  
- `combine_html.m`：MATLAB 脚本，用于将多个 JS 合并为单个 HTML  
  MATLAB script to combine all JS into a single HTML file  
  ✅ 该脚本也可在 Octave 中运行（已测试通过）  
  ✅ This script also works in [GNU Octave](https://www.gnu.org/software/octave/)

---

## 🚀 使用方法（How to Use）

1. 用 Chrome 打开 `stopwatch.html`（建议使用最新版）  
   Open `stopwatch.html` with Chrome  
2. 使用 Memo 区、标签输入、解析规则来记录 interval  
   Use memo box, tags, and rules to annotate intervals  
3. 使用导出按钮导出 CSV、番茄格式或日志  
   Use export buttons to get CSV, tomato format, or logs  
4. 点击右上角按钮切换中英文界面  
   Switch UI language via the top-right button  
5. 如需重新打包合并 HTML，可运行 `combine_html.m`  （目前故障，但是我准备了一个手动整合的版本“stopwatchMergedManually.html”；安卓手机上测试计时和导出功能可以运行，但是）
   If you wish to repackage the HTML, run `combine_html.m` （has bug; to be debugged later; but I've uploaded a manually merged one， “stopwatchMergedManually.html”）

---

Made with ❤️ by Captain Sam & ChatGPT
