# Spec Delta

## Purpose

定义用户在首页检索 GitHub 仓库的行为：输入与提交、排序、结果列表的展示字段、分页，以及加载中、无结果、失败三种状态的呈现。

## ADDED Requirements

### Requirement: Search is submitted explicitly
首页 SHALL 提供一个检索输入框和提交按钮。检索 SHALL 仅在用户按下回车或点击提交按钮时发起，输入过程中 MUST NOT 自动发起请求。首尾空白被去除后为空的输入 MUST NOT 发起请求。

#### Scenario: Submit with Enter
- **WHEN** 用户在输入框中输入 `react` 并按下回车
- **THEN** 发起一次以 `react` 为查询的检索

#### Scenario: Submit with button
- **WHEN** 用户在输入框中输入 `react` 并点击提交按钮
- **THEN** 发起一次以 `react` 为查询的检索

#### Scenario: Typing does not search
- **WHEN** 用户逐字输入 `react` 但未提交
- **THEN** 不发起任何检索请求

#### Scenario: Blank input is ignored
- **WHEN** 用户提交仅包含空格的输入
- **THEN** 不发起请求，输入框保持可编辑，不显示错误

### Requirement: Query text is passed through unchanged
用户提交的文本（去除首尾空白后）SHALL 原样作为查询发送，不做改写、拆分或转义以外的处理，因此 GitHub 的 qualifier 语法可以直接使用。

#### Scenario: Qualifier syntax works
- **WHEN** 用户提交 `language:rust cli stars:>500`
- **THEN** 发送的查询正是 `language:rust cli stars:>500`

### Requirement: Results can be sorted
检索区域 SHALL 提供排序选择，选项为：best match（默认）、most stars、recently updated。已有检索结果时更改排序 SHALL 以新排序从第一页重新检索；尚无检索时更改排序 SHALL 仅记住选择。

#### Scenario: Default sort is best match
- **WHEN** 用户首次进入页面
- **THEN** 排序选择显示为 best match

#### Scenario: Changing sort re-runs the search
- **WHEN** 用户已检索 `react` 并位于第 3 页，然后将排序改为 most stars
- **THEN** 以 `react` 和 most stars 从第 1 页重新检索

#### Scenario: Changing sort before any search
- **WHEN** 用户尚未提交任何检索，将排序改为 recently updated
- **THEN** 不发起请求；之后的首次检索使用 recently updated

### Requirement: Result items show repository facts
每个结果项 SHALL 显示：`owner/name`、描述、star 数、主语言、最近更新时间、topics、license。缺失的字段 SHALL 省略而不是显示占位文本。点击结果项的名称 SHALL 在新标签页打开该仓库的 GitHub 页面。

#### Scenario: Full item
- **WHEN** 结果中有一个仓库，其描述、语言、topics、license 均存在
- **THEN** 结果项显示上述全部字段，star 数以紧凑格式显示（如 12.8k），更新时间以相对时间显示（如 3 days ago）

#### Scenario: Partial item
- **WHEN** 结果中有一个仓库没有描述、没有 license、topics 为空
- **THEN** 结果项不显示描述、license 和 topics 区域，其余字段正常显示

#### Scenario: Item links to GitHub
- **WHEN** 用户点击结果项的名称
- **THEN** 在新标签页打开 `https://github.com/{owner}/{name}`

#### Scenario: Facts follow the active language
- **WHEN** 当前界面语言为中文
- **THEN** 相对时间与数字格式按中文习惯显示

### Requirement: Result count is shown
检索成功后 SHALL 显示匹配总数。当总数超过可访问上限（1000 条）时 SHALL 说明只能浏览前 1000 条。

#### Scenario: Small result set
- **WHEN** 检索返回总数 42
- **THEN** 显示 42 条匹配

#### Scenario: Large result set
- **WHEN** 检索返回总数 120000
- **THEN** 显示 120,000 条匹配，并说明仅可浏览前 1000 条

### Requirement: Results are paginated
结果 SHALL 分页展示，每页固定 30 条。SHALL 提供上一页、下一页控件和当前页指示。第 1 页的上一页 SHALL 不可用；到达最后一页或可访问上限（第 34 页）时下一页 SHALL 不可用。翻页后 SHALL 滚动到结果区域顶部。

#### Scenario: Next page
- **WHEN** 用户在第 1 页点击下一页
- **THEN** 以相同查询和排序检索第 2 页，页指示变为第 2 页

#### Scenario: First page has no previous
- **WHEN** 用户位于第 1 页
- **THEN** 上一页控件不可用

#### Scenario: Last reachable page
- **WHEN** 总数为 5000 且用户位于第 34 页
- **THEN** 下一页控件不可用

#### Scenario: Fewer results than one page
- **WHEN** 总数为 12
- **THEN** 上一页与下一页控件均不可用

### Requirement: Loading state
请求进行中 SHALL 显示加载中指示，提交按钮 SHALL 不可用。若用户在请求进行中提交新的检索，旧请求 SHALL 被取消，其结果 MUST NOT 覆盖新请求的结果。

#### Scenario: Loading indicator
- **WHEN** 检索请求已发出但尚未返回
- **THEN** 结果区域显示加载中，提交按钮不可用

#### Scenario: Stale response is discarded
- **WHEN** 用户先检索 `react`，在其返回前又检索 `vue`
- **THEN** 最终只显示 `vue` 的结果，即使 `react` 的响应后到

### Requirement: Empty state
检索成功但没有任何匹配时 SHALL 显示无结果提示，并保留用户的查询文本以便修改。

#### Scenario: No matches
- **WHEN** 检索返回总数 0
- **THEN** 显示无结果提示，输入框仍显示原查询

### Requirement: Failure state
检索失败时 SHALL 根据失败原因显示对应提示：配额用尽显示可重试的时间，查询语法无效提示用户修改查询，网络或其他错误显示通用失败提示。失败提示 SHALL 提供重试操作，重试 SHALL 以相同参数再次检索。

#### Scenario: Rate limited
- **WHEN** 检索因配额用尽而失败，且恢复时间为 14:32
- **THEN** 显示配额用尽提示，并说明 14:32 后可以重试

#### Scenario: Invalid query
- **WHEN** 检索因查询语法无效而失败
- **THEN** 显示查询无效提示，不显示配额信息

#### Scenario: Network failure
- **WHEN** 请求无法到达服务器
- **THEN** 显示通用失败提示和重试操作

#### Scenario: Retry
- **WHEN** 用户在失败提示上点击重试
- **THEN** 以相同查询、排序和页码再次检索
