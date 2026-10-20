# github-token Specification

## Purpose

定义用户在本站配置 GitHub 个人 token 的方式：入口、校验、保存、移除、安全约束，以及配额状态如何展示给用户。

## Requirements

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

### Requirement: Token lives in memory unless the user opts to remember it
保存的 token 默认 SHALL 只保存在内存中，关闭标签页即消失，MUST NOT 写入任何持久化存储。弹层 SHALL 提供"在此设备记住"的勾选，默认不勾选；勾选后 token 才写入本浏览器的 localStorage，勾选旁 SHALL 说明页面脚本与浏览器扩展可能读取、共用电脑不要勾选。无论哪种方式，token MUST NOT 发往 `api.github.com` 以外的任何地址。

#### Scenario: Default is memory only
- **WHEN** 用户保存 token 且未勾选"在此设备记住"
- **THEN** 本标签页内的请求携带该 token，localStorage 中没有 token，刷新页面后回到未配置状态

#### Scenario: Remember on this device
- **WHEN** 用户勾选"在此设备记住"后保存
- **THEN** token 写入 localStorage，刷新页面后仍为已配置状态，弹层显示"已在此设备记住"

#### Scenario: Risk note is shown
- **WHEN** 用户打开弹层
- **THEN** 看到"默认只在内存、只发往 GitHub"的说明，以及勾选项旁关于脚本与扩展可读的提示

### Requirement: Guidance asks for a least-privilege token
弹层 SHALL 提供指向 GitHub 新建 fine-grained token 页面的链接，链接文案只说明用途；链接下方 SHALL 另起一条注意说明，解释为降低泄露后的风险推荐：只读、仅公开仓库、短期过期。

#### Scenario: Link and wording
- **WHEN** 用户打开弹层
- **THEN** 看到创建链接，其下方的注意说明包含只读、仅公开仓库、短期过期三点

### Requirement: Production page restricts script and connection origins
生产构建的页面 SHALL 带有 Content Security Policy：脚本只允许本站来源（内联的主题启动脚本以哈希放行），网络连接只允许本站与 `api.github.com`，图片只允许本站与 GitHub 头像域名，禁止 object 与外部 base。开发模式不受此约束。

#### Scenario: Policy present in the built page
- **WHEN** 加载生产构建的首页
- **THEN** 页面声明了上述策略，主题启动脚本仍正常执行，检索与头像加载不受影响

#### Scenario: Injected script is blocked
- **WHEN** 页面中出现来自其他域名的脚本或未放行的内联脚本
- **THEN** 浏览器拒绝执行

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
