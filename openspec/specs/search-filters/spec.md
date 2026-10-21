# search-filters Specification

## Purpose

リポジトリ検索の構造化フィルターを定義する：どの項目があるか、値の範囲、ユーザーのクエリとどう合成するか、および各幅での配置。

## Requirements

### Requirement: Filter set
Repositories 種別 SHALL 4 つのフィルターを提供する：主要言語（「任意」に加えて固定のよく使う言語リスト）、最低 star（任意 / 100 / 1,000 / 10,000）、fork を除外（トグル）、アーカイブ済みを除外（トグル）。デフォルトはすべて「任意 / オフ」とする。

#### Scenario: Defaults
- **WHEN** ユーザーが初めてページに入る
- **THEN** 4 つのフィルターはすべてデフォルト状態で、開始される検索にはフィルターの qualifier が一切付かない

### Requirement: Filters compose qualifiers without touching the input
フィルター SHALL プログラムによって qualifier（`language:<x>`、`stars:>=<n>`、`fork:false`、`archived:false`）に変換し、ユーザーのクエリの後ろに追加して送信する。入力欄の内容は MUST NOT 書き換えない。フィルターが変化したとき、クエリが既にあれば SHALL 1 ページ目から再検索する。フィルター SHALL 現在有効な条件を可読な形で表示する。

#### Scenario: Compose
- **WHEN** ユーザーのクエリが `cli` で、言語に Rust、最低 star に 1,000 を選び、fork を除外をオンにする
- **THEN** リクエストの q は `cli language:rust stars:>=1000 fork:false` となり、入力欄には引き続き `cli` が表示される

#### Scenario: Change re-runs from page 1
- **WHEN** ユーザーが 3 ページ目で最低 star を 100 に変更する
- **THEN** 新しい条件で 1 ページ目を検索する

### Requirement: Language text is a shortcut
結果カード上の主要言語のテキスト SHALL クリック可能とし、クリックは言語フィルターをその言語に設定することと同等とする。

#### Scenario: Click language
- **WHEN** ユーザーがあるカード上の「TypeScript」をクリックする
- **THEN** 言語フィルターが TypeScript になり、現在のクエリで 1 ページ目から再検索される

### Requirement: Placement
ワイド画面（1024px 以上）ではフィルター SHALL 左カラムのカテゴリナビゲーションの下に置く。ナロー画面では SHALL 検索ボックスの下に置き、デフォルトでは有効条件数を伴う 1 行の「フィルター」ボタンに折りたたむ。Users と Topics 種別ではフィルター SHALL 非表示とする。

#### Scenario: Narrow collapsed
- **WHEN** ウィンドウ幅が 600px で言語フィルターが Rust である
- **THEN** 検索ボックスの下に「絞り込み (1)」ボタンが表示され、展開すると 4 つのフィルターが見える
