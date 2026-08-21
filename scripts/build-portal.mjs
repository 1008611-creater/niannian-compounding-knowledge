// 构建自包含单文件门户：把 index.json + 卡片详情(markdown) 内联进一个 HTML。
// 用途：无需 HTTP 服务、无需网络，直接双击/预览打开即可查看效果。
// 真·产品门户仍是 fetch 版（dashboard/），本文件仅用于离线演示与一键分发快照。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const index = JSON.parse(readFileSync(join(root, 'metadata', 'index.json'), 'utf8'));
const css = readFileSync(join(root, 'dashboard', 'styles.css'), 'utf8');

function renderMarkdown(md = '') {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let inCode = false;
  let codeBuf = [];
  const inline = (t) => t
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeBuf = []; }
      else { out.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`); inCode = false; }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('### ')) { out.push(`<h3>${inline(line.slice(4))}</h3>`); i++; continue; }
    if (line.startsWith('## ')) { out.push(`<h2>${inline(line.slice(3))}</h2>`); i++; continue; }
    if (line.startsWith('# ')) { out.push(`<h1>${inline(line.slice(2))}</h1>`); i++; continue; }
    if (line.startsWith('> ')) { out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); i++; continue; }
    if (/^-{3,}$/.test(line.trim())) { out.push('<hr>'); i++; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`); i++; }
      out.push(`<ol>${items.join('')}</ol>`); continue;
    }
    out.push(`<p>${inline(line)}</p>`); i++;
  }
  return out.join('\n');
}

