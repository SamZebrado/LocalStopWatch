// ruleTable.js

let ruleTable = JSON.parse(localStorage.getItem('ruleTable') || '[]');
let previousRuleTable = [];
let rowCount = Number(localStorage.getItem('ruleRowCount')) || 50;

function renderRuleTable() {
  const table = document.getElementById('rule-table');
  table.innerHTML = '';

  const headerRow = document.createElement('tr');
  ruleTable.forEach((col, colIdx) => {
    const th = document.createElement('th');
    const input = document.createElement('input');
    input.value = col.tag;
    input.oninput = (e) => {
      ruleTable[colIdx].tag = e.target.value;
      localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
    };
    th.appendChild(input);
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (let row = 0; row < rowCount; row++) {
    const tr = document.createElement('tr');
    ruleTable.forEach((col, colIdx) => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.value = col.keywords[row] || '';
      input.oninput = (e) => {
        ruleTable[colIdx].keywords[row] = e.target.value;
        localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
      };
      td.appendChild(input);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }
}

function addRuleColumn() {
  const newTag = `标签${ruleTable.length + 1}`;
  ruleTable.push({ tag: newTag, keywords: [] });
  localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
  renderRuleTable();
}

function addRuleRow() {
  rowCount += 1;
  localStorage.setItem('ruleRowCount', rowCount);
  renderRuleTable();
}

function showRuleHelp() {
  alert(`规则说明：\n\n1. 第一行是标签名（Tag），可点击编辑；\n2. 每列为一个标签，下面填写该标签的关键字；\n3. 精确匹配，大小写敏感；\n4. 若关键字前加 ~ 表示“备注中不包含该词”时匹配。`);
}

function exportRules() {
  const csv = ruleTable.map(col => col.tag).join(',') + '\n' +
    Array.from({ length: rowCount }, (_, i) =>
      ruleTable.map(col => col.keywords[i] || '').join(',')
    ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ruleTable.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = reader.result.split(/\r?\n/);
    const tags = lines[0].split(',');
    const keywords = lines.slice(1).map(line => line.split(','));
    ruleTable = tags.map((tag, idx) => ({
      tag,
      keywords: keywords.map(row => row[idx] || '')
    }));
    rowCount = keywords.length;
    localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
    localStorage.setItem('ruleRowCount', rowCount);
    renderRuleTable();
  };
  reader.readAsText(file);
}

function undoClearRules() {
  if (previousRuleTable.length > 0) {
    ruleTable = previousRuleTable;
    localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
    renderRuleTable();
  }
}

function clearRuleTable() {
  previousRuleTable = JSON.parse(JSON.stringify(ruleTable));
  ruleTable = [];
  localStorage.setItem('ruleTable', '[]');
  renderRuleTable();
}

if (!ruleTable.length) {
  ruleTable = [
    { tag: '标签1', keywords: [] },
    { tag: '标签2', keywords: [] },
    { tag: '标签3', keywords: [] },
    { tag: '标签4', keywords: [] }
  ];
  localStorage.setItem('ruleTable', JSON.stringify(ruleTable));
}

window.addEventListener('load', renderRuleTable);
window.addEventListener('load', () => {
  const buttonArea = document.createElement('div');
  buttonArea.innerHTML = `
    <button onclick="addRuleColumn()">➕ 增加标签列</button>
    <button onclick="addRuleRow()">➕ 增加关键字行</button>
  `;
  document.getElementById('tab-rules').insertBefore(buttonArea, document.getElementById('rule-table'));
});