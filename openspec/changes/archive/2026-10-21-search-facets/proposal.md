# Proposal

## Why

検索は現在リポジトリしか探せないが、GitHub の Search API には「技術を発見する」のに有用な対象として users と topics の 2 種類もある。同時に、一般ユーザーは `language:rust stars:>500` のような qualifier を書かず、カテゴリナビゲーションは 6 つの入口しかカバーしていない。この change は検索を 3 種類のタイプに拡張し、プログラムが qualifier を組み立てる構造化フィルターを提供することで、手書き構文を高度な使い方へと退化させる。これは第 2 フェーズの最後の change である。

## What Changes

- 検索ボックスの横にタイプ切替を新設する：Repositories（デフォルト）、Users、Topics。タイプを切り替えると現在のクエリで第 1 ページを再検索する。3 種類のタイプはそれぞれ固有の結果カードを持つ。
- token が設定済みの場合、タイプ切替上に他の 2 種類のマッチ数を表示する（各 1 回の追加リクエスト）。未設定の場合は表示せず、追加のクォータを消費しない。
- リポジトリ検索にフィルターを新設する：主言語（固定リスト）、最低 star（任意 / 100 / 1k / 10k）、fork を除外、アーカイブを除外。フィルターはプログラムが qualifier に組み立ててユーザーのクエリの後に追加し、入力ボックスの内容は変わらない。ワイド画面では左カラムのカテゴリの下に、ナロー画面では検索ボックスの下に折りたたみ可能な形で配置する。
- 結果カード上の言語テキストをクリック可能にする。クリックは言語フィルターの設定と同等である。
- Topics 結果カードの名前をクリック可能にする。リポジトリタイプで `topic:<name>` を検索するのと同等である。
- セッションキャッシュのキーにタイプとフィルター条件を加える。
- この change の完了後に単独で git commit する。

## Capabilities

### New Capabilities

- `search-types`: 3 種類の検索タイプの切替、それぞれのリクエストと結果表示、マッチ数の表示ルール。
- `search-filters`: リポジトリフィルターの項目、取り得る値、クエリとの合成ルール、レイアウト内の位置。

### Modified Capabilities

- `repository-search`: 言語テキストをクリック可能にする。キャッシュキーにタイプとフィルター条件を含める。

## Impact

- `src/lib/github/`：`searchUsers`、`searchTopics` と対応する型を新設する。`search.ts` の URL 構築がフィルター条件を受け取る。
- `src/features/search/`：reducer に `type` と `filters` を追加する。hook はタイプごとに呼び出す。キャッシュキーを拡張する。
- `SearchTypeTabs`、`SearchFilters`、`UserCard`、`TopicCard` コンポーネントを新設する。`SearchResults` はタイプごとにレンダリングする。
- 3 つの言語ファイルに `search.type.*`、`search.filters.*` キーを新設する。
- 外部依存は引き続き GitHub REST API である。token がある場合、1 回の検索あたり最大 3 回のリクエストを行う。
