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

function exportIntervalsToCSV() {
  if (!intervals.length) {
    alert('没有记录可导出');
    return;
  }

  const rows = [
    ['持续时间（分钟）', '格式化时间', '备注', '标签', '结束时间']
  ];

  intervals.forEach(item => {
    const mins = item.durationMs ? (item.durationMs / 60000).toFixed(2) : '';
    rows.push([
      mins,
      item.duration || '',
      item.memo || '',
      item.tag || '',
      new Date(item.endTime).toLocaleString()
    ]);
  });

  const csv = rows.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'intervals.csv';
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
    div.innerHTML = `
      <div><strong class="duration">${mins} 分钟</strong></div>
      <div>Tag: <input value="${item.tag || ''}" oninput="updateTag(${trueIndex}, this.value)"></div>
      <div>Memo: <input value="${item.memo}" oninput="updateMemo(${trueIndex}, this.value)"></div>
      <div>指定时间（分钟）: <input type="number" value="${item.setDuration || ''}" oninput="updateSetDuration(${trueIndex}, this.value)"></div>
      <div>结束时间: ${new Date(item.endTime).toLocaleString()}</div>
      <button onclick="parseMemo(${trueIndex})">解析Memo</button>
      <button onclick="undoParse(${trueIndex})">撤销</button>
    `;
    if (item.parsed) div.style.background = '#eee';
    container.appendChild(div);
  });
}

function rememberInterval() {
  const now = Date.now();
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
      time: new Date(item.endTime).toLocaleString()
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
  logs.push({ type: '刷新', time: new Date().toLocaleString() });
  localStorage.setItem('logs', JSON.stringify(logs));
  updateLogDisplay();
};
