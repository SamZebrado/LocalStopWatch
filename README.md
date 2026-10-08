# 牛马日记（New Mars Diary） 坚韧如牛，热烈像马
# 🕒 本地网页秒表（Local Stopwatch with Memos）

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=for-the-badge)](https://SamZebrado.github.io/LocalStopWatch/)

[🔗 在线体验地址](https://SamZebrado.github.io/LocalStopWatch/) · 无需下载，直接打开即可使用

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

- `index.html`：主文件（唯一维护入口），双击即可使用<br>
  Main file (single-source maintenance target), open directly to use  
- 当前仓库不包含旧 `stopwatch.html` 跳转入口。<br>
  The old `stopwatch.html` redirect is not included in the current repository.

---

## 🚀 使用方法（How to Use）

1. 用 Chrome 打开 `index.html`（建议使用最新版）<br>
   Open `index.html` with Chrome<br>
2. 使用 Memo 区、标签输入、解析规则来记录 interval  
   Use memo box, tags, and rules to annotate intervals  
3. 使用导出按钮导出 CSV、番茄格式或日志  
   Use export buttons to get CSV, tomato format, or logs  
4. 点击右上角按钮切换中英文界面  
   Switch UI language via the top-right button  
5. 我已上传一个手动整合版本：`index.html`，可直接下载并在其他设备（例如手机）独立使用，无需单独下载其他 js 文件<br>
   I've uploaded a manually merged version: `index.html`, which you can download and use directly on other devices (e.g. your phone), without needing separate JS files.

   在红米 K50 手机上测试，计时与导出功能运行正常；但系统自带浏览器无法解析 Memo 内容，  
   Tested on a Redmi K50: timing and export features work fine, but the default browser fails to parse memos.

   改用 QQ 浏览器后所有功能均可正常使用，看来确实是浏览器兼容性的问题。  
   Switching to QQ Browser fixed everything—so it seems to be a browser compatibility issue.

   原本我打算使用 `mergeJSintoHTML.m`（一个 MATLAB 脚本，也应该可以在 Octave 中运行）来自动整合网页内容，<br>
   I originally planned to use `mergeJSintoHTML.m` (a MATLAB script that should also work in Octave) to automate the merging.

   但脚本目前还有 bug，暂时没修，有空再说吧（逃）🧩  
   But the script still has a bug—I haven’t fixed it yet. Maybe later… 😅

## 🤖 最近事项与 CSV 确认（Recent Items & CSV Confirmation）— 2026-10-08

本次功能由 **CodeX / Codex** 实现与测试，当前为本地待复核改动。

- 主界面轻点「记下」正常记录；长按 550ms 打开最近 10 条不同事项，松手不会再记录。主界面不增加额外按钮。选择后仅回填备注框，仍需轻点「记下」保存。
- 已有记录的编辑框右侧使用历史时钟图标，标签为「最近事项」。回填该记录后沿用原有输入即保存机制，只修改该条备注，不新增记录、不解析或改变计时。撤回记录的入口禁用。
- 按记录结束时间从新到旧选取，排除撤回、空白和已清空记录；恢复撤回后重新可选。相同时间优先采用数组中较后的记录。
- 仅判重时移除尾部「等效」和阿拉伯数字（含小数，可连续出现），显示与回填保留最近一条当前已保存的备注。中间的文字、数字及解析规则保持不变。只剩数字或「等效」的条目用原文判重，避免丢失条目。
- 焦点在「记下」上时按 ↓ / ↑ 直接打开列表，无需模拟长按；已有记录时钟按钮可用 Enter / Space 激活。首次显示轻提示，后续不反复出现。浮层支持关闭按钮、Esc、外部点击、键盘移动与回填。长备注省略显示，完整回填；浮层最多 264px，按可见视窗调整位置，避免覆盖当前输入框和「记下」。
- 移动超过 10px、滚动、pointercancel、失焦、双触点或禁用状态会取消待触发的长按，避免松手误记；触屏系统菜单和蓝色点击高亮被抑制。
- 普通「导出CSV」先确认，文件名仍为 `Uncleared_*.csv`，保留记录。「导出并清空」沿用一层确认，文件名改为 `Cleared_*.csv`，确认后才清空记录与撤回／恢复栈。取消、Esc 或点击弹窗外部均不下载、不清空。浏览器开始下载不代表文件已保存成功，请保管下载文件。

Implemented and tested by **CodeX / Codex**, pending independent review locally. Tap Remember to record; hold it for 550ms or press Arrow Down while focused to open up to ten recent unique active items. Releasing a successful hold never records. Selection fills the main input for editing without saving. Existing record editors have a history-clock button and retain their established input autosave behavior. A one-time hint explains discovery. The compact chooser fits the visible viewport and leaves its target input available. Deduplication removes only trailing “等效” and numeric suffixes from comparison keys; saved text is unchanged. Ordinary CSV export now asks for confirmation and keeps the `Uncleared_` prefix. Export & Clear uses its existing single confirmation with a corrected `Cleared_` prefix. Cancel, Escape, and backdrop dismissal download nothing and preserve data.

验证命令 / Validation:

```sh
npm test
npm run test:memo-export-ui
```

按下方 Development checks 安装仓库已锁定的测试依赖。独立 UI 验证也可用 `PLAYWRIGHT_MODULE` 和 `PLAYWRIGHT_EXECUTABLE_PATH` 指向现有安装；标准 npm 套件使用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 选择现有 Chromium。测试仅使用隔离浏览器内的合成记录，保存桌面／手机截图、合成 CSV 和 `synthetic-preview.html` 到 `test-results/memo-reuse-export/`（可通过 `PREVIEW_DIR` 指定位置）。该 HTML 预览使用内存存储，不读取或修改浏览器中的真实记录；测试结束自动关闭浏览器。

The UI test uses an existing Playwright installation and temporary browser profiles. Its saved standalone HTML preview uses in-memory storage, so opening it does not read or modify real browser records.

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

- 修复了 `mergeJSintoHTML.m` 中 `<script>` 标签替换失败的问题；
- 支持将多个 JS 模块正确嵌入 HTML，适用于打包离线版本；
- 尚未在 Octave 中实际测试；兼容性未验证。

- Fixed a bug in `mergeJSintoHTML.m` where `<script>` tag replacement previously failed;
- Now supports correctly embedding all JS modules into the final HTML for offline use;
- Octave compatibility has not been tested and remains unverified.

### ☁️ 坚果云定时备份（Nutstore Scheduled Backup）- 2026-03-02

- 新增坚果云 WebDAV 配置区：账号、应用密码、远程路径、自动备份间隔（小时）；
- 新增“立即上传备份”按钮；
- 新增自动上传开关，可按小时周期定时上传；
- 远程路径支持子目录（如 `NewMars/LocalStopWatch_backup_latest.json`）；
- 路径会自动 URL 编码，兼容中文目录；
- 更新了 `index.html`，手机单文件版本同步具备以上功能。

- Added Nutstore WebDAV settings: account, app password, remote path, and hourly schedule;
- Added “Upload Backup Now”;
- Added auto-upload toggle with hour-based interval;
- Remote path supports subfolders (e.g. `NewMars/LocalStopWatch_backup_latest.json`);
- Path is URL-encoded automatically for better compatibility with non-ASCII folder names;
- `index.html` is regenerated and includes all new features.

### 🔐 隐私与凭据说明（Privacy & Credentials）

- 坚果云配置保存在浏览器 `localStorage`（设备本地），不会自动写入仓库文件；
- 项目新增 `.gitignore`，用于忽略可能的本地备份/配置 JSON 文件，避免误提交；
- 建议使用“应用密码”而不是主密码。

- Nutstore settings are stored in browser `localStorage` (local device only), not in repo files by default;
- Added `.gitignore` rules to avoid accidentally committing local backup/config JSON artifacts;
- Use an app password rather than your account master password.

### 🧩 维护策略更新（Maintenance Policy Update）- 2026-03-02

- 项目已切换为“单文件维护模式”：后续只改 `index.html`；
- 历史分文件脚本（`timer.js`、`ruleTable.js`、`memoParser.js`、`exportTomato.js`）已从 git 跟踪中删除；
- 当前公开版本使用 `index.html`；旧 `stopwatch.html` 跳转入口已不在仓库中。

- Project now uses single-file maintenance: update `index.html` only;
- Legacy split JS files (`timer.js`, `ruleTable.js`, `memoParser.js`, `exportTomato.js`) are removed from git tracking;
- The current public version uses `index.html`; the old `stopwatch.html` redirect is no longer in the repository.

### 🤖 Codex 更新记录（Codex Update Notes）- 2026-03-02

> 本次功能迭代明确使用了 **CodeX / Codex** 进行实现与测试。
> This round of implementation and testing was done with **CodeX / Codex**.

- 新增“定时提醒下载备份”弹窗：
  - 弹窗会显示“距上次备份已 XX 时间未备份”；
  - 提醒浏览器更新/清理 localStorage 会导致未备份数据丢失；
  - 点击“现在下载备份”将下载 `backup_*.csv`，且不会清空记录。
- 新增“高级模式”按钮（语言按钮下方）：
  - 默认关闭；
  - 仅在开启时显示 `Tag` 与“指定时间（分钟）”输入框；
  - 仅在开启时显示“番茄土豆格式导出”页签（已移动到“运行日志和备份”右侧）。
- “手动备份”和“恢复历史备份”按钮已从计时器页迁移到“运行日志和备份”页，避免误触。
- 外观改为默认深色（黑灰系），移除蓝色主色以降低夜间刺激。
- 因浏览器 CORS 限制，坚果云功能暂时默认隐藏（代码保留，后续可恢复）。
- 高级模式按钮支持“长按打开主题列表”：
  - 可选时髦主题：黑曜、石墨灰、瓷白、钴蓝、琥珀橙、暮紫（不含绿色）；
  - 主题选择会持久化保存。
- `index.html` 已增加手机友好响应式布局：
  - 放大或窄屏时按钮会自动换行，避免超出屏幕。
- `stopwatch_mobile.html` 已从仓库移除，统一由 `index.html` 负责桌面与手机显示。
- 计时器页按钮布局优化：
  - “记下”独占一行并加高加厚，减少误触；
  - “导出并清空记录”和“导出CSV”并排一行。
- “导出CSV”文件名新增 `Uncleared_` 前缀，便于后续自动清理。
- 修复“第一个记录段开始时间”显示逻辑，改为按首条 interval 反推开始时刻。
- 高级模式新增三类字号调节（范围 1-50，持久化）：
  - 非标题文字字号
  - 按钮字号（自动按按钮面积限制最大可用字号）
  - 标题字号
- 新增输入框与按钮高度配置（高级模式）：
  - 输入框字体大小可调（1-50，持久化）
  - 按钮高度分组可调（持久化）：
    - 主组：`计时器`页签 + `记下`按钮
    - 次组：其他按钮
- 页头与导航布局优化：
  - 语言按钮/高级模式按钮位于主标题下方；
  - "计时器"页签单独一行，"定义备注解析规则"与"运行日志和备份"同一行。

### 🤖 更新记录（Update Notes）- 2026-03-18

> 本次功能迭代使用了 **ChatGPT、CodeX 与 TRAE CN** 进行实现与测试。
> This round of implementation and testing was done with **ChatGPT, CodeX & TRAE CN**.

- 优化高级模式按钮交互：
  - 长按高级模式按钮显示/隐藏字体配置面板；
  - 单击仅切换高级/精简模式，不再自动显示字体配置。
- 改进精简模式体验：
  - 解析Memo后以灰色小字显示标签，与"Memo："在同一行；
  - 在Memo输入框右侧显示解析的时间；
  - 优化标签和时间的显示间距，使布局更加美观；
  - 解析后记录不再变白，保持界面一致性。
- 优化解析Memo功能：
  - 移除页面刷新，改为直接更新页面元素；
  - 修复解析Memo后tag输入框和指定时间输入框不更新的问题；
  - 确保实时显示解析结果，提升用户体验。
- 添加开发文档：
  - 创建 `dev_status.md` 文件，包含项目状态、开发计划和更新日志；
  - 记录功能实现和优化过程。

---

Made with ❤️ by Captain Sam, ChatGPT, CodeX & TRAE CN

## 开发验证 / Development checks

当前公开版以 `index.html` 为唯一应用入口。使用 Node.js 22+ 安装锁定的测试依赖；首次测试需要安装 Chromium。
The current public app entry is `index.html`. With Node.js 22+, install the locked test dependencies and Chromium before the first run.

```sh
npm ci --ignore-scripts
npm run install:playwright
npm test
```

`npm test` 覆盖 CSV 往返、统计、备注判重、长按边界，以及 Chromium 中的字号面板、标签展示、文字显示安全和长按交互。独立 UI 验证补充合成数据的桌面／触屏选择器、CSV 确认与下载。缩小可见视窗已验证；尚未在实体手机软键盘上验证。
`npm test` covers CSV round trips, statistics, memo deduplication, gesture boundaries, and Chromium checks for font controls, tags, literal rendering and long press. The separate UI script checks desktop/touch selection and actual CSV downloads with synthetic data. Reduced visible viewports are checked; a physical phone keyboard has not been tested.

Playwright 的临时输出隔离在 `test-results/playwright/`，避免每次运行清理同级的预览交付文件。
Playwright temporary output is scoped to `test-results/playwright/`, preserving sibling preview artifacts between runs.

本仓库尚未声明开源许可证；公开可见不等于授予使用或再分发许可。
No open-source license is declared in this repository; public visibility does not grant reuse or redistribution rights.

### Rendering safety / 内容显示安全

Imported records, memos, tags, custom export prefixes and backup names are displayed as literal text. They cannot supply HTML or event-handler code. Keep exported backups private: they still contain your records.

导入记录、备注、标签、导出前缀和备份名称按普通文字显示，不作为 HTML 或事件处理代码执行。备份仍含有您的记录，请妥善保管。

For an already-installed compatible Chromium, tests can use the optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable. Otherwise use the browser installation command above.
