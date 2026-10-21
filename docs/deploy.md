# デプロイ手順

サイトは静的ファイルとして GitHub Pages に公開しており、URL は https://shiei.github.io/gh-radar/ である。2 つのワークフローが連携する。`deploy.yml` がビルドと公開を行い、`snapshot.yml` が毎日データを取得してコミットする。本文はゼロからの手順、日常の運用方法、トラブルシューティングを記録する。

## 全体の流れ

```
  master へ push ──────────────┐
  毎日 UTC 00:00 ─> Daily snapshot ─> bot が public/data をコミット ─┼─> Deploy to GitHub Pages ─> サイト更新
  手動 Run workflow ───────────┘
```

- `Deploy to GitHub Pages`（`.github/workflows/deploy.yml`）：`npm ci` → `npm run check` → `npm run build`（`VITE_BASE=/gh-radar/`）→ `dist/` をアップロード → 公開 → 公開サイトのスモークチェック（タイトル、JS バンドル、`data/meta.json` の日付が 3 日以内）。チェックに失敗するとワークフローが失敗し、GitHub から通知メールが届く。トリガー条件：master への push（`openspec/`、`memo/`、`*.md` は無視）、`Daily snapshot` の成功完了、手動実行。
- `Daily snapshot`（`.github/workflows/snapshot.yml`）：`npm run snapshot` → 変化があれば `github-actions[bot]` として `public/data/` をコミットして push する。トリガー条件：毎日 UTC 00:00、手動実行。Actions 標準の `GITHUB_TOKEN` を使うため、secret の設定は一切不要である。

bot が `GITHUB_TOKEN` で行ったコミットは `push` イベントを**発火しない**ため、`deploy.yml` は追加で `workflow_run` も監視し、スナップショット成功後に続けてデプロイする。

## 初回デプロイ（完了済み、再現用の記録）

前提：ローカルに `gh` がインストールされ、ログイン済みであること（`gh auth status`）。

1. GitHub で空リポジトリを新規作成し、ローカルにリモートを追加して push する：
   ```bash
   git remote add origin https://github.com/shiei/gh-radar.git
   git push -u origin master
   ```
2. デフォルトブランチが `master` であることを確認する（スケジュール実行と `workflow_dispatch` はデフォルトブランチのみ対象）：
   ```bash
   gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
   # 違う場合：
   gh api -X PATCH repos/shiei/gh-radar -f default_branch=master
   ```
3. Pages を有効化し、ソースに GitHub Actions を選ぶ（リポジトリの Settings → Pages → Source: GitHub Actions と同等）：
   ```bash
   gh api -X POST repos/shiei/gh-radar/pages -f build_type=workflow
   ```
4. push すると `Deploy to GitHub Pages` が自動で起動する。完了を待ってから検証する：
   ```bash
   gh run list --limit 3
   curl -s -o /dev/null -w "%{http_code}\n" https://shiei.github.io/gh-radar/
   curl -s https://shiei.github.io/gh-radar/data/meta.json | head
   ```
5. スナップショットを手動で 1 回実行し、データをコミットしてデプロイが連動したことを確認する：
   ```bash
   gh workflow run snapshot.yml
   gh run watch --exit-status
   git pull --rebase origin master   # bot の data: コミットをローカルに取り込む
   ```

## 日常の操作

| やりたいこと                             | 方法                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| コード変更を公開する                     | master へ push するだけでよく、約 1.5 分で公開される                                                               |
| 今すぐデータを更新する                   | `gh workflow run snapshot.yml`。完了後に自動でデプロイされる                                                       |
| 手動で再デプロイする                     | `gh workflow run deploy.yml`                                                                                       |
| 実行状況を見る                           | `gh run list --limit 5`、`gh run watch <id>`                                                                       |
| サブパス構成のビルドをローカルで確認する | `VITE_BASE=/gh-radar/ npm run build && npm run preview` を実行し、`http://localhost:4173/gh-radar/` にアクセスする |
| リポジトリ名やユーザー名を変える         | `deploy.yml` はリポジトリ名を自動で `VITE_BASE` に使う。本文と README 内の URL は手で修正する必要がある            |

ローカル開発（`npm run dev`）と e2e はいずれも `/` をルートとし、サブパスの影響を受けない。コード内の静的アセットとデータのパスはすべて `import.meta.env.BASE_URL` で組み立てている。新しいアセットを追加する際もこの書き方に従い、`/` をハードコードしないこと。

## トラブルシューティング

- **ワークフローファイルを push したのに Actions ページに表示されない**：GitHub は `schedule` / `workflow_dispatch` のみをトリガーとする新規ワークフローを登録しないことがたまにある。ファイルにコメントを 1 行追加して再度 push すればよい（2026-10-20 に一度発生）。
- **デプロイの `verify` ジョブだけが失敗する**：公開は済んでいるがページが壊れているか、CDN の反映が遅れている。ログの最後の行で失敗した項目を確認し、一時的なものなら `gh workflow run deploy.yml` で再実行する。
- **スナップショットは完了したのにサイトが更新されない**：`deploy.yml` の `workflow_run` トリガーが成功したかを確認する。`gh workflow run deploy.yml` で手動デプロイして補うこともできる。
- **スナップショットの失敗**：ワークフロー全体が失敗し、データが中途半端にコミットされることはない。リポジトリ内のデータは前回成功時の状態を保つ。`Take snapshot` ステップのログを見る。よくある原因は GitHub API の一時的な 5xx であり、もう一度手動で実行すればよい。
- **Actions ログの Node 20 非推奨警告**：`actions/checkout@v4`、`actions/setup-node@v4` などは依然 Node 20 ベースで、GitHub が強制的に Node 24 で実行している。結果には影響しない。時間があるときにバージョンを v5 に上げる。
- **ロールバック**：問題のあるコミットを `git revert` して push すれば、デプロイが自動で追従する。データファイルも同様である。
