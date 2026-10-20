# Spec Delta

## ADDED Requirements

### Requirement: Results are cached within the session
同一组"查询、排序、页码"的检索结果 SHALL 在会话内缓存 5 分钟。缓存命中时 SHALL 直接显示结果而不发起请求；超过 5 分钟或刷新页面后缓存失效。失败的响应 MUST NOT 被缓存。

#### Scenario: Cache hit
- **WHEN** 用户检索 `react` 第 1 页，翻到第 2 页，再回到第 1 页，全程在 5 分钟内
- **THEN** 回到第 1 页时不发起请求，立即显示之前的结果

#### Scenario: Cache expiry
- **WHEN** 用户 6 分钟后再次检索同样的参数
- **THEN** 重新发起请求

#### Scenario: Errors are not cached
- **WHEN** 某次检索失败后用户点击重试
- **THEN** 重试发起真实请求
