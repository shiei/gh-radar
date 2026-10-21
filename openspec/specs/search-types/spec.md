# search-types Specification

## Purpose

検索対象の 3 つの種別（リポジトリ、ユーザー、topic）を定義する：どう切り替えるか、それぞれ何をリクエストするか、結果をどう表示するか、一致数をいつ表示するか。

## Requirements

### Requirement: Three search types
検索 SHALL 3 つの種別をサポートする：Repositories（デフォルト）、Users、Topics。検索ボックスの横のセグメント切り替えとして提示する。種別の切り替え SHALL 現在送信済みのクエリ、1 ページ目で再検索する。まだクエリがないときは種別を記憶するだけとする。ソート選択 SHALL Repositories 種別でのみ表示する。

#### Scenario: Switch type after a search
- **WHEN** ユーザーが `react` を検索済みで Users に切り替える
- **THEN** `GET /search/users?q=react` の検索が開始され、ページ番号は 1 で、結果領域にユーザーカードが表示される

#### Scenario: Switch type before any search
- **WHEN** ユーザーがまだ検索しておらず、Topics に切り替える
- **THEN** リクエストは発行されない。以降の最初の検索は Topics を使う

### Requirement: Users results
Users 種別の結果項目 SHALL アバター、ログイン名、アカウント種別（ユーザーまたは組織）を表示し、クリック SHALL 新しいタブで GitHub の個人ページを開く。ページネーションのルールはリポジトリと同じである。

#### Scenario: User card
- **WHEN** Users 検索が組織アカウントを 1 件返す
- **THEN** カードにそのアバター、ログイン名、「Organization」ラベルが表示され、リンクは GitHub ページを指す

### Requirement: Topics results
Topics 種別の結果項目 SHALL topic 名、表示名、短い説明、および featured / curated マークを表示する。名称のクリック SHALL Repositories 種別に切り替えて `topic:<name>` で検索する。

#### Scenario: Topic card leads to repositories
- **WHEN** ユーザーが Topics の結果で `machine-learning` をクリックする
- **THEN** 種別が Repositories になり、入力欄に `topic:machine-learning` が表示され、リポジトリ検索が開始される

### Requirement: Type counts only with a token
token を設定済みのとき、各検索 SHALL 追加で他の 2 種別の一致総数をリクエストし、切り替えボタン上に表示する。未設定のときは MUST NOT リクエストせず、ボタンには種別名のみを表示する。カウントリクエストの失敗は MUST NOT メイン結果に影響しない。

#### Scenario: Counts with token
- **WHEN** token を設定済みでユーザーが `react` を検索する（Repositories）
- **THEN** Users と Topics のボタンにそれぞれの一致数が表示される

#### Scenario: No counts without token
- **WHEN** token を設定しておらずユーザーが検索する
- **THEN** リクエストは 1 回だけ発行され、切り替えボタンに数字は表示されない
