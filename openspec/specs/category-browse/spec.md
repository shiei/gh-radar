# category-browse Specification

## Purpose

トップページのカテゴリナビゲーションを定義する：どのカテゴリがあるか、各カテゴリの背後にどのクエリがあるか、どう表示するか、クリック後の検索との関係。検索構文を知らないユーザーでも探索できるようにする。

## Requirements

### Requirement: Six fixed categories
アプリケーション SHALL 固定の 6 つのカテゴリを提供する：Frontend、Backend、AI / ML、DevOps、Database、Design。各カテゴリ SHALL 3 言語の名称、1 つのアイコン、1 本の GitHub リポジトリ検索クエリを持つ。カテゴリとクエリの対応 SHALL 1 つのマッピングファイルに集約して管理する。

#### Scenario: All categories are listed
- **WHEN** ユーザーがトップページを開く
- **THEN** ナビゲーション領域に 6 つのカテゴリが固定順で表示され、それぞれアイコンと現在の言語の名称を伴う

### Requirement: Clicking a category runs its query
カテゴリのクリック SHALL そのカテゴリのクエリ、現在のソート、1 ページ目で検索を開始し、入力欄 SHALL そのクエリを表示し、結果は中央カラムに表示する。

#### Scenario: Browse a category
- **WHEN** ユーザーが「AI / ML」をクリックする
- **THEN** そのカテゴリにマッピングされたクエリ（例：`topic:machine-learning stars:>100`）で検索が開始され、入力欄に同じクエリが表示され、結果領域に結果が表示される

#### Scenario: Keyboard
- **WHEN** ユーザーが Tab でいずれかのカテゴリにフォーカスし Enter を押す
- **THEN** クリックと同じ効果になる

### Requirement: Active category is highlighted
現在の検索クエリがいずれかのカテゴリのクエリと完全に一致するとき、そのカテゴリ SHALL 選択状態で表示する。そうでなければどのカテゴリも選択されない。

#### Scenario: Highlight after click
- **WHEN** ユーザーが「DevOps」をクリックする
- **THEN** 「DevOps」が選択状態で表示され、残りの 5 つは選択されない

#### Scenario: Free search clears highlight
- **WHEN** 「DevOps」が選択された状態でユーザーが手動で `react` を検索する
- **THEN** どのカテゴリも選択状態にならない

### Requirement: Categories adapt to narrow screens
ワイド画面ではカテゴリ SHALL 左カラムの縦リストとして表示する。ナロー画面では SHALL 検索ボックス上部の横並びで折り返し可能な chip 行に変わり、内容と挙動は変わらない。

#### Scenario: Narrow screen
- **WHEN** ウィンドウ幅が 1024px 未満である
- **THEN** 6 つのカテゴリが横並びの chip として検索ボックスの上に表示され、クリック時の挙動は同じである
