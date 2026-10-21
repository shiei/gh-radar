# search-types Specification

## Purpose

定义检索对象的三种类型（仓库、用户、topic）：如何切换、各自请求什么、结果怎么展示、匹配数何时显示。

## Requirements

### Requirement: Three search types
检索 SHALL 支持三种类型：Repositories（默认）、Users、Topics，以搜索框旁的分段切换呈现。切换类型 SHALL 以当前已提交的查询、第 1 页重新检索；尚无查询时只记住类型。排序选择 SHALL 只在 Repositories 类型下显示。

#### Scenario: Switch type after a search
- **WHEN** 用户已检索 `react` 并切换到 Users
- **THEN** 发起 `GET /search/users?q=react` 的检索，页码为 1，结果区显示用户卡片

#### Scenario: Switch type before any search
- **WHEN** 用户尚未检索，切换到 Topics
- **THEN** 不发起请求；之后的首次检索使用 Topics

### Requirement: Users results
Users 类型的结果项 SHALL 显示头像、登录名、账号类型（用户或组织），点击 SHALL 在新标签页打开 GitHub 个人页。分页规则与仓库相同。

#### Scenario: User card
- **WHEN** Users 检索返回一个组织账号
- **THEN** 卡片显示其头像、登录名与"Organization"标签，链接指向 GitHub 页面

### Requirement: Topics results
Topics 类型的结果项 SHALL 显示 topic 名称、显示名、简短描述，以及 featured / curated 标记。点击名称 SHALL 切换到 Repositories 类型并以 `topic:<name>` 检索。

#### Scenario: Topic card leads to repositories
- **WHEN** 用户在 Topics 结果中点击 `machine-learning`
- **THEN** 类型变为 Repositories，输入框显示 `topic:machine-learning`，发起仓库检索

### Requirement: Type counts only with a token
已配置 token 时，每次检索 SHALL 额外请求另外两种类型的匹配总数并显示在切换按钮上；未配置时 MUST NOT 请求，按钮只显示类型名。计数请求失败 MUST NOT 影响主结果。

#### Scenario: Counts with token
- **WHEN** 已配置 token 且用户检索 `react`（Repositories）
- **THEN** Users 与 Topics 按钮分别显示各自的匹配数

#### Scenario: No counts without token
- **WHEN** 未配置 token 且用户检索
- **THEN** 只发起一次请求，切换按钮不显示数字
