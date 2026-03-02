# 牛马日记（New Mars Diary） 坚韧如牛，热烈像马 🕒 本地网页秒表（Local Stopwatch with Memos）

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

- `stopwatch_combined.html`：主文件（唯一维护入口），双击即可使用  
  Main file (single-source maintenance target), open directly to use  
- `stopwatch.html`：跳转入口，会自动跳到 `stopwatch_combined.html`  
  Redirect entry that forwards to `stopwatch_combined.html`

---

## 🚀 使用方法（How to Use）

1. 用 Chrome 打开 `stopwatch_combined.html`（建议使用最新版）  
   Open `stopwatch_combined.html` with Chrome  
2. 使用 Memo 区、标签输入、解析规则来记录 interval  
   Use memo box, tags, and rules to annotate intervals  
3. 使用导出按钮导出 CSV、番茄格式或日志  
   Use export buttons to get CSV, tomato format, or logs  
4. 点击右上角按钮切换中英文界面  
   Switch UI language via the top-right button  
5. 我已上传一个手动整合版本：`stopwatchMergedManually.html`，可直接下载并在其他设备（例如手机）独立使用，无需单独下载其他 js 文件  
   I've uploaded a manually merged version: `stopwatchMergedManually.html`, which you can download and use directly on other devices (e.g. your phone), without needing separate JS files.

   在红米 K50 手机上测试，计时与导出功能运行正常；但系统自带浏览器无法解析 Memo 内容，  
   Tested on a Redmi K50: timing and export features work fine, but the default browser fails to parse memos.

   改用 QQ 浏览器后所有功能均可正常使用，看来确实是浏览器兼容性的问题。  
   Switching to QQ Browser fixed everything—so it seems to be a browser compatibility issue.

   原本我打算使用 `combine_html.m`（一个 MATLAB 脚本，也应该可以在 Octave 中运行）来自动整合网页内容，  
   I originally planned to use `combine_html.m` (a MATLAB script that should also work in Octave) to automate the merging.

   但脚本目前还有 bug，暂时没修，有空再说吧（逃）🧩  
   But the script still has a bug—I haven’t fixed it yet. Maybe later… 😅

## 🔧 最近更新（Recent Updates） 4.1.2025 lol

花了好多时间，太可怕了，我感觉有点像恶性成瘾了，希望我的学习和研究也能有这股劲头……

I've spent way too much time on this... borderline addicted. I hope I can bring this level of obsession to my research and studies someday. 😅

### 🈶 多语言按钮增强（Improved Multilingual UI）

- 所有功能按钮支持三种语言切换（中文 / 混合 / 英文）；
- “解析全部”按钮已加入多语言系统，显示随语言自动更新；
- 切换按钮状态始终显示“下一个语言”的名字，避免混淆。

- All action buttons now support three language modes: Chinese / Mixed / English;
- The “Parse All” button is now included in the multilingual system and updates dynamically;
- The language toggle button now clearly shows the **next** language to switch to.

### 🧠 标签解析增强（Smarter Tag Parsing）

- **支持 Memo 尾部数字自动提取为指定时间**（如 “洗脚 3” 会将 `3` 分钟设置为指定时长）；
- **感叹号关键词（如 `!sp`）** 只在 Memo 末尾生效，支持连续出现多个，全部会被删除；
- **否定关键词（如 `~morning`）** 与普通关键词同权，不再优先处理；
- **感叹号关键词命中时如果尚未添加标签，将自动补加该列标签**；
- **普通关键词不再被删除，仅作为标记依据**；
- **空格不再是关键词识别的必要条件**，支持连写识别（如 `lfmdc` 命中多个关键词）；
- **memo 会根据匹配顺序从左至右逐一剔除关键词，避免重叠标签重复命中**。

