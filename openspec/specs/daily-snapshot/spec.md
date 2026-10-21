# daily-snapshot Specification

## Purpose

日次スナップショットのデータセットを定義する：どのリポジトリを対象とするか、各リポジトリについて何を記録するか、データファイルをどう構成・保持するか、取得ジョブがいつ実行され失敗時にどう振る舞うか。トレンド、ランキング、比較機能のデータソースである。

## Requirements

### Requirement: Snapshot scope follows the category map
スナップショット SHALL 次を対象とする：6 つのカテゴリそれぞれの「人気」クエリ（カテゴリクエリを star 降順）と「新興」クエリ（カテゴリの topic に直近 90 日以内の作成、star 20 以上を加え、star 降順）の各上位 300 件、および `data/watchlist.txt` に手動で列挙したリポジトリ。カテゴリとそのクエリ SHALL サイトと同一のマッピングファイルを共用する。同一リポジトリが複数のソースに現れる場合 SHALL 1 回だけ記録し、すべてのソースを付記する。

#### Scenario: Sources are tagged
- **WHEN** リポジトリ `vercel/next.js` が Frontend の人気と watchlist の両方に現れる
- **THEN** `latest.json` にはそのレコードが 1 件だけ存在し、ソースに `frontend:popular` と `watchlist` が含まれる

### Requirement: Per-repository fields
各レコード SHALL 次を含む：`owner/name`、star 数、fork 数、未クローズ issue 数、最終プッシュ時刻、作成時刻、主要言語、topics、アーカイブ済みか否か、ソース一覧、および owner の数値 id（アバター URL を直接組み立ててリダイレクト 1 回を省くために使う。API が提供しない場合は省略可）。

#### Scenario: Record shape
- **WHEN** `latest.json` 内の任意のリポジトリを読む
- **THEN** 上記フィールドが揃っており、欠けている言語や topics は null または空配列で表され、owner id が欠けている場合はそのフィールドが存在しない
### Requirement: Data files and retention
データ SHALL `public/data/` に書き込む：`latest.json` は最新の 1 件のみ保持する。`daily/<YYYY-MM-DD>.json` は直近 30 日分を保持し、それより古いもの SHALL 削除する。`series/<カテゴリ>.json` はリポジトリごとに `[日付, star]` の系列を保存し、直近 365 日は日単位で保持し、それより古い部分 SHALL 週 1 点にダウンサンプリングする。`meta.json` は最後に成功した実行の時刻、リポジトリ総数、各ソースの件数を記録する。

#### Scenario: Daily pruning
- **WHEN** 2026-11-25 の実行が成功する
- **THEN** `daily/` に 2026-10-25 以前のファイルが存在しない

#### Scenario: Series downsampling
- **WHEN** あるリポジトリの系列に 400 日前の日単位データ点が存在する
- **THEN** 365 日より前の部分は週 1 点のみ保持し、365 日以内は日ごとに保持する

#### Scenario: Series append is idempotent
- **WHEN** 同じ日に 2 回実行する
- **THEN** 系列にその日付の点は 1 つだけ存在し、後の実行の値を採る

### Requirement: Scheduled run with all-or-nothing commit
取得ジョブ SHALL 毎日 UTC 00:00 に自動で 1 回実行し、手動でもトリガーできる。いずれかのリクエストが最終的に失敗した場合、ジョブ SHALL 全体として失敗し、MUST NOT 部分的なデータをコミットしない。成功時 SHALL 1 回の commit で全変更をコミットし、commit メッセージに日付とリポジトリ数を含める。

#### Scenario: Partial failure
- **WHEN** いずれかのカテゴリクエリがリトライ後も 5xx を返す
- **THEN** ジョブは失敗とマークされ、リポジトリ内のデータファイルは前回成功時の状態を保つ

#### Scenario: Successful run
- **WHEN** すべてのクエリが成功する
- **THEN** commit が 1 つ生成され、`public/data/` 配下のファイルのみが変更される

### Requirement: Rate limit aware fetching
スクリプト SHALL 毎回のレスポンスのクォータヘッダーを読み取り、残量が不足する場合は回復時刻まで待ってから続行し、5xx とネットワークエラーに対して有限回のリトライを行う。MUST NOT search リクエストを並行して発行しない。

#### Scenario: Quota exhausted mid-run
- **WHEN** search クォータが 20 回目のリクエスト後に尽きる
- **THEN** スクリプトは `X-RateLimit-Reset` に対応する時刻まで待ってから続行し、最終的に成功する

### Requirement: Local run and dry run
スクリプト SHALL ローカルで `GITHUB_TOKEN` 環境変数を使って実行できる。`--dry-run` SHALL 取得と統計の出力のみを行い、ファイルを一切書き込まない。

#### Scenario: Dry run
- **WHEN** ローカルで `npm run snapshot -- --dry-run` を実行する
- **THEN** 各ソースのリポジトリ数と総数が出力され、`public/data/` は変化しない
