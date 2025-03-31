// memoParser.js

// 🌐 多语言提示字典（与 timer.js 同步）


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

  // 提取结尾的数字作为 setDuration
  const durationMatch = item.memo.match(/(\d+)\s*$/);
  let suffixClean = '';
  if (durationMatch) {
    item.setDuration = Number(durationMatch[1]);
    suffixClean = durationMatch[0]; // 获取后缀
    item.memo = item.memo.replace(suffixClean, '').trim(); // 删除后缀部分
  } else if (item.duration < 60000 && !item.setDuration) {
    item.setDuration = 1; // 设置默认值为1分钟
  }

  let tags = new Set();

  // 关键词匹配，扫描 Memo 中的关键词
  rules.forEach(col => {
    col.keywords.forEach(keyword => {
      if (!keyword) return; // 跳过空关键词

      const isNot = keyword.slice(0, 2) === '~';  // 判断否定关键词
      const isStrict = keyword.slice(0, 2) === '!';  // 判断严格匹配关键词
      const cleanedKeyword = keyword.replace(/^([!~]+)/, ''); // 去掉 ! 和 ~ 前缀

      // 否定关键词：只在未找到时才添加标签
      if (isNot) {
        if (!item.memo.includes(cleanedKeyword)) {
          tags.add(col.tag); // 否定关键词不存在时才添加标签
        }
        return; // 跳过继续处理
      }

      // 严格匹配：仅在 Memo 末尾部分（字母+数字）检测关键词
      if (isStrict && /^[a-zA-Z]+$/.test(cleanedKeyword)) {
        const suffixMatch = item.memo.match(/[a-zA-Z0-9 ]+$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        if (suffix.includes(cleanedKeyword)) {
          tags.add(col.tag); // 找到严格匹配的关键词时添加标签
          item.memo = item.memo.replace(suffix, '').trim(); // 删除后缀部分
        }
        return;
      }

      // 普通关键词：找到后添加标签，移除关键词
      if (!isNot && item.memo.includes(cleanedKeyword)) {
        tags.add(col.tag); // 找到关键词时添加标签
        item.memo = item.memo.replaceAll(cleanedKeyword, ''); // 移除关键词
      }
    });
  });

  // 更新 Memo 和标签
  item.memo = item.memo.trim().replace(/\s+/g, ' '); // 移除多余空格
  item.memo = item.memo + ' ' + suffixClean; // 添加清理后的后缀
  item.tag = Array.from(tags).map(tag => `#${tag}`).join(' '); // 加入井号标签
  item.parsed = true;  // 标记已解析

  item.originalMemo = originalMemo;  // 保留原始 Memo

  // 更新 intervals 到 localStorage
  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();  // 刷新页面
}

function undoParse(index) {
  const intervals = JSON.parse(localStorage.getItem('intervals') || '[]');
  let item = intervals[index];

  if (!item || !item.parsed) {
    alert(getI18n('undoFailed'));
    return;
  }

  // 恢复原始数据
  item.memo = item.originalMemo;
  item.tag = '';
  item.setDuration = '';
  item.parsed = false;

  intervals[index] = item;
  localStorage.setItem('intervals', JSON.stringify(intervals));
  location.reload();  // 刷新页面
}
