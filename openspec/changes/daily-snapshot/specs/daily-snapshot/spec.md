# Spec Delta

## Purpose

定义每日快照数据集：覆盖哪些仓库、每个仓库记录什么、数据文件如何组织与保留，以及抓取任务何时运行、失败时如何表现。它是趋势、榜单和对比功能的数据来源。

## ADDED Requirements

### Requirement: Snapshot scope follows the category map
快照 SHALL 覆盖：六个分类各自的"热门"查询（分类查询按 star 降序）与"新秀"查询（分类的 topic 加近 90 天创建、star 不低于 20，按 star 降序）各前 300 条，以及 `data/watchlist.txt` 中手工列出的仓库。分类及其查询 SHALL 与站点共用同一个映射文件。同一仓库出现在多个来源时 SHALL 只记录一次并标注全部来源。

#### Scenario: Sources are tagged
- **WHEN** 仓库 `vercel/next.js` 同时出现在 Frontend 热门与 watchlist
- **THEN** `latest.json` 中它只有一条记录，来源包含 `frontend:popular` 与 `watchlist`

### Requirement: Per-repository fields
每条记录 SHALL 包含：`owner/name`、star 数、fork 数、未关闭 issue 数、最近推送时间、创建时间、主语言、topics、是否归档、来源列表。

#### Scenario: Record shape
- **WHEN** 读取 `latest.json` 中任一仓库
- **THEN** 上述字段齐全，缺失的语言或 topics 以 null 或空数组表示

### Requirement: Data files and retention
数据 SHALL 写入 `public/data/`：`latest.json` 只保留最新一份；`daily/<YYYY-MM-DD>.json` 保留最近 30 天，更早的 SHALL 被删除；`series/<分类>.json` 为每个仓库保存 `[日期, star]` 序列，最近 365 天按天保留，更早的 SHALL 降采样为每周一个点；`meta.json` 记录最近一次成功运行的时间、仓库总数与各来源数量。

#### Scenario: Daily pruning
- **WHEN** 2026-11-25 运行成功
- **THEN** `daily/` 中不存在 2026-10-25 及更早的文件

#### Scenario: Series downsampling
- **WHEN** 某仓库的序列中存在 400 天前的按天数据点
- **THEN** 365 天以前的部分只保留每周一个点，365 天以内逐日保留

#### Scenario: Series append is idempotent
- **WHEN** 同一天运行两次
- **THEN** 序列中该日期只有一个点，取后一次的值

### Requirement: Scheduled run with all-or-nothing commit
抓取任务 SHALL 每天 UTC 00:00 自动运行一次，也可手动触发。任一请求最终失败时任务 SHALL 整体失败，MUST NOT 提交部分数据；成功时 SHALL 以一次 commit 提交全部变更，commit 信息包含日期与仓库数。

#### Scenario: Partial failure
- **WHEN** 某条分类查询在重试后仍返回 5xx
- **THEN** 任务标记失败，仓库中的数据文件保持上一次成功的状态

#### Scenario: Successful run
- **WHEN** 全部查询成功
- **THEN** 产生一个 commit，只改动 `public/data/` 下的文件

### Requirement: Rate limit aware fetching
脚本 SHALL 读取每次响应的配额标头，在剩余额度不足时等待到恢复时刻再继续，并对 5xx 与网络错误做有限次重试；MUST NOT 并发发起 search 请求。

#### Scenario: Quota exhausted mid-run
- **WHEN** search 配额在第 20 次请求后用尽
- **THEN** 脚本等待到 `X-RateLimit-Reset` 对应时刻后继续，最终仍成功

### Requirement: Local run and dry run
脚本 SHALL 能在本地以 `GITHUB_TOKEN` 环境变量运行；`--dry-run` SHALL 只抓取并打印统计，不写任何文件。

#### Scenario: Dry run
- **WHEN** 本地执行 `npm run snapshot -- --dry-run`
- **THEN** 输出各来源的仓库数与总数，`public/data/` 无变化
