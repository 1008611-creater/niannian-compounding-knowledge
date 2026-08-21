# 贡献与维护规范

## 新增一张知识卡

1. 从 `metadata/card-schema.md` 复制详情页结构，在对应 `docs/` 分类创建 Markdown。
2. 将卡片加入 `metadata/index.json`；`id` 不可重复。
3. 外部资料必须写清 `source.type` 与 `source.url`，未经真实验证一律使用 `review`。
4. 执行 `npm run validate`。
5. 在浏览器打开 `dashboard/index.html`，确认筛选、详情和操作入口正常。
6. 在 `CHANGELOG.md` 写入对用户有影响的更新。

## 提交边界

不得提交密钥、Cookie、账号、用户视频、签名 URL、供应商原始响应、运行时日志或下载结果。代码实现与知识说明应相互链接，但不要复制整套业务项目代码到本仓库。

## 状态升级

- `draft`：想法或尚未完整整理。
- `review`：已录入来源，等待验证。
- `verified`：已在明确环境中验证。
- `recommended`：已验证且可稳定复用。
- `stale`：来源或工具可能已过期。
- `deprecated`：不再推荐。

只有真实执行完成、结果可复现并已写清边界的资产可以标为 `verified` 或 `recommended`。
