# Proposal

## Why

项目的定位调整为"开源的技术雷达：观察技术市场与行业动态、辅助选型"。GitHub 自己的检索只给当下的快照，没有历史，所以"谁在涨、涨多快"这个最有价值的问题它回答不了。用 GitHub Actions 每天抓一次固定范围的仓库数据、以 JSON 提交回仓库并随站点一起发布，就能在没有服务器、没有数据库的前提下积累出真实的增长序列。数据越早开始攒越有价值，所以它排在其他第二阶段功能之前。

## What Changes

- 新增分类映射 `src/lib/categories.ts`（六个分类及其查询），同时被站点和快照脚本使用。
- 新增 `scripts/snapshot.ts`：对每个分类的"热门"与"新秀"两条查询各取前 300 条，加上 `data/watchlist.txt` 里手工维护的仓库，抓取 star、fork、未关闭 issue、最近推送、创建时间、语言、topics、归档标记。
- 数据写入 `public/data/`：`latest.json`（当天完整快照）、`daily/<日期>.json`（原始快照，保留 30 天）、`series/<分类>.json`（每仓库的 `[日期, star]` 序列，一年按天，之后按周降采样）、`meta.json`（最近一次成功时间、仓库数、覆盖范围）。
- 新增 `.github/workflows/snapshot.yml`：每天 UTC 00:00 运行脚本并提交结果；任何请求失败即整体失败、不提交半份数据。
- 脚本可本地运行（`npm run snapshot`，需要 `GITHUB_TOKEN` 环境变量），带 `--dry-run`。
- 合并、增量计算、保留期清理、降采样都是纯函数并有单元测试。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `daily-snapshot`: 快照的范围、数据文件的结构与保留策略、定时任务的运行规则与失败行为。

### Modified Capabilities

（无。）

## Impact

- 新增 `scripts/`、`.github/workflows/`、`public/data/` 目录；新增 dev 依赖 `tsx` 以直接运行 TypeScript 脚本。
- 快照脚本使用 Actions 自带的 `GITHUB_TOKEN`（核心池每小时 1000 次、search 每分钟 30 次），每天约 40 次 search 请求加若干分页，远低于上限。
- 仓库每天多一个由 Actions 产生的 commit，只改动 `public/data/` 下的文件。
