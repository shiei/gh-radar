# Spec Delta

## ADDED Requirements

### Requirement: Requests carry the user's token when configured
当用户已配置 token 时，所有 GitHub API 请求 SHALL 携带 `Authorization: Bearer <token>` 标头；未配置时 MUST NOT 携带任何凭据。token MUST NOT 发往 `api.github.com` 以外的任何地址。

#### Scenario: Token configured
- **WHEN** 用户已保存有效 token 并发起检索
- **THEN** 请求带 `Authorization: Bearer` 标头，值为该 token

#### Scenario: No token
- **WHEN** 用户未配置 token
- **THEN** 请求中没有 `Authorization` 标头

### Requirement: Token can be validated without spending quota
应用 SHALL 通过 `GET /rate_limit` 校验 token：200 视为有效并同时更新配额状态；401 视为无效。该请求不计入配额。

#### Scenario: Valid token
- **WHEN** 用 token 请求 `/rate_limit` 返回 200
- **THEN** 校验通过，配额状态更新为响应中 search 资源的上限与剩余

#### Scenario: Invalid token
- **WHEN** 用 token 请求 `/rate_limit` 返回 401
- **THEN** 校验失败，报告 token 无效，配额状态不变

## MODIFIED Requirements

### Requirement: Rate limit information is read from every response
每个响应的 `X-RateLimit-Limit`、`X-RateLimit-Remaining` 与 `X-RateLimit-Reset` 标头 SHALL 被解析并保存为当前配额状态（上限、剩余、恢复时刻），供界面查询。Remaining 或 Reset 缺失时配额状态 SHALL 视为未知；Limit 缺失时上限视为未知但不影响其余字段。

#### Scenario: Headers present
- **WHEN** 响应带有 `X-RateLimit-Limit: 30`、`X-RateLimit-Remaining: 7` 与 `X-RateLimit-Reset: 1760000000`
- **THEN** 配额状态为上限 30、剩余 7、恢复时间为该时间戳对应的时刻

#### Scenario: Headers absent
- **WHEN** 响应没有配额标头
- **THEN** 配额状态为未知，不报错

## REMOVED Requirements

### Requirement: Requests are unauthenticated
**Reason**: 第二阶段允许用户配置个人 token，未认证不再是唯一状态。
**Migration**: 由 "Requests carry the user's token when configured" 覆盖：未配置 token 时行为与原要求相同。
