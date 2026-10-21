# Spec Delta

## Purpose

トップページの分類ナビゲーションを定義する：どの分類があるか、各分類の背後にあるクエリは何か、どう表示するか、クリック後の検索との関係。検索構文を知らないユーザーでも探索できるようにする。

## ADDED Requirements

### Requirement: Six fixed categories
アプリケーション SHALL 固定の 6 分類を提供する：Frontend、Backend、AI / ML、DevOps、Database、Design。各分類 SHALL 3 言語の名称、1 つのアイコン、1 本の GitHub リポジトリ検索クエリを持つ。分類とクエリの対応 SHALL 1 つのマッピングファイルに集約して管理する。

#### Scenario: All categories are listed
- **WHEN** ユーザーがトップページを開く
- **THEN** ナビゲーション領域に 6 つの分類が固定順で表示され、それぞれアイコンと現在の言語の名称を伴う

### Requirement: Clicking a category runs its query
分類のクリック SHALL その分類のクエリ、現在のソート、1 ページ目で検索を発行し、入力欄 SHALL そのクエリを表示し、結果は中央カラムに表示される。

#### Scenario: Browse a category
- **WHEN** ユーザーが「AI / ML」をクリックする
- **THEN** その分類にマッピングされたクエリ（例：`topic:machine-learning stars:>100`）が発行され、入力欄に同じクエリが表示され、結果領域に結果が表示される

#### Scenario: Keyboard
- **WHEN** ユーザーが Tab である分類にフォーカスして Enter を押す
- **THEN** クリックと同じ効果になる

### Requirement: Active category is highlighted
現在の検索クエリがある分類のクエリと完全に一致するとき、その分類 SHALL 選択状態で表示する。そうでなければどの分類も選択されない。

#### Scenario: Highlight after click
- **WHEN** ユーザーが「DevOps」をクリックする
- **THEN** 「DevOps」が選択状態で表示され、他の 5 つはそうでない

#### Scenario: Free search clears highlight
- **WHEN** ユーザーが「DevOps」を選択した後に手動で `react` を検索する
- **THEN** どの分類も選択状態にない

### Requirement: Categories adapt to narrow screens
ワイド画面では分類 SHALL 左カラムの縦リストとして表示する。狭い画面では SHALL 検索ボックス上部の横並びで折り返し可能な chip 行に変わり、内容と挙動は変わらない。

#### Scenario: Narrow screen
- **WHEN** ウィンドウ幅が 1024px 未満である
- **THEN** 6 つの分類が検索ボックスの上に横並びの chip として表示され、クリック時の挙動は同じである
