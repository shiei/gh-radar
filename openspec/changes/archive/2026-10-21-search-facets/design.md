# Design

## Context

現状：`searchReducer` の state は `query / sort / page / status / result / error / requestId` である。`useRepositorySearch` は requestId ごとに 1 回 `searchRepositories` を発行する。キャッシュキーは `query|sort|page`。`SearchResults` は `RepositoryCard` しかレンダリングしない。左カラムには現在 `CategoryNav` しかない。振る舞いの契約はこの change の 3 つの delta spec を参照する。

## Goals / Non-Goals

**Goals:**
- 1 つの reducer で 3 種類のタイプを管理し、状態機械を複製しない。
- フィルター条件はデータ（オブジェクト）であり、qualifier 文字列は URL 構築時に 1 回だけ生成する。
- タイプ件数は付随リクエストである：失敗は静かに無視し、主状態機械には入らない。

**Non-Goals:**
- code / issues / commits の検索は行わない。
- フィルター条件の URL 同期は行わない。
- 言語リストの動的取得は行わない。固定の 20 種類の一般的な言語を使う。

## Decisions

### D1. タイプとフィルターを state に入れる
```ts
type SearchType = 'repositories' | 'users' | 'topics'
interface SearchFilters { language: string | null; minStars: 0 | 100 | 1000 | 10000; excludeForks: boolean; excludeArchived: boolean }
state += { type: SearchType; filters: SearchFilters }
actions += setType(type) | setFilters(partial)
```
`setType` / `setFilters` のルールは `setSort` と同じである：query がなければ状態だけを変更し、query があれば page=1 にしてリクエストを発行する。`result` はタイプごとの判別共用体に変更する：`{ type: 'repositories', ... } | { type: 'users', ... } | { type: 'topics', ... }`。`SearchResults` は `result.type` でカードを選ぶ。

### D2. クエリ合成 `composeQuery(query, filters)`
`[query, language && \`language:${language}\`, minStars > 0 && \`stars:>=${minStars}\`, excludeForks && 'fork:false', excludeArchived && 'archived:false'].filter(Boolean).join(' ')`。言語の値には GitHub の `language:` が認識できる書き方を使う（空白を含むものは引用符で囲む。例えば `"c++"` は不要、`"jupyter notebook"` は必要）。フィルターは repositories にのみ有効である。users / topics の q は元のクエリそのままである。

### D3. API 層
`searchUsers` → `GET /search/users`、`{ login, avatarUrl, htmlUrl, kind: 'User' | 'Organization' }` に切り出す。`searchTopics` → `GET /search/topics`、`{ name, displayName, description, featured, curated }` に切り出す。両者は `request()` とクォータ処理を再利用する。`per_page=10`、上限 1000 件はリポジトリと同じである。キャッシュキーは `${type}|${composedQuery}|${sort}|${page}` で、`cacheKey` が一元的に生成する。

### D4. タイプ件数
`useTypeCounts(query, token)`：`getToken()` が空でなく、かつ query が空でない場合のみ、他の 2 種類のタイプに対してそれぞれ `per_page=1` のリクエストを発行して `total_count` を読む。結果は hook 内の state に保存し、キーは query とする。失敗時または token がない場合は null を返す。主 reducer から独立しており、loading 状態に影響しない。

### D5. コンポーネント
- `SearchTypeTabs`（molecule）：3 セグメントの切替、ボタンの文言 + 任意の件数、`aria-pressed`。`SearchBar` の上の 1 行に置く。
- `SearchFilters`（molecule）：言語 `SelectField`、最低 star `SelectField`、2 つのスイッチ（Base UI Switch、ThemeToggle のスタイル基盤を再利用）、「クリア」ボタン。props は `filters / onChange / variant: 'panel' | 'collapsible'`。
- `UserCard`、`TopicCard`（molecule）。
- `SearchResults` は `onLanguageClick` と `onTopicClick`（後者は既存）を受け取る。
- `RepositoryCard` の言語 span を `TagButton` に変更し、コールバックがあればクリック可能にする。
- レイアウト：`DiscoveryLayout` の `sidebar` slot を `CategoryNav` + `SearchFilters(panel)` に変更する。`chips` slot の下に `SearchFilters(collapsible)` を追加する。

### D6. 言語リスト
JavaScript, TypeScript, Python, Go, Rust, Java, Kotlin, Swift, C, C++, C#, Ruby, PHP, Dart, Scala, Elixir, Haskell, Lua, Shell, Jupyter Notebook。値は GitHub の言語名と一致させる。表示名は翻訳しない。

### D7. テスト
単体：`composeQuery`（引用符を含む）、reducer の setType / setFilters ルール、`searchUsers` / `searchTopics` の URL と切り出し、`useTypeCounts` の token あり / なし、`SearchFilters` の操作、`UserCard` / `TopicCard`、`RepositoryCard` の言語クリック。e2e：Users に切り替えるとユーザーカードが表示され URL が `/search/users` であること。Topics カードのクリックでリポジトリに戻り `topic:` を伴うこと。フィルター設定後にリクエストの q が qualifier を含み入力ボックスが変わらないこと。token ありでボタンに件数が表示され、token なしではリクエストが 1 回だけであること。600px でフィルターが折りたたまれ有効件数が表示されること。

## Risks / Trade-offs

- [token がある場合は 1 回の検索で 3 回リクエストし、30 回/分のクォータでは約 10 回の検索/分になる] → 件数は token がある場合のみ発行する。キャッシュが重複クエリをカバーする。ページヘッダーには引き続き残りクォータを表示する。
- [`/search/topics` の `total_count` は 1000 件制限の影響を受けないが、ページネーションの上限は同じく 1000 である] → `maxPage` を踏襲する。
- [言語フィルターとユーザー自身が書いた `language:` が衝突する] → 両方を GitHub に送り、GitHub は AND として処理して空の結果を返す。フィルターパネルに有効な条件を表示するので、ユーザーは気づける。重複排除は行わない。
