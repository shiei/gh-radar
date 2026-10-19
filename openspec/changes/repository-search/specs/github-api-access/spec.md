# Spec Delta

## Purpose

定义应用从浏览器直接访问 GitHub REST API 的方式：请求的形态、认证状态、配额信息的解析，以及各类失败如何被归类并向界面报告。本阶段所有访问均为未认证。

## ADDED Requirements

### Requirement: Requests target the GitHub REST API directly
所有数据请求 SHALL 直接从浏览器发往 `https://api.github.com`，不经过任何中间服务。每个请求 SHALL 携带 GitHub 推荐的 JSON 媒体类型和 API 版本标头。

#### Scenario: Search request shape
- **WHEN** 应用检索仓库
- **THEN** 请求为 `GET https://api.github.com/search/repositories`，带 `Accept: application/vnd.github+json` 与 `X-GitHub-Api-Version` 标头

### Requirement: Requests are unauthenticated
本阶段的请求 MUST NOT 携带任何凭据或 `Authorization` 标头。应用 MUST NOT 要求用户登录或提供 token 才能检索。

#### Scenario: No credentials attached
- **WHEN** 应用发出任意 GitHub API 请求
- **THEN** 请求中没有 `Authorization` 标头

### Requirement: Rate limit information is read from every response
每个响应的 `X-RateLimit-Remaining` 与 `X-RateLimit-Reset` 标头 SHALL 被解析并保存为当前配额状态，供界面查询。标头缺失时配额状态 SHALL 视为未知。

#### Scenario: Headers present
- **WHEN** 响应带有 `X-RateLimit-Remaining: 7` 与 `X-RateLimit-Reset: 1760000000`
- **THEN** 配额状态为剩余 7 次、恢复时间为该时间戳对应的时刻

#### Scenario: Headers absent
- **WHEN** 响应没有配额标头
- **THEN** 配额状态为未知，不报错

### Requirement: Rate limit exhaustion is reported with a reset time
当响应状态为 403 且剩余配额为 0，或状态为 429 时，请求 SHALL 以"配额用尽"失败，并附带可重试的时刻。该时刻 SHALL 优先取自 `Retry-After` 标头（秒），否则取自 `X-RateLimit-Reset`。两者都缺失时 SHALL 仍报告配额用尽但不附带时刻。

#### Scenario: Primary rate limit
- **WHEN** 响应为 403 且 `X-RateLimit-Remaining: 0`、`X-RateLimit-Reset: 1760000000`
- **THEN** 失败类型为配额用尽，重试时刻为 1760000000 对应的时间

#### Scenario: Secondary rate limit
- **WHEN** 响应为 403 且带 `Retry-After: 60`
- **THEN** 失败类型为配额用尽，重试时刻为当前时间加 60 秒

#### Scenario: 429 without headers
- **WHEN** 响应为 429 且没有配额标头
- **THEN** 失败类型为配额用尽，重试时刻未知

### Requirement: Failures are classified
除配额用尽外，请求失败 SHALL 被归为以下类型之一：查询无效（422）、网络不可达（fetch 抛出异常）、其他 API 错误（任何其他非 2xx 状态，附带状态码）。界面依据类型而不是原始状态码决定提示。

#### Scenario: Invalid query
- **WHEN** 响应为 422
- **THEN** 失败类型为查询无效

#### Scenario: Network unreachable
- **WHEN** 请求因断网抛出异常
- **THEN** 失败类型为网络不可达

#### Scenario: Server error
- **WHEN** 响应为 503
- **THEN** 失败类型为其他 API 错误，附带状态码 503

### Requirement: In-flight requests can be cancelled
每个请求 SHALL 可以被调用方取消。被取消的请求 MUST NOT 产生成功结果，也 MUST NOT 被归为上述任一失败类型，而是以"已取消"结束。

#### Scenario: Cancelled before response
- **WHEN** 调用方在响应到达前取消请求
- **THEN** 请求以已取消结束，不更新配额状态，不报告错误
