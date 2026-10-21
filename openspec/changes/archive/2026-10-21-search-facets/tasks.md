# Tasks

## 1. データと状態

- [x] 1.1 `src/lib/github/`：`types.ts` に `SearchType`、`SearchFilters`、`UserResult`、`TopicResult` を新設する。`composeQuery()`、`searchUsers()`、`searchTopics()`。`buildSearchPath` がタイプとフィルターを受け取る。単体テストで合成（引用符を含む）、3 種類の URL、2 種類の切り出しをカバーする
- [x] 1.2 `searchReducer`：state に `type` と `filters` を追加し、action に `setType` / `setFilters` を追加し、`result` をタイプごとの判別に変更する。単体テストで 2 つの action の「query がなければ記録のみ、query があれば第 1 ページを再検索」をカバーする
- [x] 1.3 `useRepositorySearch`：タイプごとに呼び出し、キャッシュキーにタイプと合成クエリを含め、`setType` / `setFilters` を公開する。`searchCache` の `cacheKey` を拡張する。単体テストでタイプ切替時に対応するエンドポイントへ発行することを検証する
- [x] 1.4 `src/features/search/useTypeCounts.ts`：token と query がある場合に他の 2 種類の `total_count` を取得する。単体テストで token あり / なしと失敗時の静かな無視をカバーする

## 2. コンポーネント

- [x] 2.1 3 つの言語ファイルに `search.type.*`、`search.filters.*`、`search.user.*`、`search.topic.*` キーを新設し、言語リスト定数 `src/lib/languages.ts` を追加する
- [x] 2.2 `SearchTypeTabs` molecule（3 セグメント、任意の件数、aria-pressed）、単体テスト
- [x] 2.3 `SearchFilters` molecule（panel / collapsible の 2 形態、有効条件数、クリア）、単体テストで各コントロールのコールバックと折りたたみ時の件数をカバーする
- [x] 2.4 `UserCard` と `TopicCard` molecule、`RepositoryCard` の言語をクリック可能にし、`SearchResults` をタイプごとにレンダリングしてコールバックを透過させる。単体テスト

## 3. 配線と e2e

- [x] 3.1 `HomePage`：タイプ切替を検索ボックスの上に置き、フィルターを左カラム（panel）とナロー画面の折りたたみ領域（collapsible）に入れ、言語クリックと topic クリックを hook につなぐ。カテゴリクリック時はタイプを repositories に戻す
- [x] 3.2 e2e `e2e/facets.spec.ts`：Users / Topics の切替とカード、Topic クリックでリポジトリに戻ること、フィルター qualifier と入力ボックスが変わらないこと、言語クリック、token あり / なしの件数、600px での折りたたみ。fixture に users と topics のレスポンスを追加する

## 4. 仕上げ

- [x] 4.1 `npm run check` と `npm run test:e2e` が通る。`docs/development.md` にタイプとフィルターの説明を補足する。ROADMAP の C にチェックを入れる
