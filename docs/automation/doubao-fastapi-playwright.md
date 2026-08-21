# 豆包视频 FastAPI + Playwright 服务

- 类型：自动化服务
- 分类：视频生成基础设施
- 状态：已验证
- 分发：团队 / 私域
- 原始项目：`E:/codex/niannianai/doubao-video-service`

## 能力

- FastAPI 任务提交、状态查询和结果返回
- Playwright / CDP 驱动浏览器完成视频生成
- 账号激活和账号池调度
- 下载目录监控获取 MP4 结果
- 无水印视频下载
- 与念念画布视频节点衔接

## 入口

- `app/main.py`
- `app/accounts.py`
- `app/downloader.py`
- `app/platforms/doubao.py`

## 使用边界

仅用于拥有授权的账号、服务和自动化场景。发布前必须补充部署环境、密钥管理、账号权限和失败重试说明。
