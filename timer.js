// timer.js

let t_Initial = Number(localStorage.getItem('t_Initial')) || Date.now();
let t_Last = Number(localStorage.getItem('t_Last')) || t_Initial;
let intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
let logs = JSON.parse(localStorage.getItem('logs') || '[]');

function pad(n, z = 2) { return ('00' + n).slice(-z); }

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  let fraction = Math.floor((ms % 1000));
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(fraction).padStart(3, '0')}`;
}

function formatDateWithTimezone(date) {
  const dateStr = date.toLocaleString(undefined, { timeZoneName: 'short' });
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${dateStr}.${ms}`;
}

function exportIntervalsToCSV() {
  if (!intervals.length) {
    alert(getI18n('noRecords'));
    return;
  }

  const rows = [
    ['持续时间（分钟）', '格式化时间', '备注', '标签', '结束时间']
  ];

  intervals.forEach(item => {
    const mins = item.durationMs ? (item.durationMs / 60000).toFixed(2) : '';
    const endTimeStr = formatDateWithTimezone(new Date(item.endTime));
    rows.push([
      mins,
      item.duration || '',
      item.memo || '',
      item.tag || '',
      endTimeStr
    ]);
  });

  const csv = rows.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const now = new Date();
  const filename = `${now.toLocaleTimeString().replace(/:/g, '：')} ${now.toLocaleDateString()} ${Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).format(now).split(' ').pop()}.csv`;

  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function updateDisplay() {
  const now = Date.now();
  const elapsed = now - t_Last;

  document.getElementById('current-duration').textContent = formatTime(elapsed);
  document.getElementById('absolute-time').textContent = new Date(now).toLocaleTimeString();
  document.getElementById('absolute-date').textContent = new Date(now).toLocaleDateString();
  document.getElementById('initial-time').textContent = new Date(t_Initial).toLocaleTimeString();
  document.getElementById('initial-date').textContent = new Date(t_Initial).toLocaleDateString();

  requestAnimationFrame(updateDisplay);
}

function renderIntervals() {
  const container = document.getElementById('intervals-container');
  container.innerHTML = '';

  intervals.slice().reverse().forEach((item, index) => {
    const trueIndex = intervals.length - 1 - index;
    const div = document.createElement('div');
    div.className = 'interval-record';
    const mins = item.durationMs ? (item.durationMs / 60000).toFixed(2) : '--';
    const endTimeStr = formatDateWithTimezone(new Date(item.endTime));
    div.innerHTML = `
      <div><strong class="duration">${mins} 分钟</strong></div>
      <div>Tag: <input value="${item.tag || ''}" oninput="updateTag(${trueIndex}, this.value)"></div>
      <div>Memo: <input value="${item.memo}" oninput="updateMemo(${trueIndex}, this.value)"></div>
      <div>指定时间（分钟）: <input type="number" value="${item.setDuration || ''}" oninput="updateSetDuration(${trueIndex}, this.value)"></div>
      <div>结束时间: ${endTimeStr}</div>
      <button onclick="parseMemo(${trueIndex})">解析Memo</button>
      <button onclick="undoParse(${trueIndex})">撤销</button>
    `;
    if (item.parsed) div.style.background = '#eee';
    container.appendChild(div);
  });
}

function rememberInterval() {
  const now = Date.now();
  const localCopy = JSON.parse(localStorage.getItem('intervals') || '[]');
  if (localCopy.length > intervals.length) {
    alert(getI18n('outdatedWarning'));
    return;
  }

  const durationMs = now - t_Last;
  const memo = document.getElementById('memo-input').value.trim();

  const item = {
    memo,
    tag: '',
    duration: formatTime(durationMs),
    durationMs,
    endTime: now,
    setDuration: '',
    originalMemo: memo,
    parsed: false
  };

  intervals.push(item);
  localStorage.setItem('intervals', JSON.stringify(intervals));

  document.getElementById('memo-input').value = '';

  t_Last = now;
  localStorage.setItem('t_Last', t_Last);
  renderIntervals();
}

function updateTag(index, value) {
  intervals[index].tag = value;
  localStorage.setItem('intervals', JSON.stringify(intervals));
}

function updateMemo(index, value) {
  intervals[index].memo = value;
  localStorage.setItem('intervals', JSON.stringify(intervals));
}

function updateSetDuration(index, value) {
  intervals[index].setDuration = value;
  localStorage.setItem('intervals', JSON.stringify(intervals));
}

function resetTimer() {
  t_Initial = Date.now();
  t_Last = t_Initial;
  localStorage.setItem('t_Initial', t_Initial);
  localStorage.setItem('t_Last', t_Initial);
}

function updateLogDisplay() {
  const logText = logs.map(l => `【${l.type}】${l.time}`).join('\n---\n');
  document.getElementById('log-content').textContent = logText;
}

function refreshLog() {
  logs = logs.filter(l => l.type !== 'Interval');
  intervals.forEach(item => {
    logs.push({
      type: 'Interval',
      time: formatDateWithTimezone(new Date(item.endTime))
    });
  });
  localStorage.setItem('logs', JSON.stringify(logs));
  updateLogDisplay();
}

function clearLog() {
  logs = [];
  localStorage.setItem('logs', JSON.stringify(logs));
  updateLogDisplay();
}

function copyLog() {
  navigator.clipboard.writeText(document.getElementById('log-content').textContent);
}

window.onload = () => {
  updateDisplay();
  renderIntervals();
  logs.push({ type: '刷新', time: formatDateWithTimezone(new Date()) });
  localStorage.setItem('logs', JSON.stringify(logs));
  updateLogDisplay();
};



// === 🔤 全局多语言提示表 ===
const i18n = {
  noRecords: {
    zh: '没有记录可导出',
    mix: '没有记录可导出',
    en: 'No records to export'
  },
  outdatedWarning: {
    zh: '⚠️ 当前页面不是最新版本，记录已被其他标签页修改，请刷新后再尝试。',
    mix: '⚠️ 当前页面不是最新版本，记录已被其他标签页修改，请刷新后再尝试。',
    en: '⚠️ This page is outdated. Records have been updated in another tab. Please refresh and try again.'
  },
  manualBackupSaved: {
    zh: '✅ 手动备份已保存',
    mix: '✅ 手动备份已保存',
    en: '✅ Manual backup saved'
  },
  noBackup: {
    zh: '暂无备份',
    mix: '暂无备份',
    en: 'No backups found'
  },
  csvImportError: {
    zh: '❌ CSV格式错误，导入失败',
    mix: '❌ CSV格式错误',
    en: '❌ Invalid CSV format'
  },
    parseFailed: {
    zh: '❌ 解析失败：找不到对应的记录。',
    mix: '❌ 解析失败：找不到对应的记录。',
    en: '❌ Parsing failed: item not found.'
  },
  undoFailed: {
    zh: '⚠️ 无法撤销：该记录未被解析。',
    mix: '⚠️ 无法撤销：该记录未被解析。',
    en: '⚠️ Cannot undo: this item was not parsed.'
  },
    ruleHelp: {
    zh: `
规则说明：

1. 第一行是标签名（Tag），可点击编辑；
2. 每列为一个标签，下面填写该标签的关键字；
3. 精确匹配，大小写敏感；
4. 若关键字前加 ~ 表示“备注中不包含该词”时匹配；
5. 标签的匹配顺序从左到右，找到一个匹配就会停止；
6. 感叹号开头的关键词（如 !sp）会严格匹配并从 Memo 中删除，且仅在 Memo 末尾部分生效；
7. 默认会清除匹配的关键词，但你可以通过感叹号前缀或否定关键词保留特定的匹配项；
8. 备份规则可以通过 CSV 导入或导出进行操作。
    `,
    mix: `
Rule Explanation:

1. The first row is for the tag names (Tag), editable;
2. Each column represents a tag, with keywords listed below each tag;
3. Exact matching, case-sensitive;
4. Keywords prefixed with ~ match when the word is not present in Memo;
5. Tags are matched from left to right, and matching stops once a keyword is found;
6. Keywords starting with ! (e.g., !sp) will strictly match and remove the keyword from the end of the Memo only;
7. By default, matched keywords are removed, but you can preserve specific matches by using the exclamation mark or the negation keyword;
8. Backup rules can be imported or exported via CSV.
    `,
    en: `
Rule Explanation:

1. The first row is for the tag names (Tag), editable;
2. Each column represents a tag, with keywords listed below each tag;
3. Exact matching, case-sensitive;
4. Keywords prefixed with ~ match when the word is not present in Memo;
5. Tags are matched from left to right, and matching stops once a keyword is found;
6. Keywords starting with ! (e.g., !sp) will strictly match and remove the keyword from the Memo’s end, only for the last part;
7. By default, matched keywords are removed, but you can preserve specific matches using the exclamation mark or negation keyword;
8. Backup rules can be imported or exported via CSV.
    `
  }
};

function getI18n(key) {
  const lang = window.currentLang || 'zh';
  return (i18n[key] && i18n[key][lang]) || i18n[key]?.zh || '';
}

// === 1. 显示所有备份列表 ===
function listAllBackups() {
  const container = document.getElementById('backup-list');
  container.innerHTML = '';
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('intervals_manual_') || k.startsWith('intervals_auto_'));
  if (allKeys.length === 0) {
    container.innerHTML = `<p>${getI18n('noBackup')}</p>`;
    return;
  }
  allKeys.sort();
  allKeys.reverse();
  allKeys.forEach((key, i) => {
    const div = document.createElement('div');
    div.innerHTML = `${i + 1}. ${key} <button onclick="exportBackupToCSV('${key}')">导出CSV</button>`;
    container.appendChild(div);
  });
}

