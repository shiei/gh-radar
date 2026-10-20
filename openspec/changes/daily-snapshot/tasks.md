# Tasks

## 1. 共享定义

- [x] 1.1 新增 `src/lib/categories.ts`（六个分类：id、query、三语名称键）与 `data/watchlist.txt`（含注释说明），单元测试验证六个 id 与查询非空
- [x] 1.2 安装 `tsx`，添加 `npm run snapshot` 脚本，`tsconfig.node.json` 覆盖 `scripts/**`

## 2. 变换函数

- [x] 2.1 实现 `scripts/lib/transform.ts`：`toRecord`、`mergeSources`、`appendSeries`、`pruneDaily`、`downsampleSeries`，单元测试覆盖去重与来源、字段形状、幂等追加、30 天清理、365 天降采样

## 3. 抓取

- [x] 3.1 实现 `scripts/lib/fetchRepos.ts`：串行分页、配额等待、重试、422 终止、watchlist 逐个 `GET /repos`，用注入 fetch 与假时钟的单元测试覆盖等待与终止
- [x] 3.2 实现 `scripts/snapshot.ts` 入口与 `scripts/lib/io.ts`：读旧数据、抓取、变换、写 `latest.json` / `daily/` / `series/` / `meta.json`，`--dry-run` 只打印统计；本地用真实 token 跑一次 `--dry-run` 验证统计输出

## 4. 自动化

- [ ] 4.1 新增 `.github/workflows/snapshot.yml`（每日 cron、手动触发、失败不提交、成功提交 `public/data/`）；工作流文件已写好，但只能在推送到 GitHub 后用 workflow_dispatch 验证，本地无 GitHub 远端，暂留未勾选
- [x] 4.2 README 补充数据集说明（范围、文件格式、保留策略、如何加 watchlist）；ROADMAP 增加 `daily-snapshot` 为已完成
