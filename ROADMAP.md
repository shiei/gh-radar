# Roadmap

按阶段整理的待办。每个 change 完成后在这里划掉对应项；细节以各 change 的 proposal / design 为准。
来源：`openspec/changes/repository-search/` 的 proposal 与 tasks（2026-10-20 合并）。

## 已完成

- [x] `project-foundation`：React + Vite + TS、Tailwind tokens、日夜主题、三语、测试与 lint（2026-10-19 归档）
- [x] `repository-search`：未认证的 GitHub REST 仓库检索、排序、页码分页、结果卡片（含活跃度等附加信号）、示例查询、首页插图（已实现，待归档）

## 第二阶段（纯前端）

### `github-token`

- [ ] 用户配置个人 token，存 localStorage，`GET /rate_limit` 校验，search 配额提到每分钟 30 次；在 `headers.ts` 加 Authorization，并修改 `github-api-access` spec 的"未认证"要求。
- [ ] 会话内结果缓存：在 `useRepositorySearch` 内按 `query|sort|page` 建 Map，带时间戳，新鲜期约 5 分钟，命中不发请求；刷新即失效。出现多端点并发时再评估 TanStack Query。
- [ ] （可选）显示剩余配额，配额状态已在 `rateLimit.ts` 记录。

### `category-browse`

- [ ] 六个分类（Frontend、Backend、AI/ML、DevOps、Database、Design）到 topic 查询的映射文件与分类导航页。也是不懂 qualifier 语法的用户的主要探索入口。

### 结构化筛选器

- [ ] 语言、最低 star、排除 fork 等控件，由程序拼出 qualifier，让手写语法退化为高级功能。

### 其他

- [ ] `repository-detail`：项目详情页。
- [ ] Most Popular 与 Rising Stars（近似版，`created:>日期`）排行榜。
- [ ] 项目比较（静态维度）。
- [ ] 语言标签可点击（`language:xxx`），机制与 topic 标签相同。
- [ ] 给仓库加星：需要带 `repo` 权限的 token 调 `PUT /user/starred/{owner}/{repo}`，是写操作，`github-token` 之后单独评估。
- [ ] 检索状态同步到 URL（刷新与分享）。
- [ ] 验证 star 是否会刷新 `updated_at`（用自己的仓库做一次实验，只影响提示文案）。
- [ ] 按类型显示计数（users、topics 等）：每种类型一次独立请求，共用 search 配额，`github-token` 之后只挑一两种。

## 第三阶段（需要后端）

| 需求                                        | 为什么前端做不了                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Trending 排行榜（最近 7 / 30 天新增 Stars） | GitHub 没有 trending API，也没有 star 增量字段。需要服务端定时快照 star 数并做差。 |
| 项目比较页的增长趋势曲线                    | 同上，需要历史数据。                                                               |
| Rising Stars 的精确增长率                   | 同上。纯前端只能用 `created:>日期` 做近似。                                        |
| AI 项目分析                                 | LLM API key 不能暴露在浏览器中，需要服务端代理。                                   |
| Watchlist 跨设备同步                        | 需要用户身份与服务端存储。仅本机的 localStorage 版本不需要后端。                   |
| 免 token 使用且不受 60 次/小时限制          | 需要服务端代理共享一个更高配额的 token 并做缓存。                                  |

## 已关闭

- 加载中的提交行为：去掉独立检索按钮后，加载中不再禁用任何控件，回车与输入框内图标都直接发起新检索并取消旧请求（2026-10-19）。
