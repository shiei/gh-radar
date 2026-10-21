# Spec Delta

## Purpose

検索対象の 3 種類のタイプ（リポジトリ、ユーザー、topic）を定義する：切替方法、それぞれが何をリクエストするか、結果の表示方法、マッチ数をいつ表示するか。

## ADDED Requirements

### Requirement: Three search types
検索 SHALL 3 種類のタイプをサポートする：Repositories（デフォルト）、Users、Topics。検索ボックスの横のセグメント切替として表示する。タイプの切替 SHALL 現在送信済みのクエリで第 1 ページを再検索する。まだクエリがない場合はタイプを記憶するだけである。ソート選択 SHALL Repositories タイプでのみ表示する。

#### Scenario: Switch type after a search
- **WHEN** ユーザーが `react` を検索済みで Users に切り替える
- **THEN** `GET /search/users?q=react` の検索を発行し、ページ番号は 1、結果領域にユーザーカードを表示する

#### Scenario: Switch type before any search
- **WHEN** ユーザーがまだ検索しておらず、Topics に切り替える
- **THEN** リクエストを発行しない。その後の初回検索は Topics を使う

### Requirement: Users results
Users タイプの結果項目 SHALL アバター、ログイン名、アカウント種別（ユーザーまたは組織）を表示し、クリック時 SHALL 新しいタブで GitHub の個人ページを開く。ページネーションのルールはリポジトリと同じである。

#### Scenario: User card
- **WHEN** Users 検索が組織アカウントを 1 件返す
- **THEN** カードにそのアバター、ログイン名、「Organization」ラベルを表示し、リンクは GitHub ページを指す

### Requirement: Topics results
Topics タイプの結果項目 SHALL topic 名、表示名、短い説明、および featured / curated マークを表示する。名前のクリック SHALL Repositories タイプに切り替えて `topic:<name>` で検索する。

#### Scenario: Topic card leads to repositories
- **WHEN** ユーザーが Topics の結果で `machine-learning` をクリックする
- **THEN** タイプが Repositories になり、入力ボックスに `topic:machine-learning` が表示され、リポジトリ検索を発行する

### Requirement: Type counts only with a token
token が設定済みの場合、各検索 SHALL 他の 2 種類のタイプのマッチ総数を追加でリクエストし、切替ボタン上に表示する。未設定の場合 MUST NOT リクエストし、ボタンにはタイプ名のみを表示する。件数リクエストの失敗 MUST NOT 主結果に影響する。

#### Scenario: Counts with token
- **WHEN** token が設定済みで、ユーザーが `react` を検索する（Repositories）
- **THEN** Users と Topics のボタンにそれぞれのマッチ数を表示する

#### Scenario: No counts without token
- **WHEN** token が未設定で、ユーザーが検索する
- **THEN** リクエストを 1 回だけ発行し、切替ボタンに数字を表示しない
