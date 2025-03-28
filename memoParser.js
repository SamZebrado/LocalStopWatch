// memoParser.js

function parseMemo(index) {
  const intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
  const rules = JSON.parse(localStorage.getItem('ruleTable') || '[]');
  let item = intervals[index];
  if (!item) return;

  item.memo = item.memo.trim();
  const original = item.memo;

  // 提取结尾数字作为 setDuration
  const durationMatch = item.memo.match(/(\d+)\s*$/);
  if (durationMatch) {
    item.setDuration = Number(durationMatch[1]);
    item.memo = item.memo.replace(/(\d+)\s*$/, '').trim();
  } else if (item.duration < 60000 && !item.setDuration) {
    item.setDuration = 1;
  }

  let keywordRegion = item.memo;
  const tags = new Set();

  // 左到右扫描，匹配成功即剔除
  let pointer = 0;
  while (pointer < keywordRegion.length) {
    let matched = false;
    rules.forEach(col => {
      col.keywords.forEach(keyword => {
        if (!keyword || keyword.startsWith('~')) return;
        if (keywordRegion.startsWith(keyword, pointer)) {
          tags.add(col.tag);
          keywordRegion = keywordRegion.slice(0, pointer) + keywordRegion.slice(pointer + keyword.length);
          matched = true;
        }
      });
    });
    if (!matched) {
      pointer++;
    }
  }

  item.memo = keywordRegion.trim().replace(/\s+/g, ' ');
  item.tag = Array.from(tags).map(t => '#' + t).join(' ');
  item.parsed = true;
  item.originalMemo = original;

  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();
}

function undoParse(index) {
  const intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
  const item = intervals[index];
  if (!item || !item.parsed) return;

  item.memo = item.originalMemo;
  item.tag = '';
  item.setDuration = '';
  item.parsed = false;

  // 保留原始毫秒 duration（从字符串还原失败时不动）
  if (typeof item.rawDuration === 'number') {
    item.duration = item.rawDuration;
  }

  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();
}
