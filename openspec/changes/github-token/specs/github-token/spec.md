# Spec Delta

## Purpose

定义用户在本站配置 GitHub 个人 token 的方式：入口、校验、保存、移除、安全约束，以及配额状态如何展示给用户。

## ADDED Requirements

### Requirement: Token entry lives in the header
页头 SHALL 有一个始终可见的 token 入口。未配置时它显示"连接 GitHub"类文案；已配置时显示当前 search 配额的"剩余 / 上限"。点击入口 SHALL 打开一个弹层。

#### Scenario: Not configured
- **WHEN** 用户未配置 token
- **THEN** 页头入口显示连接提示，不显示配额数字

#### Scenario: Configured
- **WHEN** 用户已配置 token 且最近一次响应的配额为剩余 27、上限 30
- **THEN** 页头入口显示 27 / 30

### Requirement: Token is validated before it is saved
弹层中 SHALL 有一个密码型输入框和保存操作。保存时 SHALL 先校验 token；校验通过才写入本机存储并关闭弹层，校验失败 SHALL 显示无效提示且不保存。校验进行中 SHALL 显示加载状态。

#### Scenario: Save a valid token
- **WHEN** 用户粘贴有效 token 并保存
- **THEN** token 被保存，弹层关闭，页头入口变为显示配额

#### Scenario: Reject an invalid token
- **WHEN** 用户粘贴无效 token 并保存
- **THEN** 显示"token 无效"提示，输入框保留内容，存储中没有 token

#### Scenario: Blank input
- **WHEN** 用户未输入任何内容就保存
- **THEN** 不发起校验，不保存

### Requirement: Token is stored locally only
token SHALL 只保存在当前浏览器的本机存储中，MUST NOT 发往本站或任何第三方服务。弹层 SHALL 用一句话说明这一点，并提供创建只读 fine-grained token 的 GitHub 链接。

#### Scenario: Persists across reload
- **WHEN** 用户保存 token 后刷新页面
- **THEN** 页头入口仍显示已配置状态，后续请求仍携带该 token

#### Scenario: Guidance is shown
- **WHEN** 用户打开弹层
- **THEN** 看到"仅存于本机，只发往 GitHub"的说明和创建 token 的链接

### Requirement: Token can be removed
已配置时弹层 SHALL 提供移除操作。移除后 SHALL 清除本机存储中的 token，配额状态重置为未知，后续请求不再携带凭据。

#### Scenario: Remove
- **WHEN** 用户点击移除
- **THEN** 页头入口回到未配置状态，下一次检索请求没有 `Authorization` 标头

### Requirement: Token input is never echoed
输入框 SHALL 为密码型，已保存的 token MUST NOT 以明文回显在界面上。

#### Scenario: Reopen after saving
- **WHEN** 用户保存 token 后再次打开弹层
- **THEN** 输入框为空且为密码型，显示"已配置"状态而不是 token 内容
