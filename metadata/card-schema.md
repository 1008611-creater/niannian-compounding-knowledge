# 知识卡规范

## 目标

知识卡是知识库最小可分发单位；Markdown 是卡片详情，`metadata/index.json` 是门户和自动化读取的唯一索引。

## 必填字段

```json
{
  "id": "type-slug",
  "title": "卡片标题",
  "type": "tool | workflow | project | automation | method | retrospective | insight",
  "category": "分类标识",
  "summary": "一句话说明结果或价值",
  "audience": ["public", "team", "private"],
  "status": "draft | review | verified | recommended | stale | deprecated | reference",
  "difficulty": "beginner | intermediate | advanced",
  "path": "docs/.../card.md",
  "tags": ["标签"],
  "score": 1,
  "version": "0.1.0",
  "updatedAt": "YYYY-MM-DD",
  "owner": "维护人",
  "source": {"type": "internal | tencent-docs | feishu | github | bilibili | website", "url": ""},
  "actions": [{"label": "查看详情", "kind": "detail", "target": "docs/.../card.md"}]
}
```

## 字段约束

- `id`：全库唯一，小写、数字、连字符；前缀与 `type` 对应。
- `summary`：一句话写清用户能得到什么，避免空泛介绍。
- `audience`：至少一项；`private` 不代表自动公开，仍由实际访问权限控制。
- `status`：外部资料默认 `review`；只有真实验证过的链路才可写 `verified` 或 `recommended`。
- `score`：1～5 分，依据需求强度、可复制性、结果确定性、商业潜力和更新稳定性综合判断。
- `source.url`：外部链接必须保留原始链接；内部资产留空。
- `actions`：至少包含一个 `detail` 动作；只有资产可被安全、合法、完整执行时才增加 `copy`、`open`、`download` 或 `run`。

## 详情页标准结构

```md
# 标题

- 类型：
- 分类：
- 状态：
- 难度：
- 分发：
- 版本：
- 更新时间：
- 维护人：
- 来源：

## 一句话结论

## 解决什么问题

## 适合谁

## 输入 → 处理 → 输出

## 使用步骤 / 方法

## 一键应用

## 验收标准

## 常见失败与边界

## 关联卡片
```

## 维护流程

1. 新建详情 Markdown。
2. 在 `metadata/index.json` 增加索引项。
3. 执行 `npm run validate`。
4. 本地打开 `dashboard/index.html` 检查卡片、筛选和动作。
5. 完成验证后再提升状态和分发层级。
6. 在 `CHANGELOG.md` 记录用户可感知的变化。
