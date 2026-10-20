# Design

## Context

`project-foundation` 已归档，可用的基础：Atomic Design 目录、语义化 token 工具类、i18next（键类型由 `en.json` 推导）、Base UI 1.0.0-rc.0、Vitest + Testing Library（jsdom，已有 ResizeObserver / matchMedia stub）、Playwright 1.56.1（build + preview）。首页目前只有标语和欢迎文案，页头有语言与主题切换。

外部约束：GitHub Search API 未认证时每分钟 10 次、每小时每 IP 60 次；`per_page` 上限 100；`page * per_page` 超过 1000 时返回 422。行为契约见 `specs/repository-search/spec.md` 与 `specs/github-api-access/spec.md`。

## Goals / Non-Goals

**Goals:**
- API 访问层与 UI 完全解耦：`src/lib/github/` 不依赖 React，可单独测试；错误以类型区分，UI 只认类型。
- 检索状态（查询、排序、页码、结果、状态）集中在一个 hook 里，组件保持无状态。
- 单元测试与 e2e 都不真实请求 GitHub。
- 为后续 `github-token` change 预留位置：请求头由一个函数集中生成，加 token 只改那一处。

**Non-Goals:**
- 不把检索状态同步到 URL（刷新即清空）。这是有价值的功能，留给后续 change。
- 不缓存响应，不做请求去重。
- 不引入数据请求库（TanStack Query 等），见 D2。
- 不做结构化筛选器（语言下拉等），qualifier 透传已覆盖高级用户。
- 不显示剩余配额数字。配额状态会被记录（spec 要求），但本阶段 UI 只在用尽时提示。

## Decisions

### D1. 模块划分
```
src/lib/github/
  headers.ts        buildHeaders(): Accept / X-GitHub-Api-Version；token change 将在此加 Authorization
  errors.ts         GitHubError 联合类型: rate_limited | invalid_query | network | api | aborted
  rateLimit.ts      parseRateLimit(headers) 与当前配额状态的读写（模块级变量 + 订阅函数）
  request.ts        request<T>(path, init, signal): 发 fetch、解析配额、按状态分类错误
  search.ts         searchRepositories({ query, sort, page }, signal) -> SearchResult
  types.ts          Repository / SearchResult（仅保留 UI 需要的字段，含 owner.avatar_url）
  index.ts
src/lib/format/
  compactNumber.ts  Intl.NumberFormat(lang, { notation: 'compact' })
  relativeTime.ts   Intl.RelativeTimeFormat(lang) 选择合适单位
  dateTime.ts       Intl.DateTimeFormat(lang, { hour, minute }) 用于配额恢复时刻
src/features/search/
  useRepositorySearch.ts   useReducer + AbortController 的检索状态机
  searchReducer.ts         纯 reducer，单独测试
```
`features/` 是新目录：它放"某个功能的状态逻辑"，既不是通用 lib 也不是 UI 组件。和 `lib/` 的边界是：`lib/` 不知道 React 组件树，`features/` 是 React hook。

### D2. 不引入数据请求库
只有一个端点、无缓存需求、无乐观更新。一个 reducer 加 AbortController 足够表达"取消旧请求、丢弃过期响应"。等出现详情页、比较页多端点并发时再评估 TanStack Query。备选 SWR / TanStack Query，放弃理由是本阶段收益不抵依赖和心智成本。

### D3. 错误模型
```ts
type GitHubError =
  | { kind: 'rate_limited'; resetAt: Date | null }
  | { kind: 'invalid_query' }
  | { kind: 'network' }
  | { kind: 'api'; status: number }
  | { kind: 'aborted' }
```
用判别联合而不是 Error 子类：reducer 可以直接存进 state，序列化友好，测试断言简单。`request.ts` 是唯一产生这些值的地方。403 判定：`X-RateLimit-Remaining === '0'` 或存在 `Retry-After` 视为 rate_limited，否则归为 `api`（403 也可能是其他原因）。

### D4. 配额状态存放
`rateLimit.ts` 用模块级变量保存最新的 `{ remaining, resetAt }`，并提供 `getRateLimit()` / `subscribe()`。本阶段 UI 不消费它，但 spec 要求记录；`github-token` change 会用它显示剩余次数。不放进 React state 是因为它跨请求、跨组件，且不触发重渲染也没关系。

### D5. 检索状态机
```
state: {
  query: string            已提交的查询（不是输入框内容）
  sort: 'best' | 'stars' | 'updated'
  page: number
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error'
  result: SearchResult | null
  error: GitHubError | null
}
actions: submit(query) | setSort(sort) | goToPage(page) | retry()
```
- 输入框内容是 SearchBar 的本地 state，只有提交才进入 reducer。
- `setSort` 在 `query` 为空时只改 sort，不触发请求；否则重置 page=1 并请求。
- 每次请求前 `abort()` 上一个 controller；响应到达时若 controller 已不是当前的则丢弃（双重保险：abort 会让 fetch reject 为 aborted，reducer 对 aborted 不做任何事）。
- 每页 10 条，最大页数 `min(ceil(total/10), 100)`。实测（2026-10-19，当时 per_page=30，`page=34`）返回 200 且完整 30 条，说明 GitHub 的 1000 条限制按起始偏移判断（`(page-1)*per_page < 1000`）；换算到 per_page=10 即第 100 页可完整访问，第 101 页按文档会返回 422。用户在实施后把每页从 30 改为 10，以缩短单页长度。

### D6. 请求参数映射
| UI 排序 | API 参数 |
|--------|---------|
| best | 不传 sort |
| stars | `sort=stars&order=desc` |
| updated | `sort=updated&order=desc` |

