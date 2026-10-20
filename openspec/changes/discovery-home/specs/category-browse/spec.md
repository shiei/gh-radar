# Spec Delta

## Purpose

定义首页的分类导航：有哪些分类、每个分类背后是什么查询、如何展示，以及点击后与检索的关系，让不懂检索语法的用户也能探索。

## ADDED Requirements

### Requirement: Six fixed categories
应用 SHALL 提供固定的六个分类：Frontend、Backend、AI / ML、DevOps、Database、Design。每个分类 SHALL 有三种语言的名称、一个图标和一条 GitHub 仓库检索查询。分类与查询的对应 SHALL 集中在一个映射文件中维护。

#### Scenario: All categories are listed
- **WHEN** 用户打开首页
- **THEN** 导航区按固定顺序显示六个分类，各带图标与当前语言的名称

### Requirement: Clicking a category runs its query
点击分类 SHALL 以该分类的查询、当前排序、第 1 页发起检索，输入框 SHALL 显示该查询，结果显示在中栏。

#### Scenario: Browse a category
- **WHEN** 用户点击 "AI / ML"
- **THEN** 发起该分类映射的查询（例如 `topic:machine-learning stars:>100`），输入框显示同一查询，结果区显示结果

#### Scenario: Keyboard
- **WHEN** 用户用 Tab 聚焦某个分类并按 Enter
- **THEN** 效果与点击相同

### Requirement: Active category is highlighted
当前检索的查询与某个分类的查询完全相同时，该分类 SHALL 显示为选中态；否则没有分类被选中。

#### Scenario: Highlight after click
- **WHEN** 用户点击 "DevOps"
- **THEN** "DevOps" 显示为选中态，其余五个不是

#### Scenario: Free search clears highlight
- **WHEN** 用户在 "DevOps" 选中后手动检索 `react`
- **THEN** 没有分类处于选中态

### Requirement: Categories adapt to narrow screens
在宽屏上分类 SHALL 作为左栏的纵向列表显示；在窄屏上 SHALL 变为搜索框上方的横向可换行 chip 行，内容与行为不变。

#### Scenario: Narrow screen
- **WHEN** 窗口宽度小于 1024px
- **THEN** 六个分类以横向 chip 显示在搜索框上方，点击行为相同
