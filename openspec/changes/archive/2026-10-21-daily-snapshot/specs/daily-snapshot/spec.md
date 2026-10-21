# Spec Delta

## Purpose

毎日のスナップショットデータセットを定義する：どのリポジトリをカバーするか、各リポジトリについて何を記録するか、データファイルをどう構成・保持するか、取得タスクをいつ実行し失敗時にどう振る舞うか。これはトレンド、ランキング、比較機能のデータソースである。

## ADDED Requirements

### Requirement: Snapshot scope follows the category map
スナップショット SHALL 以下をカバーする：6 つの分類それぞれの「人気」クエリ（分類クエリを star 降順）と「新星」クエリ（分類の topic に直近 90 日以内の作成、star 20 以上を加え、star 降順）の各上位 300 件、および `data/watchlist.txt` に手動で列挙したリポジトリ。分類とそのクエリ SHALL サイトと同一のマッピングファイルを共用する。同じリポジトリが複数のソースに現れた場合 SHALL 1 回だけ記録し、すべてのソースを付与する。

#### Scenario: Sources are tagged
- **WHEN** リポジトリ `vercel/next.js` が Frontend 人気と watchlist の両方に現れる
- **THEN** `latest.json` にはそのレコードが 1 件だけあり、ソースに `frontend:popular` と `watchlist` が含まれる

### Requirement: Per-repository fields
各レコード SHALL 以下を含む：`owner/name`、star 数、fork 数、オープン issue 数、最終 push 日時、作成日時、主言語、topics、アーカイブ済みか否か、ソース一覧。

#### Scenario: Record shape
- **WHEN** `latest.json` の任意のリポジトリを読む
- **THEN** 上記フィールドがすべて揃っており、欠けている言語や topics は null または空配列で表される

### Requirement: Data files and retention
データ SHALL `public/data/` に書き込む：`latest.json` は最新の 1 つだけを保持する。`daily/<YYYY-MM-DD>.json` は直近 30 日を保持し、それより古いもの SHALL 削除する。`series/<分類>.json` はリポジトリごとに `[日付, star]` 系列を保存し、直近 365 日は日次で保持し、それより古いもの SHALL 週 1 点にダウンサンプリングする。`meta.json` は最後に成功した実行の時刻、リポジトリ総数、各ソースの件数を記録する。

#### Scenario: Daily pruning
- **WHEN** 2026-11-25 の実行が成功する
- **THEN** `daily/` に 2026-10-25 以前のファイルが存在しない

#### Scenario: Series downsampling
- **WHEN** あるリポジトリの系列に 400 日前の日次データ点が存在する
- **THEN** 365 日より前の部分は週 1 点のみを保持し、365 日以内は日次で保持する

#### Scenario: Series append is idempotent
- **WHEN** 同じ日に 2 回実行する
- **THEN** 系列にはその日付の点が 1 つだけあり、後の実行の値を取る

### Requirement: Scheduled run with all-or-nothing commit
取得タスク SHALL 毎日 UTC 00:00 に自動で 1 回実行し、手動でもトリガーできる。いずれかのリクエストが最終的に失敗した場合、タスク SHALL 全体を失敗とし、部分的なデータのコミットを MUST NOT 行う。成功時 SHALL すべての変更を 1 回の commit で提出し、commit メッセージに日付とリポジトリ数を含める。

#### Scenario: Partial failure
- **WHEN** ある分類クエリがリトライ後も 5xx を返す
- **THEN** タスクは失敗としてマークされ、リポジトリ内のデータファイルは前回成功時の状態を保つ

#### Scenario: Successful run
- **WHEN** すべてのクエリが成功する
- **THEN** commit が 1 つ生成され、`public/data/` 配下のファイルのみが変更される

### Requirement: Rate limit aware fetching
スクリプト SHALL 各レスポンスのクォータヘッダーを読み、残りが不足している場合は回復時刻まで待ってから続行し、5xx とネットワークエラーに対して有限回のリトライを行う。search リクエストの並行発行を MUST NOT 行う。

#### Scenario: Quota exhausted mid-run
- **WHEN** search クォータが 20 回目のリクエスト後に尽きる
- **THEN** スクリプトは `X-RateLimit-Reset` に対応する時刻まで待ってから続行し、最終的に成功する

### Requirement: Local run and dry run
スクリプト SHALL 環境変数 `GITHUB_TOKEN` によりローカルで実行できる。`--dry-run` SHALL 取得と統計の表示のみを行い、ファイルは一切書き込まない。

#### Scenario: Dry run
- **WHEN** ローカルで `npm run snapshot -- --dry-run` を実行する
- **THEN** 各ソースのリポジトリ数と総数を出力し、`public/data/` に変化はない
