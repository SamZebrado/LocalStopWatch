// exportTomato.js

function exportTomatoPotato() {
  const raw = JSON.parse(localStorage.getItem('intervals') || '[]');
  if (!raw.length) {
    alert('没有记录可导出');
    return;
  }

  // 深拷贝防止修改原始数据
  const intervals = JSON.parse(JSON.stringify(raw));

  // 预处理：四舍五入每条 interval 的实际时长（单位：分钟）
  intervals.forEach(item => {
    item.actualMin = Math.round(item.duration / 60000);
    if (!item.setDuration && item.actualMin < 1) {
      item.setDuration = 1;
    }
  });

  // 分配时间：按 setDuration 优先级调整
  for (let i = 0; i < intervals.length; i++) {
    const cur = intervals[i];
    if (cur.setDuration) {
      const t = cur.setDuration;
      const d = cur.actualMin;
      if (t < d) {
        // 向后补给多余的时间
        let extra = d - t;
        for (let j = i + 1; j < intervals.length && extra > 0; j++) {
          if (!intervals[j].setDuration) {
            intervals[j].actualMin += extra;
            break;
          }
        }
        cur.actualMin = t;
      } else if (t > d) {
        // 向前借用时间
        let need = t - d;
        for (let j = i - 1; j >= 0 && need > 0; j--) {
          if (!intervals[j].setDuration && intervals[j].actualMin > need) {
            intervals[j].actualMin -= need;
            break;
          }
        }
        cur.actualMin = t;
      }
    }
  }

  const output = intervals.map(item => {
    const tag = item.tag || '';
    const memo = item.memo || '';
    const min = item.actualMin;
    return `${tag} ${memo} ${min}min`.trim();
  }).join(' + ');

  document.getElementById('tomato-output').textContent = output;
  navigator.clipboard.writeText(output);
  alert('已复制到剪贴板');
}
