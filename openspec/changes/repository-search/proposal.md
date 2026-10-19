# Proposal

## Why

检索是这个产品的核心入口，优先级最高。在 `project-foundation` 提供的骨架之上，用 GitHub REST Search API 直接从浏览器发起检索，就能在没有后端的情况下交付一个可用的最小产品。本阶段刻意不做 token 配置，以最小的面积验证检索流程、结果展示和配额受限时的体验。

## What Changes

- 首页加入搜索框，不设独立检索按钮。用户输入关键字并显式提交（回车或点击输入框内的提交图标）后，调用 `GET https://api.github.com/search/repositories` 获取结果。
- 搜索框内容原样作为 `q` 参数透传，因此用户可以直接使用 GitHub 的 qualifier 语法（例如 `language:rust cli`）。
- 提供排序选择：best match（默认）、stars、recently updated，对应 API 原生的 sort 参数。
- 结果以列表展示，每项包含：owner / name、描述、stars、主语言、最近更新时间、topics、license。点击跳转到 GitHub 仓库页面。
- 支持分页，遵守 Search API 的上限：每页最多 100 条，最多访问前 1000 条结果。
- 所有请求均为未认证调用。当收到 403 / 429（配额用尽）时，显示友好提示，并根据响应头 `X-RateLimit-Reset` 告知用户何时可以重试。
- 展示加载中、无结果、请求失败三种状态。
- 所有新增文案进入三种语言的语言文件；所有样式使用 tokens。
- 单元测试覆盖查询参数构造与响应解析；端到端测试使用 mock 的 API 响应，不真实请求 GitHub。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `repository-search`: 用户提交检索、选择排序、浏览分页结果的行为，以及结果项展示的字段。
- `github-api-access`: 浏览器直接访问 GitHub REST API 的方式、认证状态（本阶段为未认证）以及配额受限时的用户可见行为。后续 token 配置的 change 将修改此 capability。

### Modified Capabilities

（无。）

## Impact

- 新增 GitHub API 客户端模块、检索页面及其组件（按 Atomic Design 分层）、三种语言的新增文案。
- 外部依赖：GitHub REST API 的 `search/repositories` 端点。未认证配额为每分钟 10 次 search 请求、每小时每 IP 60 次总请求。
- 无后端，无持久化。

## Deferred: requires backend

以下需求在纯前端架构下无法实现或体验极差，明确推迟。后续每个 change 的 proposal 应继承本节，完成一项划去一项。

| 需求                                        | 为什么前端做不了                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Trending 排行榜（最近 7 / 30 天新增 Stars） | GitHub 没有 trending API，也没有 star 增量字段。需要服务端定时快照 star 数并做差。 |
| 项目比较页的增长趋势曲线                    | 同上，需要历史数据。                                                               |
| Rising Stars 的精确增长率                   | 同上。纯前端只能用 `created:>日期` 做近似。                                        |
| AI 项目分析                                 | LLM API key 不能暴露在浏览器中，需要服务端代理。                                   |
| Watchlist 跨设备同步                        | 需要用户身份与服务端存储。仅本机的 localStorage 版本不需要后端。                   |
| 免 token 使用且不受 60 次/小时限制          | 需要服务端代理共享一个更高配额的 token 并做缓存。                                  |

## Not in this change (planned as later frontend-only changes)

- `github-token`：用户配置个人 token，存于 localStorage，用 `GET /rate_limit` 校验，将 search 配额提升到每分钟 30 次。
- `category-browse`：六个分类（Frontend、Backend、AI/ML、DevOps、Database、Design）到 topic 查询的映射文件与分类导航页。
- `repository-detail`：项目详情页。
- Most Popular 与 Rising Stars（近似版）排行榜。
- 结构化的技术栈筛选器。
- 项目比较（静态维度）。
- 给仓库加星待定：需要用户 token 的写操作，`github-token` 之后单独评估（详见 tasks.md 的 Workflow follow-up）。
- 会话内结果缓存待做：当前不缓存，重复参数会重新请求。建议并入 `github-token` change（详见 tasks.md 的 Workflow follow-up）。
