# Design

## Context

`repository-search` 已归档。相关现状：`headers.ts` 是唯一生成请求头的地方；`rateLimit.ts` 用模块级变量存最近一次响应的 remaining / resetAt 并提供订阅；`useRepositorySearch` 每个 requestId 发一次请求；页头右侧有语言与主题控件。行为契约见本 change 的三份 delta spec。

## Goals / Non-Goals

**Goals:**
- token 的读写集中在一个模块，请求层只在 `buildHeaders()` 读一次。
- 校验不消耗配额，失败不留下脏状态。
- 缓存对 reducer 透明：命中时仍走 `succeeded` action，组件不感知。

**Non-Goals:**
- 不做 OAuth 登录；不代用户发起任何写操作。
- 不把缓存持久化到 localStorage。
- 不显示非 search 资源的配额。

## Decisions

### D1. token 模块
`src/lib/github/token.ts`：`getToken()` / `setToken()` / `clearToken()` / `subscribeToken()`，存储键 `osr.token`。`buildHeaders()` 在有 token 时加 `Authorization: Bearer`。token 变化时调用 `setRateLimit(null)`，让页头回到未知状态直到下一次响应。

### D2. 校验
`validateToken(token, signal)`：直接 fetch `GET /rate_limit`，带候选 token（不是已保存的），200 → 解析 `resources.search` 的 limit / remaining / reset 写入配额状态并返回 ok；401 → `{ kind: 'invalid_token' }`；其余沿用 `request.ts` 的分类。不复用 `request()` 是因为它读的是已保存的 token。

### D3. 配额上限
`RateLimit` 增加 `limit: number | null`，`parseRateLimit` 读 `X-RateLimit-Limit`。页头显示 `remaining / limit`，limit 未知时只显示 remaining。

### D4. UI
`TokenMenu` molecule：Base UI Popover。触发按钮在 `Header` 的设置区最左侧。内容：一句说明、创建 token 的链接（指向 GitHub 的 fine-grained token 页面，预选只读）、密码输入、保存按钮（校验中显示 RadarSpinner）、错误提示、已配置时的移除按钮。用 `useSyncExternalStore` 订阅 token 与配额状态。

### D5. 缓存
`src/features/search/searchCache.ts`：模块级 `Map<string, { result, storedAt }>`，键 `${query}|${sort}|${page}`，TTL 5 分钟，上限 50 条（超出按插入顺序淘汰）。`useRepositorySearch` 的 effect 先查缓存：命中则同步 dispatch `succeeded` 并返回，不建 AbortController；未命中走原路径，成功后写入。`retry` 前先删除该键，保证重试是真实请求。token 变化不清缓存（结果与认证状态无关）。

### D6. 测试
单元：token 模块、headers 带 / 不带 token、parseRateLimit 带 limit、validateToken 三种响应、searchCache 的 TTL 与淘汰、hook 的命中路径。e2e：mock `/rate_limit`，保存有效 token 后断言下一次 search 请求带 Authorization；无效 token 显示错误且不保存；刷新后仍配置；移除后无 Authorization；相同参数第二次检索不发请求。

## Risks / Trade-offs

- [token 存在 localStorage，XSS 可窃取] → 本站无第三方脚本，不渲染任何用户生成的 HTML；弹层明确建议只读 fine-grained token，泄露面最小。
- [`/rate_limit` 的 search 资源与实际 search 响应头可能短暂不一致] → 页头以最近一次响应为准，校验只是初始化。
- [缓存命中时配额显示不更新] → 可接受，命中本来就不消耗配额。
