const typeLabels = {tool:'工具',workflow:'工作流',project:'项目',automation:'自动化',method:'方法',retrospective:'复盘',insight:'信息差'};
const audienceLabels = {public:'公开',team:'团队',private:'私域'};
const statusLabels = {draft:'草稿',review:'待验证',verified:'已验证',recommended:'推荐',stale:'待更新',deprecated:'已废弃',reference:'仅供参考'};
const cardsNode = document.querySelector('#cards');
const resultText = document.querySelector('#resultText');
const searchNode = document.querySelector('#search');
const typeNode = document.querySelector('#type');
const audienceNode = document.querySelector('#audience');
const statusNode = document.querySelector('#status');
const dialog = document.querySelector('#detailDialog');
const detailContent = document.querySelector('#detailContent');
let items = [];

function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function detailPath(target) { return `../${target}`; }
function matches(item) {
  const term = searchNode.value.trim().toLowerCase();
  const haystack = [item.title,item.summary,item.category,...item.tags].join(' ').toLowerCase();
  return (!term || haystack.includes(term)) && (!typeNode.value || item.type === typeNode.value) && (!audienceNode.value || item.audience.includes(audienceNode.value)) && (!statusNode.value || item.status === statusNode.value);
}
function cardHtml(item) {
  const audience = item.audience.map(value => `<span class="pill">${audienceLabels[value]}</span>`).join('');
  return `<article class="card"><div class="card-top"><span class="pill status-${escapeHtml(item.status)}">${statusLabels[item.status]}</span><span class="pill">复利 ${item.score}/5</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="card-meta"><span>${typeLabels[item.type]}</span><span>·</span><span>${item.difficulty === 'beginner' ? '入门' : item.difficulty === 'intermediate' ? '进阶' : '高级'}</span>${audience}</div><div class="card-actions"><button class="button primary" data-detail="${escapeHtml(item.id)}">查看详情</button><a class="button" href="${detailPath(item.path)}" target="_blank" rel="noreferrer">打开原文</a></div></article>`;
}
function render() {
  const filtered = items.filter(matches);
  resultText.textContent = `显示 ${filtered.length} / ${items.length} 张卡片`;
  cardsNode.innerHTML = filtered.length ? filtered.map(cardHtml).join('') : '<div class="empty">没有匹配的知识卡。试试换个关键词或清除筛选。</div>';
}
function openDetail(id) {
  const item = items.find(candidate => candidate.id === id);
  if (!item) return;
  const source = item.source.url ? `<p><strong>原始来源：</strong><a href="${escapeHtml(item.source.url)}" target="_blank" rel="noreferrer">打开来源</a></p>` : '<p><strong>原始来源：</strong>内部资产</p>';
  detailContent.innerHTML = `<span class="pill status-${escapeHtml(item.status)}">${statusLabels[item.status]}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p><p class="detail-meta">${typeLabels[item.type]} · ${item.tags.map(escapeHtml).join(' / ')} · 更新于 ${item.updatedAt} · 维护人：${escapeHtml(item.owner)}</p>${source}<h3>可用动作</h3><p><a class="button primary" href="${detailPath(item.path)}" target="_blank" rel="noreferrer">查看完整知识卡</a></p><p class="detail-meta">一键运行、下载或复制动作仅在资产已验证、具备安全边界且提供实际入口后才会显示。</p>`;
  dialog.showModal();
}
async function init() {
  try {
    const response = await fetch('../metadata/index.json');
    if (!response.ok) throw new Error('索引读取失败');
    const index = await response.json();
    items = index.items;
    document.querySelector('#cardCount').textContent = items.length;
    [...new Set(items.map(item => item.type))].sort().forEach(type => typeNode.insertAdjacentHTML('beforeend', `<option value="${type}">${typeLabels[type]}</option>`));
    render();
  } catch (error) {
    resultText.textContent = '索引加载失败。请用本地 HTTP 服务打开门户。';
    cardsNode.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}
[searchNode,typeNode,audienceNode,statusNode].forEach(node => node.addEventListener('input', render));
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { searchNode.value = button.dataset.query; render(); document.querySelector('.knowledge-section').scrollIntoView({behavior:'smooth'}); }));
cardsNode.addEventListener('click', event => { const button = event.target.closest('[data-detail]'); if (button) openDetail(button.dataset.detail); });
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
init();
