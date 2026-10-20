# 部署手顺

站点以静态文件形式发布到 GitHub Pages，地址 https://shiei.github.io/gh-radar/ 。两个工作流配合：`deploy.yml` 构建并发布，`snapshot.yml` 每天抓数据并提交。本文记录从零开始的步骤、日常运行方式和排错。

## 整体链路

```
  push 到 master ──────────────┐
  每天 UTC 00:00 ─> Daily snapshot ─> bot 提交 public/data ─┼─> Deploy to GitHub Pages ─> 站点更新
  手动 Run workflow ───────────┘
```

- `Deploy to GitHub Pages`（`.github/workflows/deploy.yml`）：`npm ci` → `npm run check` → `npm run build`（`VITE_BASE=/gh-radar/`）→ 上传 `dist/` → 发布。触发条件：推送到 master（忽略 `openspec/`、`memo/`、`*.md`）、`Daily snapshot` 成功完成、手动。
- `Daily snapshot`（`.github/workflows/snapshot.yml`）：`npm run snapshot` → 有变化则以 `github-actions[bot]` 提交 `public/data/` 并推送。触发条件：每天 UTC 00:00、手动。使用 Actions 自带的 `GITHUB_TOKEN`，不需要配置任何 secret。

bot 用 `GITHUB_TOKEN` 做的提交**不会**触发 `push` 事件，所以 `deploy.yml` 额外监听 `workflow_run`，在快照成功后接着部署。

## 首次部署（已完成，记录供复现）

前提：本机装有 `gh` 并已登录（`gh auth status`）。

1. 在 GitHub 新建空仓库，本地加远端并推送：
   ```bash
   git remote add origin https://github.com/shiei/gh-radar.git
   git push -u origin master
   ```
2. 确认默认分支是 `master`（定时任务与 `workflow_dispatch` 只认默认分支）：
   ```bash
   gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
   # 不是的话：
   gh api -X PATCH repos/shiei/gh-radar -f default_branch=master
   ```
3. 开启 Pages，来源选 GitHub Actions（等价于仓库 Settings → Pages → Source: GitHub Actions）：
   ```bash
   gh api -X POST repos/shiei/gh-radar/pages -f build_type=workflow
   ```
4. 推送会自动触发 `Deploy to GitHub Pages`。等它完成后验证：
   ```bash
   gh run list --limit 3
   curl -s -o /dev/null -w "%{http_code}\n" https://shiei.github.io/gh-radar/
   curl -s https://shiei.github.io/gh-radar/data/meta.json | head
   ```
5. 手动跑一次快照并确认它提交了数据、联动了部署：
   ```bash
   gh workflow run snapshot.yml
   gh run watch --exit-status
   git pull --rebase origin master   # 把 bot 的 data: 提交拉回本地
   ```

## 日常操作

| 想做的事           | 做法                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| 发布代码改动       | 推送到 master 即可，约 1.5 分钟上线                                                                 |
| 立刻刷一次数据     | `gh workflow run snapshot.yml`，完成后自动部署                                                      |
| 手动重新部署       | `gh workflow run deploy.yml`                                                                        |
| 看运行状态         | `gh run list --limit 5`，`gh run watch <id>`                                                        |
| 本地预览子路径构建 | `VITE_BASE=/gh-radar/ npm run build && npm run preview`，然后访问 `http://localhost:4173/gh-radar/` |
| 换仓库名或用户名   | `deploy.yml` 会自动用仓库名作 `VITE_BASE`；本文和 README 里的地址要手改                             |

本地开发（`npm run dev`）和 e2e 都以 `/` 为根，不受子路径影响。代码里所有静态资源与数据路径都通过 `import.meta.env.BASE_URL` 拼接，新增资源请沿用这个写法，不要写死 `/`。

## 排错

- **推了工作流文件但 Actions 页面里没有它**：GitHub 偶尔不登记只有 `schedule` / `workflow_dispatch` 触发的新工作流。给文件加一行注释再推一次即可（2026-10-20 遇到过一次）。
- **快照跑完了站点没更新**：检查 `deploy.yml` 的 `workflow_run` 触发是否成功；也可以 `gh workflow run deploy.yml` 手动补一次。
- **快照失败**：工作流整体失败且不会提交半份数据，仓库里的数据保持上一次成功的状态。看 `Take snapshot` 这一步的日志，常见原因是 GitHub API 临时 5xx，再手动触发一次即可。
- **Actions 日志里的 Node 20 弃用提示**：`actions/checkout@v4`、`actions/setup-node@v4` 等仍基于 Node 20，GitHub 强制在 Node 24 上运行，不影响结果；有空时把版本号升到 v5。
- **回滚**：`git revert` 出问题的提交并推送，部署会自动跟上；数据文件同理。
