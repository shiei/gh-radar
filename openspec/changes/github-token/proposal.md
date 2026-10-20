# Proposal

## Why

未认证访问 GitHub API 的配额（search 每分钟 10 次、其余每小时每 IP 60 次）只够验证流程，撑不起第二阶段的类型计数、榜单和筛选。让用户配置自己的个人 token 后，search 提到每分钟 30 次、其余每小时 5000 次，是后续所有功能的前提。同时加入会话内结果缓存，减少重复请求。

## What Changes

- 页头新增 token 入口：未配置时显示"连接 GitHub"，已配置时显示剩余 search 配额。点击打开弹层，可以粘贴、校验、保存或移除 token。
- token 只保存在本机浏览器的 localStorage，只发往 `api.github.com`，弹层中明确说明并引导创建只读的 fine-grained token。
- 保存前用 `GET /rate_limit` 校验（该端点不计配额）；无效 token 不保存并提示。
- 所有 GitHub 请求在有 token 时携带 `Authorization: Bearer`。
- 配额状态增加上限值，页头显示"剩余 / 上限"。
- 检索结果按 `查询|排序|页码` 在会话内缓存 5 分钟，命中时不发请求；刷新页面即失效。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `github-token`: 用户配置、校验、移除个人 token 的行为，token 的存放位置与安全约束，以及配额状态的展示。

### Modified Capabilities

- `github-api-access`: "Requests are unauthenticated" 改为"有 token 时携带 Authorization"；配额解析增加上限值。
- `repository-search`: 新增会话内缓存要求。

## Impact

- `src/lib/github/`：新增 `token.ts`；`headers.ts` 读取 token；`rateLimit.ts` 解析 `X-RateLimit-Limit`；新增 `validateToken()`。
- `src/features/search/`：缓存逻辑。
- 新增 `TokenMenu` molecule，接入 `Header`。
- 三份语言文件新增 `token.*` 键。
- 外部依赖不变，仍是 GitHub REST API。
