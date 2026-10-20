# Roadmap

按阶段整理的待办。每个 change 完成后在这里划掉对应项；细节以各 change 的 proposal / design 为准。
来源：`openspec/changes/repository-search/` 的 proposal 与 tasks（2026-10-20 合并）。

## 已完成

- [x] 部署：GitHub Pages（Actions 模式），地址 https://shiei.github.io/gh-radar/ ，推送与每日快照后自动部署（2026-10-21）

- [x] `project-foundation`：React + Vite + TS、Tailwind tokens、日夜主题、三语、测试与 lint（2026-10-19 归档）
- [x] `repository-search`：未认证的 GitHub REST 仓库检索、排序、页码分页、结果卡片（含活跃度等附加信号）、示例查询、首页插图（已实现，待归档）

## 第二阶段（纯前端）

2026-10-20 调整：去掉详情页（点仓库名即可到 GitHub），项目比较移入第三阶段（没有 LLM 分析就没有新意）。按三个 change 推进。

### A. `github-token`

- [x] 用户配置个人 token，存 localStorage，`GET /rate_limit` 校验；在 `headers.ts` 加 Authorization，并修改 `github-api-access` spec 的"未认证"要求。（2026-10-20）
- [x] 会话内结果缓存：按 `query|sort|page` 缓存约 5 分钟，命中不发请求；刷新即失效。（2026-10-20）
- [x] 显示剩余配额。（2026-10-20）
- [x] token 安全：默认只存内存、可选记住；生产构建注入 CSP；引导最小权限 token。（2026-10-20）
- [ ] （可选）口令加密后落盘：WebCrypto PBKDF2 + AES-GCM，解锁后仍在内存明文，只改善静止状态。

### A2. `daily-snapshot`（2026-10-21 新增，排在 B 之前）

- [x] GitHub Actions 每日快照：六个分类 × 热门 / 新秀各 300 条加 watchlist，写入 `public/data/`（latest、daily 30 天、series 一年按天后按周、meta）。（2026-10-21，已在 GitHub 上手动触发验证通过）
- [x] 脚本可本地 `--dry-run`；失败不提交；配额等待与重试。（2026-10-21）

### B. `discovery-home`（2026-10-21 改为读快照）

- [x] 三栏布局骨架：左栏分类、中栏结果、右栏榜单。窄屏退化为单栏。（2026-10-21）
- [x] 六个分类（Frontend、Backend、AI/ML、DevOps、Database、Design）到 topic 查询的映射文件与分类导航。（2026-10-21）
- [x] Most Popular 与 Rising Stars 榜单：读快照，Rising 用真实 30 天增量，序列不足 7 天时退化为创建日期近似。（2026-10-21）

### C. `search-facets`

- [ ] Users / Topics 检索类型切换，各自的结果卡片；类型计数每种一次请求，仅在有 token 时显示。
- [ ] 结构化筛选器：语言、最低 star、排除 fork、排除归档，由程序拼出 qualifier。
- [ ] 语言标签可点击（`language:xxx`）。

### 其他（排期待定）

- [ ] 给仓库加星：需要带 `repo` 权限的 token 的写操作，单独评估。
- [ ] 检索状态同步到 URL（刷新与分享）。
- [ ] 验证 star 是否会刷新 `updated_at`（只影响提示文案）。

## 第三阶段（需要后端）

| 需求                                        | 为什么前端做不了                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Trending 排行榜（最近 7 / 30 天新增 Stars） | GitHub 没有 trending API，也没有 star 增量字段。需要服务端定时快照 star 数并做差。 |
| 项目比较页的增长趋势曲线                    | 同上，需要历史数据。                                                               |
| Rising Stars 的精确增长率                   | 同上。纯前端只能用 `created:>日期` 做近似。                                        |
| AI 项目分析                                 | LLM API key 不能暴露在浏览器中，需要服务端代理。                                   |
| Watchlist 跨设备同步                        | 需要用户身份与服务端存储。仅本机的 localStorage 版本不需要后端。                   |
| 免 token 使用且不受 60 次/小时限制          | 需要服务端代理共享一个更高配额的 token 并做缓存。                                  |

| OAuth 登录（浏览器不持有长期密钥） | 换取 access token 需要 client secret，必须在服务端完成；是彻底解决 token 暴露面的方案。 |

## 已关闭

- 加载中的提交行为：去掉独立检索按钮后，加载中不再禁用任何控件，回车与输入框内图标都直接发起新检索并取消旧请求（2026-10-19）。
