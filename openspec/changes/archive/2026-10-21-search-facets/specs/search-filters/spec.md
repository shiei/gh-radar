# Spec Delta

## Purpose

リポジトリ検索の構造化フィルターを定義する：どの項目があるか、取り得る値の範囲、ユーザーのクエリとどう合成するか、異なる幅での位置。

## ADDED Requirements

### Requirement: Filter set
Repositories タイプ SHALL 4 つのフィルターを提供する：主言語（「任意」に加えて固定の一般的な言語リスト）、最低 star（任意 / 100 / 1,000 / 10,000）、fork を除外（スイッチ）、アーカイブを除外（スイッチ）。デフォルトはすべて「任意 / オフ」である。

#### Scenario: Defaults
- **WHEN** ユーザーが初めてページに入る
- **THEN** 4 つのフィルターはすべてデフォルト状態であり、発行される検索はフィルター qualifier を一切含まない

### Requirement: Filters compose qualifiers without touching the input
フィルター SHALL プログラムによって qualifier（`language:<x>`、`stars:>=<n>`、`fork:false`、`archived:false`）に変換され、ユーザーのクエリの後に追加して送信される。入力ボックスの内容 MUST NOT 書き換えられる。フィルターの変更時、クエリが既にあれば SHALL 第 1 ページから再検索する。フィルター SHALL 現在有効な条件を読みやすい形で表示する。

#### Scenario: Compose
- **WHEN** ユーザーのクエリが `cli` で、言語に Rust、最低 star に 1,000 を選び、fork を除外をオンにする
- **THEN** リクエストの q は `cli language:rust stars:>=1000 fork:false` となり、入力ボックスには引き続き `cli` が表示される

#### Scenario: Change re-runs from page 1
- **WHEN** ユーザーが第 3 ページで最低 star を 100 に変更する
- **THEN** 新しい条件で第 1 ページを検索する

### Requirement: Language text is a shortcut
結果カード上の主言語テキスト SHALL クリック可能であり、クリックは言語フィルターをその言語に設定するのと同等である。

#### Scenario: Click language
- **WHEN** ユーザーがあるカード上の "TypeScript" をクリックする
- **THEN** 言語フィルターが TypeScript になり、現在のクエリで第 1 ページから再検索する

### Requirement: Placement
ワイド画面（1024px 以上）ではフィルター SHALL 左カラムのカテゴリナビゲーションの下に位置する。ナロー画面では SHALL 検索ボックスの下に位置し、デフォルトでは 1 行の「フィルター」ボタンに折りたたまれ、有効条件数を伴う。Users と Topics タイプではフィルター SHALL 非表示にする。

#### Scenario: Narrow collapsed
- **WHEN** ウィンドウ幅が 600px で言語フィルターが Rust である
- **THEN** 検索ボックスの下に「絞り込み (1)」ボタンを表示し、展開すると 4 つのフィルターが見える
