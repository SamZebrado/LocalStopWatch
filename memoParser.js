// memoParser.js

function getI18n(key) {
  const lang = window.currentLang || 'zh';
  return (i18n[key] && i18n[key][lang]) || i18n[key]?.zh || '';
}

function parseMemo(index) {
  const intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
  const rules = JSON.parse(localStorage.getItem('ruleTable') || '[]');
  let item = intervals[index];

  if (!item) {
    alert(getI18n('parseFailed'));
    return;
  }

  const originalMemo = item.memo;
  item.memo = item.memo.trim();

  // 提取末尾数字作为 setDuration
  const durationMatch = item.memo.match(/(\d+)\s*$/);
  if (durationMatch) {
    item.setDuration = Number(durationMatch[1]);
    item.memo = item.memo.replace(durationMatch[0], '').trim();
  } else if (item.duration < 60000 && !item.setDuration) {
    item.setDuration = 1;
  }

  const tags = new Set();
  let keywordRegion = item.memo;

  for (const col of rules) {
    let includeTag = false;
    let hasNegationHit = false;

    for (const keyword of col.keywords) {
      if (!keyword) break; // 空白行中断该列处理

      const isNegation = keyword.startsWith('~');
      const isForceDelete = keyword.includes('!');
      const cleaned = keyword.replace(/[~!]/g, '');

      // 感叹号关键词处理：在末尾后缀中删除匹配项
      if (isForceDelete) {
        const suffixMatch = keywordRegion.match(/([a-zA-Z0-9]+)$/);
        if (suffixMatch) {
          const suffix = suffixMatch[1];
          if (suffix.includes(cleaned)) {
            const newSuffix = suffix.replace(new RegExp(cleaned, 'g'), '');
            keywordRegion = keywordRegion.slice(0, -suffix.length) + newSuffix;
            includeTag = true;  // 标记需要添加标签
          }
        }
      }

      // 否定关键词：只判断，不删除
      if (isNegation && keywordRegion.includes(cleaned)) {
        hasNegationHit = true;
      }

      // 普通关键词：匹配则标记需要添加标签
      if (!isNegation && !isForceDelete && keywordRegion.includes(cleaned)) {
        includeTag = true;
      }
    }

    if (includeTag && !hasNegationHit) {
      tags.add(col.tag);
    }
  }

  item.memo = keywordRegion.trim().replace(/\s+/g, ' ');
  item.tag = Array.from(tags).map(t => '#' + t).join(' ');
  item.parsed = true;
  item.originalMemo = originalMemo;

  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();
}

function undoParse(index) {
  const intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
  const item = intervals[index];
  if (!item || !item.parsed) {
    alert(getI18n('undoFailed'));
    return;
  }

  item.memo = item.originalMemo;
  item.tag = '';
  item.setDuration = '';
  item.parsed = false;

  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();
}
