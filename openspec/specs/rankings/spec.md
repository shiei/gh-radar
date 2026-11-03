# rankings Specification

## Purpose

トップページの 2 つのランキング Most Popular と Rising Stars を定義する：データは日次スナップショットに由来し、Rising Stars は実際の 30 日間の star 増分を使い、API クォータを消費しない。

## Requirements

### Requirement: Rankings are computed from the snapshot
ランキング SHALL `public/data/latest.json` と `meta.json` のみから計算し、MUST NOT GitHub API を呼び出さず、MUST NOT 系列ファイルをダウンロードしない。Most Popular：当日の star 数の降順。Rising Stars：スナップショットジョブが各レコードに書き込んだ star 増分（直近 30 日間、履歴が短い間は最古の点から）の降順。`meta.json` の履歴日数が 7 日に満たないとき SHALL 「直近 90 日以内に作成されたリポジトリを star 降順」にフォールバックし、見出しの横に近似である旨を表示する。説明文 SHALL 増分が実際に覆う日数（履歴日数と 30 の小さい方）を表示し、履歴が 30 日に満たない間に「30 日」と表記してはならない。

#### Scenario: Rising by delta
- **WHEN** 系列が 7 日を超えてカバーし、リポジトリ A が 30 日間で 1200 star、リポジトリ B が 800 star 増えた
- **THEN** Rising Stars で A が B より前に並び、各行に +1.2K の増分が表示される

#### Scenario: Window label is honest
- **WHEN** `meta.json` の履歴日数が 14 日である
- **THEN** Rising Stars の説明文は「直近 14 日間」と表示する

#### Scenario: Fallback when history is short
- **WHEN** 系列が 3 日分しかカバーしていない
- **THEN** Rising Stars は直近 90 日以内に作成されたリポジトリを star 順に表示し、見出しの横に「データ蓄積中、暫定的に作成日時で近似」と表示する

### Requirement: Rankings follow the active category
ランキング SHALL 現在選択中のカテゴリで絞り込む。カテゴリが選択されていないとき SHALL 全カテゴリ横断で計算する。

#### Scenario: Category selected
- **WHEN** ユーザーが「DevOps」を選択する
- **THEN** 2 つのランキングはソースに `devops:*` を含むリポジトリのみを含む

### Requirement: Rankings show the top five with view all
各ランキング SHALL 上位 5 件を表示し、各行に順位、owner のアバター、`owner/name`、star 数を含め、Rising Stars はさらに 30 日間の増分を表示する。名称のクリック SHALL 新しいタブで GitHub を開く。「すべて表示」 SHALL その場で上位 30 件に展開し、折りたたみもできる。

#### Scenario: Rendered list
- **WHEN** Most Popular の計算が完了する
- **THEN** 5 件が順位 1 から 5 で表示され、「すべて表示」をクリックすると 30 件が表示される

### Requirement: Rows reveal a summary on hover
各行の名称リンク SHALL ホバーまたはフォーカスでツールチップを表示し、`owner/name` のフルネーム（行内では省略されうる）、主要言語、スナップショットに記録された説明文を含む。説明文や言語が欠けている場合 SHALL その項目を省略し、残りを表示する。ツールチップのトリガーはリンク自身であり、MUST NOT 追加のタブストップを作らない。

#### Scenario: Hover shows description
- **WHEN** ユーザーが Most Popular の 1 行目の名称にマウスを重ねる
- **THEN** フルネーム、言語、説明文を含むツールチップが表示される

### Requirement: Data freshness is visible
ランキング領域 SHALL スナップショットの日付を表示する。スナップショットファイルが欠けている、解析できない、または日付が今日から 3 日より離れているとき SHALL 対応する案内（データなし / データが古い）を表示し、メイン検索は影響を受けない。

#### Scenario: Stale data
- **WHEN** `meta.json` の日付が今日から 5 日離れている
- **THEN** ランキングは引き続き表示され、横にデータが 5 日間更新されていない旨の案内が出る

#### Scenario: Missing data
- **WHEN** `latest.json` が存在しない
- **THEN** ランキング領域に「スナップショットデータなし」と表示され、検索ボックスと検索は正常に動作する
