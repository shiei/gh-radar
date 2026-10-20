# Spec Delta

## Purpose

定义首页在各断点下的区域划分：哪些内容在左栏、中栏、右栏，窄屏时如何折叠，为后续的类型切换与筛选器预留位置。

## ADDED Requirements

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
