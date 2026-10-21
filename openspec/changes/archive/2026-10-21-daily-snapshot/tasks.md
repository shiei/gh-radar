# Tasks

## 1. 共有定義

- [x] 1.1 `src/lib/categories.ts`（6 つの分類：id、query、3 言語の名称キー）と `data/watchlist.txt`（コメントの説明付き）を新設し、単体テストで 6 つの id とクエリが空でないことを検証する
- [x] 1.2 `tsx` をインストールし、`npm run snapshot` スクリプトを追加し、`tsconfig.node.json` で `scripts/**` をカバーする

## 2. 変換関数

- [x] 2.1 `scripts/lib/transform.ts` を実装する：`toRecord`、`mergeSources`、`appendSeries`、`pruneDaily`、`downsampleSeries`。単体テストで重複排除とソース付与、フィールドの形、冪等な追加、30 日クリーンアップ、365 日ダウンサンプリングをカバーする

## 3. 取得

- [x] 3.1 `scripts/lib/fetchRepos.ts` を実装する：直列ページング、クォータ待機、リトライ、422 による終了、watchlist の 1 件ずつの `GET /repos`。注入 fetch と擬似時計を使う単体テストで待機と終了をカバーする
- [x] 3.2 `scripts/snapshot.ts` エントリと `scripts/lib/io.ts` を実装する：旧データの読み込み、取得、変換、`latest.json` / `daily/` / `series/` / `meta.json` の書き込み。`--dry-run` は統計の表示のみ。ローカルで実トークンを使って `--dry-run` を 1 回実行し、統計出力を検証する

## 4. 自動化

- [x] 4.1 `.github/workflows/snapshot.yml` を新設する（毎日の cron、手動トリガー、失敗時はコミットしない、成功時は `public/data/` をコミット）。2026-10-20 23:14 UTC に shiei/gh-radar で手動トリガーして検証：1 分 17 秒で完了し、commit `data: snapshot 2026-10-20 (2079 repos)` を生成して Pages デプロイを連動トリガーした
- [x] 4.2 README にデータセットの説明（範囲、ファイル形式、保持ポリシー、watchlist の追加方法）を補足する。ROADMAP に `daily-snapshot` を完了として追加する