`q` 直接 `encodeURIComponent(query.trim())`。`per_page=10`。

### D7. UI 组件
- atoms：`Input`（原生 input，token 样式）、`Tag`（topic 标签）、`SelectField`（Base UI Select 的通用封装，带 label 与 options；排序选择使用它）、icons：`SearchIcon`、`StarIcon`、`ChevronLeftIcon`、`ChevronRightIcon`、`SpinnerIcon`。
- molecules：`SearchHints`（搜索框下方的示例查询 chip 与语法文档链接，点击 chip 走和输入框相同的 `submit`）、`SearchBar`（Input + SelectField，无独立检索按钮：回车提交，输入框内右侧一个箭头图标作为提示兼点击提交；`type="search"` + `enterKeyHint="search"` 让手机软键盘显示"搜索"键；加载中箭头变 spinner 但不禁用任何东西，新提交直接取消旧请求）、`RepositoryCard`、`Pagination`（Previous / 页码 / Next 使用 ghost 按钮与页码按钮，当前页 accent 底色白字、悬浮不变，`pageRange()` 负责首尾加当前页 ±2 的窗口与省略号）、`StatusMessage`（loading / empty / error 三态，error 带重试按钮）。
  - 历史记录：最初有独立 Search 按钮，加载中用原生 `disabled`，但这会同时禁用浏览器的隐式提交（回车），与"进行中提交新检索要取消旧请求"冲突；`aria-disabled` 加 click 的 `preventDefault` 在真实浏览器里同样会挡掉回车。去掉独立按钮后这个矛盾不复存在，原待办随之关闭。
- organisms：`SearchResults`（计数、列表、分页的组合）。
- 结果卡片的附加信号（2026-10-20 定稿）：活跃度来自 `pushed_at`（`activityOf`：30 天 active、180 天 quiet、其余 inactive），Archived / Fork / Template 来自 `archived` / `fork` / `is_template`，fork 数、未关闭 issue 数（GitHub 把 PR 计入）、`size`（KB，`formatKb`）、`owner.type`、`homepage`。曾经显示的 star 增速已移除。
- topic 标签是 `<button>`，点击后通过 `onSearch` 回调把 `topic:<名称>` 交给 `useRepositorySearch().submit`，与输入框提交走同一条路径；`SearchBar` 接收已提交的 `query` 并同步到本地输入值，所以无论检索从哪里发起，输入框都显示当前查询。
- `HomePage` 组合 SearchBar + SearchResults，标语保留在搜索框上方（与草图一致）。
LanguageSwitcher 暂不改用 SelectField，避免扩大范围；后续可以统一。

### D8. 文案与格式化
- 新增键放在 `search.*` 命名空间下：`search.placeholder`、`search.submit`、`search.sort.{label,best,stars,updated}`、`search.count`（带 `{{count}}` 插值）、`search.countCapped`、`search.pagination.{previous,next,page}`（previous / next 文案不含 page 字样，用户要求）、`search.state.{loading,empty}`、`search.error.{rateLimited,rateLimitedUntil,invalidQuery,network,api,retry}`、`search.repo.{stars,updated,license}`。
- 数字、相对时间、时刻全部用 `Intl` 并传入当前语言，不手写格式。单元测试固定 `en` 并用 `vi.setSystemTime` 固定当前时间。
- 时间显示采用 GitHub 式混合策略（`formatTimestamp`）：30 天内相对时间，超过则 `Intl.DateTimeFormat` 的绝对日期；元素 `title` 带精确到分钟的完整时间。卡片同时显示 `pushed_at`（Last push，代码推送）与 `updated_at`（Metadata updated，仓库元数据变更），两者格式规则相同，标签措辞区分，`title` 里先说明含义再给完整时间。

### D9. 测试策略
- `lib/github` 单元测试用 `vi.stubGlobal('fetch', vi.fn())` 构造 `Response`，覆盖每种状态码与标头组合；不引入 msw。
- reducer 单独测试状态转移；hook 用 Testing Library 的 `renderHook` 配 stub fetch 测取消与过期响应。
- e2e 用 `page.route('https://api.github.com/**', ...)` 返回 `e2e/fixtures/*.json`，用例：成功检索与字段显示、排序触发重检索、翻页与边界、无结果、配额用尽提示、422、断网（`route.abort()`）。
- e2e 必须在任何用例中都拦截 GitHub 域名，避免误打真实 API 消耗配额。实施方式是 `e2e/helpers/test.ts` 用 `test.extend` 注册一个 `auto` fixture，为每个页面先挂一条 abort 所有 `api.github.com` 请求的 route；所有 spec 从该文件导入 `test`。用例自己注册的 route 后注册先匹配，因此可以覆盖兜底。

## Risks / Trade-offs

- [未认证 60 次/小时按 IP 计，本地开发反复手测很快用尽] → 开发时用 `npm run dev` 搭配浏览器 devtools 的请求拦截，或尽快实施 `github-token` change。design 不为此加临时后门。
- [GitHub 对 403 的语义不唯一] → D3 的判定规则；无法判定时走通用 `api` 错误，提示仍可重试。
- [第 34 页的边界行为未实测] → 任务里包含用 fixture 模拟 total=5000 的边界测试，真实行为留到实施时用一次真实请求确认并记录。
- [`Intl.RelativeTimeFormat` 在 jsdom 下依赖 Node 的 ICU] → Node 24 自带 full-icu，日文和中文可用；CI 若用精简 Node 需注意。
- [结果列表 30 条每条带 topics，DOM 节点较多] → 本阶段不做虚拟列表；30 条在实测中不构成问题。

## Open Questions

- （已解决）相对时间阈值定为 30 天，见 D8。