// === 2. 手动备份功能 ===
function triggerManualBackup() {
  const keyPrefix = 'intervals_manual_';
  const all = Object.keys(localStorage).filter(k => k.startsWith(keyPrefix));
  all.sort();
  if (all.length >= 3) {
    const oldest = all[0];
    localStorage.removeItem(oldest);
  }
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const current = JSON.parse(localStorage.getItem('intervals') || '[]');
  localStorage.setItem(`${keyPrefix}${now}`, JSON.stringify(current));
  listAllBackups();
  alert(getI18n('manualBackupSaved'));
}

// === 3. 导入CSV为interval数据 ===
function importBackupFromCSV() {
  const fileInput = document.getElementById('import-backup-file');
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.trim().split('\n');
    const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const idx = name => header.indexOf(name);
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(s => s.replace(/^"|"$/g, ''));
      result.push({
        duration: parseFloat(cells[idx('Duration')]) * 60000,
        memo: cells[idx('Memo')] || '',
        tag: cells[idx('Tag')] || '',
        setDuration: cells[idx('SetDuration')] || '',
        endTime: cells[idx('EndTime')] || new Date().toISOString(),
        parsed: true
      });
    }
    localStorage.setItem('intervals', JSON.stringify(result));
    location.reload();
  };
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
  listAllBackups(); // 页面加载后展示备份列表
});

