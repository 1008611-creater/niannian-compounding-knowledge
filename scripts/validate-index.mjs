import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'metadata', 'index.json');
const allowedTypes = new Set(['tool', 'workflow', 'project', 'automation', 'method', 'retrospective', 'insight']);
const allowedStatuses = new Set(['draft', 'review', 'verified', 'recommended', 'stale', 'deprecated', 'reference']);
const allowedAudiences = new Set(['public', 'team', 'private']);
const allowedDifficulties = new Set(['beginner', 'intermediate', 'advanced']);
const required = ['id', 'title', 'type', 'category', 'summary', 'audience', 'status', 'difficulty', 'path', 'tags', 'score', 'version', 'updatedAt', 'owner', 'source', 'actions'];
const errors = [];
const index = JSON.parse(await readFile(indexPath, 'utf8'));
const ids = new Set();

for (const [position, item] of index.items.entries()) {
  const prefix = `items[${position}]`;
  for (const field of required) if (!(field in item)) errors.push(`${prefix}: 缺少 ${field}`);
  if (ids.has(item.id)) errors.push(`${prefix}: id 重复 ${item.id}`);
  ids.add(item.id);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id || '')) errors.push(`${prefix}: id 必须为小写连字符格式`);
  if (!allowedTypes.has(item.type)) errors.push(`${prefix}: type 无效`);
  if (!allowedStatuses.has(item.status)) errors.push(`${prefix}: status 无效`);
  if (!allowedDifficulties.has(item.difficulty)) errors.push(`${prefix}: difficulty 无效`);
  if (!Array.isArray(item.audience) || !item.audience.length || item.audience.some(value => !allowedAudiences.has(value))) errors.push(`${prefix}: audience 无效`);
  if (!Array.isArray(item.tags) || !item.tags.length) errors.push(`${prefix}: tags 至少一项`);
  if (!Number.isInteger(item.score) || item.score < 1 || item.score > 5) errors.push(`${prefix}: score 必须为 1-5 整数`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.updatedAt || '')) errors.push(`${prefix}: updatedAt 必须为 YYYY-MM-DD`);
  if (!item.summary || item.summary.length < 12) errors.push(`${prefix}: summary 需至少 12 个字符`);
  if (!item.source || !['internal', 'tencent-docs', 'feishu', 'github', 'bilibili', 'website'].includes(item.source.type)) errors.push(`${prefix}: source.type 无效`);
  if (!Array.isArray(item.actions) || !item.actions.some(action => action.kind === 'detail')) errors.push(`${prefix}: actions 必须包含 detail`);
  try { await access(path.join(root, item.path)); } catch { errors.push(`${prefix}: 详情文件不存在 ${item.path}`); }
}

if (errors.length) {
  console.error(`知识库索引校验失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`知识库索引校验通过：${index.items.length} 张知识卡，schema ${index.schemaVersion}`);
