# discovery-layout Specification

## Purpose

定义首页在各断点下的区域划分：哪些内容在左栏、中栏、右栏，窄屏时如何折叠，为后续的类型切换与筛选器预留位置。

## Requirements

### Requirement: Three columns on wide screens
窗口宽度不小于 1024px 时，标语与插图下方 SHALL 分为三栏：左栏固定宽度放分类导航，中栏自适应放搜索框、示例、结果，右栏固定宽度放两个榜单。三栏顶部对齐。

#### Scenario: Wide layout
- **WHEN** 窗口宽度为 1280px
- **THEN** 分类在左、搜索与结果在中、榜单在右，三者并排

### Requirement: Single column on narrow screens
窗口宽度小于 1024px 时 SHALL 为单栏：顺序为标语与插图（插图按既有规则在 998px 以下隐藏）、分类 chip 行、搜索框与示例、结果或榜单。未发起检索时显示榜单，有检索结果时榜单 SHALL 隐藏以让位于结果。

#### Scenario: Narrow before searching
- **WHEN** 窗口宽度为 600px 且用户未检索
- **THEN** 从上到下依次是标语、分类 chip、搜索框、两个榜单

#### Scenario: Narrow after searching
- **WHEN** 窗口宽度为 600px 且用户已检索
- **THEN** 结果显示在搜索框下方，榜单不显示

### Requirement: Right column stays when searching
宽屏上发起检索后，右栏的榜单 SHALL 保持显示，不被结果挤掉。

#### Scenario: Wide after searching
- **WHEN** 窗口宽度为 1280px 且用户已检索
- **THEN** 中栏显示结果，右栏仍显示榜单

### Requirement: Content width
三栏的总宽度 SHALL 不超过 1280px 并水平居中；现有页头宽度 SHALL 随之调整为同一最大宽度，以保持对齐。

#### Scenario: Very wide window
- **WHEN** 窗口宽度为 1920px
- **THEN** 内容区宽 1280px 居中，页头内容区同宽

### Requirement: Narrow screens get corner decorations
窗口宽度小于 998px（雷达插图隐藏）时，页面顶部左右两角 SHALL 各显示一组"被扫描物"装饰：左侧为 AI、TS、GO 图标，右侧为 Fn、大脑、分支图标，各配两个小扫描框与两个渐变圆点，左右布局不对称。装饰 SHALL 位于内容区之外的绝对定位层，MUST NOT 占用布局空间或响应鼠标，并随日夜主题切换为对应配色。

#### Scenario: Narrow screen decorations
- **WHEN** 窗口宽度为 600px
- **THEN** 左右两角显示装饰，所有元素完整可见，标语与搜索框的位置不受影响

#### Scenario: Wide screen
- **WHEN** 窗口宽度为 1280px
- **THEN** 不显示装饰，雷达插图照常显示

### Requirement: Footer offers deeper-research tools and provenance
页脚 SHALL 列出覆盖本站刻意不做的领域的外部工具（GitHub Search、GitHub Trending、grep.app、Sourcegraph、OSS Insight、Libraries.io），每项带一句说明与外链图标，标题表达"需要更深入调查时"的意图。页脚底部 SHALL 有一行低调的说明，交代本站是个人维护的开源工具、以每日快照观察开源动向，并以文字链接指向源码仓库。

#### Scenario: Footer content
- **WHEN** 用户滚动到页面底部
- **THEN** 看到六个工具各带说明与外链，以及含源码链接的说明行；没有品牌宣言式的文案
