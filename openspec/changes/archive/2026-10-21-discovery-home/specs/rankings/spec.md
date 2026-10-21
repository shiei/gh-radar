# Spec Delta

## Purpose

定义首页的两个榜单 Most Popular 与 Rising Stars：数据来自每日快照，Rising Stars 用真实的 30 天 star 增量，不消耗 API 配额。

## ADDED Requirements

### Requirement: Rankings are computed from the snapshot
榜单 SHALL 从 `public/data/latest.json` 与对应分类的 `series/<分类>.json` 计算，MUST NOT 调用 GitHub API。Most Popular：按当天 star 数降序。Rising Stars：按最近 30 天的 star 增量（当天 star 减去 30 天前最近一个点的 star）降序；当序列不足 7 天时 SHALL 退化为"近 90 天创建的仓库按 star 降序"并在标题旁标注为近似。

#### Scenario: Rising by delta
- **WHEN** 序列覆盖超过 7 天，仓库 A 30 天内涨 1200 star，仓库 B 涨 800
- **THEN** Rising Stars 中 A 排在 B 前，每条显示 +1.2K 的增量

#### Scenario: Fallback when history is short
- **WHEN** 序列只覆盖 3 天
- **THEN** Rising Stars 显示近 90 天创建的仓库按 star 排序，标题旁标注"数据积累中，暂按创建时间近似"

### Requirement: Rankings follow the active category
榜单 SHALL 随当前选中的分类过滤；没有选中分类时 SHALL 跨全部分类计算。

#### Scenario: Category selected
- **WHEN** 用户选中 "DevOps"
- **THEN** 两个榜单只包含来源含 `devops:*` 的仓库

### Requirement: Rankings show the top five with view all
每个榜单 SHALL 显示前 5 条，每条含名次、owner 头像、`owner/name`、star 数，Rising Stars 另显示 30 天增量；点击名称 SHALL 在新标签页打开 GitHub。"查看全部" SHALL 在原位展开为前 30 条并可收起。

#### Scenario: Rendered list
- **WHEN** Most Popular 计算完成
- **THEN** 显示 5 条，名次 1 到 5，点击"查看全部"后显示 30 条

### Requirement: Data freshness is visible
榜单区 SHALL 显示快照日期。快照文件缺失、无法解析、或日期距今超过 3 天时 SHALL 显示对应提示（尚无数据 / 数据过期），主检索不受影响。

#### Scenario: Stale data
- **WHEN** `meta.json` 的日期距今 5 天
- **THEN** 榜单仍显示，旁边提示数据已有 5 天未更新

#### Scenario: Missing data
- **WHEN** `latest.json` 不存在
- **THEN** 榜单区显示"尚无快照数据"，搜索框与检索正常