const details = {};
for (const item of index.items) {
  try {
    const md = readFileSync(join(root, item.path), 'utf8');
    details[item.id] = renderMarkdown(md);
  } catch {
    details[item.id] = `<p class="detail-meta">（详情文件缺失：${item.path}）</p>`;
  }
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>念念 AI 复利知识库（离线版）</title>
<style>${css}</style>
</head>
<body>
<main>
<header class="hero">
<div>
<p class="eyebrow">NIANNIAN AI · COMPOUNDING KNOWLEDGE · 离线快照</p>
<h1>把一次实践<br>变成长期资产。</h1>
<p class="lead">用知识卡把 AI 视频、短剧、漫剧、自动化与项目经验变成可理解、可复用、可分发的资产。本页为自包含离线版，无需服务器。</p>
</div>
<div class="version"><strong id="cardCount">—</strong><span>张知识卡 · 离线 MVP</span></div>
</header>

<section class="intent-section">
<h2>从目标进入</h2>
<div class="intent-grid">
<button data-query="短剧">我要做短剧</button>
<button data-query="视频生成">我要批量生成视频</button>
<button data-query="画布">我要搭建 AI 视频工作台</button>
<button data-query="剪辑">我要做智能剪辑</button>
</div>
</section>

<section class="map-section">
<h2>AI 视频生产地图</h2>
<div class="flow"><span>选题</span><i>→</i><span>剧本</span><i>→</i><span>分镜</span><i>→</i><span>角色 / 场景</span><i>→</i><span>图片</span><i>→</i><span>视频</span><i>→</i><span>配音字幕</span><i>→</i><span>剪辑交付</span></div>
</section>

<section class="knowledge-section">
<div class="section-heading"><div><h2>知识卡</h2><p id="resultText">正在载入索引…</p></div></div>
<div class="filters">
<input id="search" type="search" placeholder="搜索项目、工具、工作流、标签">
<select id="type"><option value="">全部类型</option></select>
<select id="audience"><option value="">全部分发层</option><option value="public">公开</option><option value="team">团队</option><option value="private">私域</option></select>
<select id="status"><option value="">全部状态</option><option value="draft">草稿</option><option value="review">待验证</option><option value="verified">已验证</option><option value="recommended">推荐</option><option value="stale">待更新</option><option value="deprecated">已废弃</option><option value="reference">仅供参考</option></select>
</div>
<div id="cards" class="cards"></div>
</section>
</main>
<dialog id="detailDialog"><article><button class="close" aria-label="关闭">×</button><div id="detailContent"></div></article></dialog>

<script>
const DATA = ${JSON.stringify(index.items, null, 0)};
const DETAILS = ${JSON.stringify(details, null, 0)};
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
let items = DATA;
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function matches(item){
  const term=searchNode.value.trim().toLowerCase();
  const hay=[item.title,item.summary,item.category,...item.tags].join(' ').toLowerCase();
  return (!term||hay.includes(term))&&(!typeNode.value||item.type===typeNode.value)&&(!audienceNode.value||item.audience.includes(audienceNode.value))&&(!statusNode.value||item.status===statusNode.value);
}
function cardHtml(item){
  const audience=item.audience.map(v=>'<span class="pill">'+audienceLabels[v]+'</span>').join('');
  return '<article class="card"><div class="card-top"><span class="pill status-'+escapeHtml(item.status)+'">'+statusLabels[item.status]+'</span><span class="pill">复利 '+item.score+'/5</span></div><h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(item.summary)+'</p><div class="card-meta"><span>'+typeLabels[item.type]+'</span><span>·</span><span>'+(item.difficulty==='beginner'?'入门':item.difficulty==='intermediate'?'进阶':'高级')+'</span>'+audience+'</div><div class="card-actions"><button class="button primary" data-detail="'+escapeHtml(item.id)+'">查看详情</button></div></article>';
}
function render(){
  const filtered=items.filter(matches);
  resultText.textContent='显示 '+filtered.length+' / '+items.length+' 张卡片';
  cardsNode.innerHTML=filtered.length?filtered.map(cardHtml).join(''):'<div class="empty">没有匹配的知识卡。试试换个关键词或清除筛选。</div>';
}
function openDetail(id){
  const item=items.find(c=>c.id===id);
  if(!item)return;
  const source=item.source&&item.source.url?'<p><strong>原始来源：</strong><a href="'+escapeHtml(item.source.url)+'" target="_blank" rel="noreferrer">打开来源</a></p>':'<p><strong>原始来源：</strong>内部资产</p>';
  const actions=(item.actions&&item.actions.length)?'<h3>可用动作</h3><p>'+item.actions.map(a=>'<a class="button'+(a.kind==='detail'?' primary':'')+'" href="'+(a.target||item.source.url||'#')+'" target="_blank" rel="noreferrer">'+(a.label||'查看')+'</a>').join(' ')+'</p>':'';
  detailContent.innerHTML='<span class="pill status-'+escapeHtml(item.status)+'">'+statusLabels[item.status]+'</span><h2>'+escapeHtml(item.title)+'</h2><p>'+escapeHtml(item.summary)+'</p><p class="detail-meta">'+typeLabels[item.type]+' · '+item.tags.map(escapeHtml).join(' / ')+' · 更新于 '+item.updatedAt+' · 维护人：'+escapeHtml(item.owner)+'</p>'+source+actions+'<hr>'+DETAILS[id];
  dialog.showModal();
}
document.querySelector('#cardCount').textContent=items.length;
[...new Set(items.map(i=>i.type))].sort().forEach(t=>typeNode.insertAdjacentHTML('beforeend','<option value="'+t+'">'+typeLabels[t]+'</option>'));
[searchNode,typeNode,audienceNode,statusNode].forEach(n=>n.addEventListener('input',render));
document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{searchNode.value=b.dataset.query;render();document.querySelector('.knowledge-section').scrollIntoView({behavior:'smooth'});}));
cardsNode.addEventListener('click',e=>{const b=e.target.closest('[data-detail]');if(b)openDetail(b.dataset.detail);});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
render();
</script>
</body>
</html>`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'portal.html'), html, 'utf8');
console.log('built dist/portal.html with', index.items.length, 'cards');
