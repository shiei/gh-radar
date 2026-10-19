# Tasks

## 1. GitHub API 访问层（对应 specs/github-api-access）

- [ ] 1.1 创建 `src/lib/github/types.ts`（`Repository`、`SearchResult`、`SearchSort`）、`errors.ts`（`GitHubError` 判别联合与类型守卫）、`headers.ts`（`buildHeaders()` 返回 Accept 与 X-GitHub-Api-Version，不含 Authorization），并用单元测试验证 `buildHeaders()` 的键集合恰为这两项
- [ ] 1.2 实现 `rateLimit.ts`：`parseRateLimit(headers)` 解析 Remaining / Reset，`getRateLimit()` / `setRateLimit()` / `subscribe()`，并用单元测试覆盖标头齐全、缺失、非数字三种情况
- [ ] 1.3 实现 `request.ts`：发 fetch、每次响应后更新配额、按 design D3 把 403 / 429 / 422 / 其他非 2xx / fetch 异常 / AbortError 归类，并用 stub fetch 的单元测试覆盖每一种分支（含 403 + Retry-After、403 + Remaining 0、403 其他、429 无标头、取消时不更新配额）
- [ ] 1.4 实现 `search.ts`：`searchRepositories({ query, sort, page }, signal)` 构造 URL（q 编码、per_page=30、sort 映射见 D6）、把响应裁剪成 `SearchResult`，并用单元测试验证三种排序的 URL、`incomplete_results` 透传、缺失字段（description / license / topics）映射为 null 或空数组

## 2. 格式化工具

- [ ] 2.1 实现 `src/lib/format/compactNumber.ts`、`relativeTime.ts`、`dateTime.ts`，均接受语言参数，并用固定系统时间的单元测试验证 en / ja / zh 三种语言下 12800 → 紧凑格式、3 天前 → 相对时间、时间戳 → 时:分 的输出非空且含预期数字

## 3. 检索状态机（对应 specs/repository-search 的排序、分页、加载、取消）

- [ ] 3.1 实现 `src/features/search/searchReducer.ts`（state 与 actions 见 D5，含 `maxPage` 推导），并用单元测试覆盖：submit 重置页码、无 query 时 setSort 不改 status、有 query 时 setSort 重置 page=1、goToPage 越界被夹紧、成功总数 0 → empty、错误 → error、aborted 不改变 state
- [ ] 3.2 实现 `useRepositorySearch()`：封装 reducer，为每次请求创建 AbortController 并取消上一个，响应到达时核对 controller 是否仍是当前，并用 `renderHook` + stub fetch 验证"先 react 后 vue，react 后到被丢弃"以及 retry 使用相同参数

## 4. UI 原子与分子（对应 specs/repository-search 的展示要求）

- [ ] 4.1 在三份语言文件中加入 design D8 列出的全部 `search.*` 键，并验证 `locales.test.ts` 通过
- [ ] 4.2 创建 atoms：`Input`、`Tag`、`SelectField`（Base UI Select 封装，props: label / value / options / onChange，带可访问名称）和 icons `SearchIcon`、`StarIcon`、`ChevronLeftIcon`、`ChevronRightIcon`、`SpinnerIcon`，并用单元测试验证 Input 转发 value/onChange、SelectField 可用键盘选择并回调
- [ ] 4.3 实现 `SearchBar` molecule（输入框本地 state、回车或按钮提交、空白输入不提交、loading 时按钮禁用、排序选择），并用单元测试覆盖四条 Submit 场景与 loading 禁用
- [ ] 4.4 实现 `RepositoryCard` molecule（owner/name 链接 target=_blank rel=noopener、描述、stars 紧凑格式、语言、相对更新时间、topics Tag、license；缺失字段不渲染），并用单元测试覆盖完整项与缺失项两种情况
- [ ] 4.5 实现 `Pagination` molecule（上一页 / 下一页 / 当前页与总页数，边界禁用）与 `StatusMessage` molecule（loading / empty / error 三态，error 按 kind 选择文案，rate_limited 带 resetAt 时显示时刻，带重试按钮），并用单元测试覆盖第 1 页、最后一页、单页三种禁用状态以及四种 error kind 的文案

## 5. 结果区域与首页接线

- [ ] 5.1 实现 `SearchResults` organism（计数文案含 1000 上限说明、`RepositoryCard` 列表、`Pagination`、翻页后滚动到区域顶部），并用单元测试验证总数 42 与 120000 两种计数文案、以及列表渲染条数
- [ ] 5.2 改造 `HomePage`：保留标语，加入 `SearchBar` 与 `SearchResults`，用 `useRepositorySearch()` 连接，并用单元测试（stub fetch）验证提交后出现结果卡片
- [ ] 5.3 用 `npm run dev` 手动走通一次真实检索（仅一次，确认真实响应形状与 fixture 一致），把该响应脱敏后保存为 `e2e/fixtures/search-react.json`，并记录第 34 页的真实行为到 design.md 的 D5

## 6. 端到端测试（mock API）

- [ ] 6.1 创建 `e2e/fixtures/`（成功 30 条、成功 12 条、空结果、total 5000 的第 34 页）与 `e2e/helpers/mockGitHub.ts`（`page.route` 返回 fixture，并对未匹配的 api.github.com 请求一律 abort），在 Playwright 配置中确保每个用例都加载该兜底拦截，并验证一个故意不 mock 的请求会被 abort
- [ ] 6.2 编写 `e2e/search.spec.ts`：输入 + 回车出结果并显示全部字段、输入 + 按钮出结果、qualifier 原样进入请求 URL、更改排序后请求 URL 带 sort=stars 且 page=1、翻页到第 2 页、12 条结果时分页禁用、第 34 页下一页禁用，并验证通过
- [ ] 6.3 编写 `e2e/search-errors.spec.ts`：空结果提示且输入框保留查询、403 + Remaining 0 显示恢复时刻、422 显示查询无效、`route.abort()` 显示网络失败并可重试、未认证请求不含 Authorization 标头，并验证通过

## 7. 集成验证与文档

- [ ] 7.1 运行 `npm run check` 与 `npm run test:e2e`，确认全部通过；如实施中决定与 design.md 不符（如第 34 页行为、目录名），更新 design.md
- [ ] 7.2 更新 `README.md`：新增 `src/features/`、`src/lib/github/`、`src/lib/format/` 的目录说明，说明未认证配额限制与 e2e 的 mock 约定，并验证 README 中列出的命令仍能按原样运行

## Workflow follow-up

- 全部任务完成后执行一次 git commit（每个 change 单独提交）。
- 归档本 change 并同步两份主 spec。
- 下一个 change 候选：`github-token`（在 `headers.ts` 加 Authorization，并修改 `github-api-access` spec 的"未认证"要求）。