- **Memo suffix numbers are now parsed as duration** (e.g., “洗脚 3” becomes 3 minutes);
- **Exclamation mark keywords (like `!sp`)** are matched only at the memo suffix, and all matches are deleted;
- **Negation keywords (like `~morning`)** are no longer prioritized over others—they're checked equally;
- If an exclamation keyword matches but its tag hasn't yet been added, the tag will now be included;
- **Normal keywords are never deleted**—they only act as matching cues;
- **Spaces between keywords are no longer required**—concatenated suffixes like `lfmdc` will still match multiple tags;
- Keywords are parsed **from left to right**, ensuring no repeated matches from overlapping segments.

### 💾 数据安全增强（Backup & Conflict Protection）

- **增加自动与手动备份机制**，可保留多个历史版本；
- **支持恢复任意一个备份**，防止误操作或数据丢失；
- **在多个标签页同时打开网页时**，系统会检测版本冲突并弹出警告，避免被旧页面覆盖；
- （尚未修复）从备份中导出的 CSV 文件部分仍有 bug，未来将继续完善。

- **Automatic and manual backups** are now supported, allowing you to save multiple historical versions;
- **You can restore from any backup** to recover from accidental changes;
- **When the stopwatch is opened in multiple browser tabs**, the system checks for version mismatch and warns before saving, to prevent overwriting from outdated pages;
- (Still under repair) CSV export from backups has a known bug and will be improved in future versions.

### 🔧 网页合并脚本更新（HTML Merging Script Updated）

- 修复了 `combine_html.m` 中 `<script>` 标签替换失败的问题；
- 支持将多个 JS 模块正确嵌入 HTML，适用于打包离线版本；
- 尚未在 Octave 中实际测试，但理论上兼容。

- Fixed a bug in `combine_html.m` where `<script>` tag replacement previously failed;
- Now supports correctly embedding all JS modules into the final HTML for offline use;
- Not yet tested in Octave, but expected to be compatible.

### ☁️ 坚果云定时备份（Nutstore Scheduled Backup）- 2026-03-02

- 新增坚果云 WebDAV 配置区：账号、应用密码、远程路径、自动备份间隔（小时）；
- 新增“立即上传备份”按钮；
- 新增自动上传开关，可按小时周期定时上传；
- 远程路径支持子目录（如 `NewMars/LocalStopWatch_backup_latest.json`）；
- 路径会自动 URL 编码，兼容中文目录；
- 更新了 `stopwatch_combined.html`，手机单文件版本同步具备以上功能。

- Added Nutstore WebDAV settings: account, app password, remote path, and hourly schedule;
- Added “Upload Backup Now”;
- Added auto-upload toggle with hour-based interval;
- Remote path supports subfolders (e.g. `NewMars/LocalStopWatch_backup_latest.json`);
- Path is URL-encoded automatically for better compatibility with non-ASCII folder names;
- `stopwatch_combined.html` is regenerated and includes all new features.

### 🔐 隐私与凭据说明（Privacy & Credentials）

- 坚果云配置保存在浏览器 `localStorage`（设备本地），不会自动写入仓库文件；
- 项目新增 `.gitignore`，用于忽略可能的本地备份/配置 JSON 文件，避免误提交；
- 建议使用“应用密码”而不是主密码。

- Nutstore settings are stored in browser `localStorage` (local device only), not in repo files by default;
- Added `.gitignore` rules to avoid accidentally committing local backup/config JSON artifacts;
- Use an app password rather than your account master password.

### 🧩 维护策略更新（Maintenance Policy Update）- 2026-03-02

- 项目已切换为“单文件维护模式”：后续只改 `stopwatch_combined.html`；
- 历史分文件脚本（`timer.js`、`ruleTable.js`、`memoParser.js`、`exportTomato.js`）已从 git 跟踪中删除；
- `stopwatch.html` 保留为跳转入口，避免旧链接失效。

- Project now uses single-file maintenance: update `stopwatch_combined.html` only;
- Legacy split JS files (`timer.js`, `ruleTable.js`, `memoParser.js`, `exportTomato.js`) are removed from git tracking;
- `stopwatch.html` is kept as a redirect entry to preserve old links.

---

Made with ❤️ by Captain Sam & ChatGPT
