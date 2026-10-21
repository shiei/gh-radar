# Spec Delta

## Purpose

トップページの 2 つのランキング Most Popular と Rising Stars を定義する：データは日次スナップショットから取り、Rising Stars は実際の 30 日 star 増分を使い、API クォータを消費しない。

## ADDED Requirements

### Requirement: Rankings are computed from the snapshot
ランキング SHALL `public/data/latest.json` と対応する分類の `series/<分類>.json` から計算し、GitHub API の呼び出しを MUST NOT 行う。Most Popular：当日の star 数の降順。Rising Stars：直近 30 日の star 増分（当日の star から 30 日前の最も近い点の star を引いたもの）の降順。系列が 7 日に満たない場合 SHALL 「直近 90 日以内に作成されたリポジトリを star 降順」に退化し、タイトルの横に近似である旨を注記する。

#### Scenario: Rising by delta
- **WHEN** 系列が 7 日超をカバーし、リポジトリ A が 30 日で 1200 star、リポジトリ B が 800 star 増えた
- **THEN** Rising Stars で A が B より前に並び、各項目に +1.2K の増分が表示される

#### Scenario: Fallback when history is short
- **WHEN** 系列が 3 日しかカバーしていない
- **THEN** Rising Stars は直近 90 日以内に作成されたリポジトリを star 順に表示し、タイトルの横に「データ蓄積中、暫定的に作成日時で近似」と注記する

### Requirement: Rankings follow the active category
ランキング SHALL 現在選択中の分類でフィルタする。分類が選択されていないとき SHALL 全分類をまたいで計算する。

#### Scenario: Category selected
- **WHEN** ユーザーが「DevOps」を選択する
- **THEN** 2 つのランキングはソースに `devops:*` を含むリポジトリのみを含む

### Requirement: Rankings show the top five with view all
各ランキング SHALL 上位 5 件を表示し、各項目に順位、owner のアバター、`owner/name`、star 数を含め、Rising Stars はさらに 30 日増分を表示する。名称のクリック SHALL 新しいタブで GitHub を開く。「すべて表示」 SHALL その場で上位 30 件に展開でき、折りたたむこともできる。

#### Scenario: Rendered list
- **WHEN** Most Popular の計算が完了する
- **THEN** 5 件が表示され、順位は 1 から 5、「すべて表示」をクリックすると 30 件が表示される

### Requirement: Data freshness is visible
ランキング領域 SHALL スナップショットの日付を表示する。スナップショットファイルが欠けている、解析できない、または日付が今日から 3 日を超えて古い場合 SHALL 対応する注意（データなし / データが古い）を表示し、メインの検索には影響しない。

#### Scenario: Stale data
- **WHEN** `meta.json` の日付が今日から 5 日前である
- **THEN** ランキングは引き続き表示され、横にデータが 5 日間更新されていない旨の注意が出る

#### Scenario: Missing data
- **WHEN** `latest.json` が存在しない
- **THEN** ランキング領域に「スナップショットデータなし」と表示され、検索ボックスと検索は正常に動く