function restoreLatestBackup() {
  // 获取所有备份（手动备份或自动备份）
  const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('intervals_manual_') || key.startsWith('intervals_auto_'));

  if (backupKeys.length === 0) {
    alert('没有找到备份');
    return;
  }

  // 创建对话框容器
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'white';
  dialog.style.border = '1px solid #ccc';
  dialog.style.padding = '20px';
  dialog.style.zIndex = '9999';
  dialog.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  dialog.style.maxHeight = '80vh';
  dialog.style.overflowY = 'auto';

  // 添加标题
  const title = document.createElement('h3');
  title.textContent = '选择要恢复的备份';
  dialog.appendChild(title);

  // 添加备份列表
  const backupList = document.createElement('ul');
  backupKeys.forEach(key => {
    const listItem = document.createElement('li');
    const backupName = key.split('_').slice(-1).join('_'); // 提取备份名称
    listItem.textContent = `${backupName}`;

    // 为每个备份创建恢复按钮
    const restoreButton = document.createElement('button');
    restoreButton.textContent = '恢复该备份';
    restoreButton.onclick = () => {
      // 弹出确认框，确认是否恢复
      const userConfirmed = confirm(`确定要恢复备份：${backupName} 吗？`);
      if (userConfirmed) {
        const backupData = localStorage.getItem(key);
        if (backupData) {
          const intervals = JSON.parse(backupData);
          localStorage.setItem('intervals', JSON.stringify(intervals));
          location.reload();  // 刷新页面，恢复数据
        } else {
          alert('备份数据无效');
        }
      }
    };

    // 将按钮附加到列表项
    listItem.appendChild(restoreButton);
    backupList.appendChild(listItem);
  });

  dialog.appendChild(backupList);

  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.textContent = '取消';
  closeButton.onclick = () => {
    document.body.removeChild(dialog);  // 关闭对话框
  };
  dialog.appendChild(closeButton);

  // 显示对话框
  document.body.appendChild(dialog);
}
