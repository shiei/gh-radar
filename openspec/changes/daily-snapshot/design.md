# Design

## Context

站点是纯静态的 Vite 构建，`public/` 下的文件原样进入产物，所以 `public/data/` 既能在 `npm run dev` 下读到，也会随 GitHub Pages 发布。`src/lib/github/` 已有 `request()`、配额解析和 `searchRepositories()`，但它们面向浏览器（`fetch` 全局、localStorage token）；脚本在 Node 24 下运行，`fetch` 可用。行为契约见 `specs/daily-snapshot/spec.md`。

## Goals / Non-Goals

**Goals:**
- 零服务器、零数据库：数据就是仓库里的 JSON。
- 脚本与站点共用分类映射，避免两处定义漂移。
- 所有数据变换是纯函数，可以在 jsdom 之外用 Vitest 测。

**Non-Goals:**
- 不抓 GH Archive 事件流，不做贡献者统计。
- 不在本 change 里改前端展示（由 `discovery-home` 消费数据）。
- 不处理仓库改名或删除的历史合并；改名后视为新仓库。

## Decisions

### D1. 目录与依赖
```
scripts/snapshot.ts          入口：解析参数、调度、写文件
scripts/lib/fetchRepos.ts    带配额等待与重试的 search 分页抓取（Node fetch）
scripts/lib/transform.ts     merge / toRecord / appendSeries / prune / downsample（纯函数）
scripts/lib/io.ts            读写 public/data
src/lib/categories.ts        分类映射（站点与脚本共用，不依赖 React）
public/data/                 输出
data/watchlist.txt           手工关注列表，每行 owner/name，# 注释
.github/workflows/snapshot.yml
```
用 `tsx` 运行脚本，不单独编译。脚本自己实现一个最小的 search 客户端，不复用 `src/lib/github/request.ts`，因为后者绑定浏览器 token 存储；两者共享的只有常量（API 版本标头）。

### D2. 抓取策略
每个来源 `per_page=100` 取 3 页；每次响应后读 `X-RateLimit-Remaining`，为 0 时 sleep 到 `X-RateLimit-Reset`；请求串行；5xx 与网络错误指数退避重试 3 次；422（超出 1000 条）视为该来源到头。watchlist 用 `GET /repos/{owner}/{repo}` 逐个取，走核心池。整次运行约 40 次 search 加 watchlist 数量次核心请求。

### D3. 文件格式
```jsonc
// latest.json
{ "date": "2026-10-21", "repos": { "vercel/next.js": { "s": 130000, "f": 28000, "i": 3100, "p": "2026-10-20T22:11:00Z", "c": "2016-10-05T...", "l": "JavaScript", "t": ["react","nextjs"], "a": false, "src": ["frontend:popular","watchlist"] } } }
// series/frontend.json
{ "vercel/next.js": [["2026-10-21", 130000], ...] }
// meta.json
{ "lastRun": "2026-10-21T00:04:12Z", "date": "2026-10-21", "total": 2140, "sources": { "frontend:popular": 300, ... } }
```
键名用单字母是为了把 `latest.json` 控制在 200 KB 量级；前端有一个解码函数把它展开成有名字的类型。序列只存 star，是因为它是唯一需要画曲线的量；其余字段看 `latest.json` 即可。

### D4. 保留与降采样
`prune(dailyDir, today, 30)` 删除超过 30 天的日文件。`downsample(series, today)`：365 天以内逐日保留；更早的按 ISO 周分组，每组保留最后一个点。序列追加前先删除同日期的点，保证幂等。

### D5. Actions 工作流
`schedule: '0 0 * * *'` 加 `workflow_dispatch`。步骤：checkout、setup-node 24、`npm ci`、`npm run snapshot`、若 `git status` 有变化则以 `github-actions[bot]` 提交并推送，信息 `data: snapshot 2026-10-21 (2140 repos)`。使用 `secrets.GITHUB_TOKEN`，需要 `permissions: contents: write`。脚本任何失败都让 step 非零退出，不走到提交步骤。

### D6. 测试
`scripts/lib/transform.test.ts` 覆盖合并去重与来源标注、记录形状、序列追加幂等、30 天清理、365 天降采样边界。`fetchRepos` 用注入的 `fetch` 测配额等待（假时钟）与 422 终止。脚本入口不测，靠 `--dry-run` 手动验证一次。

## Risks / Trade-offs

- [GitHub 对 Actions 定时任务可能延迟几十分钟甚至跳过] → 序列按日期去重，晚到不影响；若某天漏跑，曲线上缺一个点，前端按实际日期画。
- [每天一个 commit 让主分支历史变杂] → 先接受；嫌杂时把数据挪到 `data` 分支，前端读的 URL 不变。
- [分类查询改动会让序列断层] → 映射文件改动时在 `meta.json` 记录版本号，前端对版本不一致的序列标注。
- [Actions 的 GITHUB_TOKEN 不能触发其他工作流] → 正好避免数据 commit 触发部署循环；部署工作流需单独设置为允许 `paths: public/data/**` 触发。
