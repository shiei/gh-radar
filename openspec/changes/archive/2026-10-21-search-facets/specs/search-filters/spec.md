# Spec Delta

## Purpose

定义仓库检索的结构化筛选器：有哪些项、取值范围、如何与用户的查询合成，以及在不同宽度下的位置。

## ADDED Requirements

### Requirement: Filter set
Repositories 类型 SHALL 提供四个筛选器：主语言（"任意"加一个固定的常用语言列表）、最低 star（任意 / 100 / 1,000 / 10,000）、排除 fork（开关）、排除归档（开关）。默认全部为"任意 / 关"。

#### Scenario: Defaults
- **WHEN** 用户首次进入页面
- **THEN** 四个筛选器都处于默认状态，发起的检索不带任何筛选 qualifier

### Requirement: Filters compose qualifiers without touching the input
筛选器 SHALL 由程序转换为 qualifier（`language:<x>`、`stars:>=<n>`、`fork:false`、`archived:false`）追加到用户查询之后发送；输入框内容 MUST NOT 被改写。筛选器变化时，若已有查询 SHALL 从第 1 页重新检索。筛选器 SHALL 以可读形式显示当前生效的条件。

#### Scenario: Compose
- **WHEN** 用户查询 `cli`，语言选 Rust，最低 star 选 1,000，排除 fork 开
- **THEN** 请求的 q 为 `cli language:rust stars:>=1000 fork:false`，输入框仍显示 `cli`

#### Scenario: Change re-runs from page 1
- **WHEN** 用户在第 3 页把最低 star 改为 100
- **THEN** 以新条件检索第 1 页

### Requirement: Language text is a shortcut
结果卡片上的主语言文字 SHALL 可点击，点击等同于把语言筛选器设为该语言。

#### Scenario: Click language
- **WHEN** 用户点击某卡片上的 "TypeScript"
- **THEN** 语言筛选器变为 TypeScript，以当前查询从第 1 页重新检索

### Requirement: Placement
宽屏（1024px 及以上）筛选器 SHALL 位于左栏分类导航下方；窄屏 SHALL 位于搜索框下方，默认折叠为一行"筛选"按钮，带有生效条件数。Users 与 Topics 类型下筛选器 SHALL 隐藏。

#### Scenario: Narrow collapsed
- **WHEN** 窗口宽度为 600px 且语言筛选为 Rust
- **THEN** 搜索框下显示"筛选 (1)"按钮，展开后可见四个筛选器
