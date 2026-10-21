# Design

## Context

`project-foundation` はアーカイブ済みであり、利用可能な基盤は次のとおり: Atomic Design ディレクトリ、意味付けされた token ユーティリティクラス、i18next（キーの型は `en.json` から導出）、Base UI 1.0.0-rc.0、Vitest + Testing Library（jsdom、ResizeObserver / matchMedia の stub あり）、Playwright 1.56.1（build + preview）。ホームページには現在タグラインとウェルカム文言しかなく、ヘッダーに言語とテーマの切替がある。

外部制約: GitHub Search API は未認証時に毎分 10 回、IP ごとに毎時 60 回。`per_page` の上限は 100。`page * per_page` が 1000 を超えると 422 を返す。振る舞いの契約は `specs/repository-search/spec.md` と `specs/github-api-access/spec.md` を参照。

## Goals / Non-Goals

**Goals:**
- API アクセス層と UI を完全に分離する: `src/lib/github/` は React に依存せず単独でテスト可能。エラーは型で区別し、UI は型のみを見る。
- 検索状態（クエリ、ソート、ページ番号、結果、ステータス）を 1 つの hook に集約し、コンポーネントはステートレスに保つ。
- 単体テストと e2e のいずれも GitHub に実際にリクエストしない。
- 後続の `github-token` change のための場所を確保する: リクエストヘッダーは 1 つの関数で集中生成し、token の追加はその 1 箇所の変更だけで済む。

**Non-Goals:**
- 検索状態を URL に同期しない（リロードでクリアされる）。これは価値のある機能だが、後続の change に委ねる。
- レスポンスをキャッシュしない。リクエストの重複排除も行わない。
- データ取得ライブラリ（TanStack Query など）は導入しない。D2 を参照。
- 構造化フィルター（言語ドロップダウンなど）は作らない。qualifier のパススルーで上級ユーザーはすでにカバーされている。
- 残りクォータの数値は表示しない。クォータ状態は記録する（spec の要件）が、本フェーズの UI は枯渇時にのみ通知する。

## Decisions

### D1. モジュール分割
```
src/lib/github/
  headers.ts        buildHeaders(): Accept / X-GitHub-Api-Version。token change はここに Authorization を追加する
  errors.ts         GitHubError の判別共用体: rate_limited | invalid_query | network | api | aborted
  rateLimit.ts      parseRateLimit(headers) と現在のクォータ状態の読み書き（モジュールレベル変数 + subscribe 関数）
  request.ts        request<T>(path, init, signal): fetch 送信、クォータ解析、ステータスによるエラー分類
  search.ts         searchRepositories({ query, sort, page }, signal) -> SearchResult
  types.ts          Repository / SearchResult（UI が必要とするフィールドのみ保持。owner.avatar_url を含む）
  index.ts
src/lib/format/
  compactNumber.ts  Intl.NumberFormat(lang, { notation: 'compact' })
  relativeTime.ts   Intl.RelativeTimeFormat(lang) で適切な単位を選択
  dateTime.ts       Intl.DateTimeFormat(lang, { hour, minute }) クォータ回復時刻に使用
src/features/search/
  useRepositorySearch.ts   useReducer + AbortController による検索ステートマシン
  searchReducer.ts         純粋な reducer。単独でテスト
```
`features/` は新しいディレクトリである。「ある機能の状態ロジック」を置き、汎用 lib でも UI コンポーネントでもない。`lib/` との境界は、`lib/` は React のコンポーネントツリーを知らず、`features/` は React hook である、という点にある。

### D2. データ取得ライブラリを導入しない
エンドポイントは 1 つだけで、キャッシュ要件も楽観的更新もない。reducer 1 つと AbortController で「古いリクエストをキャンセルし、期限切れのレスポンスを破棄する」を十分に表現できる。詳細ページや比較ページで複数エンドポイントの並行処理が出てきた時点で TanStack Query を評価する。代替案は SWR / TanStack Query だが、本フェーズでは得られる利益が依存と認知コストに見合わないため採用しなかった。

### D3. エラーモデル
```ts
type GitHubError =
  | { kind: 'rate_limited'; resetAt: Date | null }
  | { kind: 'invalid_query' }
  | { kind: 'network' }
  | { kind: 'api'; status: number }
  | { kind: 'aborted' }
```
Error のサブクラスではなく判別共用体を使う: reducer が state にそのまま格納でき、シリアライズしやすく、テストのアサーションが簡単である。`request.ts` がこれらの値を生成する唯一の場所である。403 の判定: `X-RateLimit-Remaining === '0'` または `Retry-After` が存在する場合は rate_limited とみなし、それ以外は `api` に分類する（403 は他の原因でも発生し得る）。

### D4. クォータ状態の保存場所
`rateLimit.ts` はモジュールレベル変数で最新の `{ remaining, resetAt }` を保持し、`getRateLimit()` / `subscribe()` を提供する。本フェーズの UI はこれを消費しないが、spec が記録を要求している。`github-token` change がこれを使って残り回数を表示する。React state に入れないのは、リクエストやコンポーネントをまたぐ値であり、再レンダリングを引き起こさなくても問題ないためである。

### D5. 検索ステートマシン
```
state: {
  query: string            送信済みのクエリ（入力ボックスの内容ではない）
  sort: 'best' | 'stars' | 'updated'
  page: number
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error'
  result: SearchResult | null
  error: GitHubError | null
}
actions: submit(query) | setSort(sort) | goToPage(page) | retry()
```
- 入力ボックスの内容は SearchBar のローカル state であり、送信時のみ reducer に入る。
- `setSort` は `query` が空のときは sort のみを変更し、リクエストを発行しない。それ以外は page=1 にリセットしてリクエストする。
- 毎回のリクエスト前に前の controller を `abort()` する。レスポンス到達時に controller が現在のものでなければ破棄する（二重の保険: abort により fetch は aborted として reject され、reducer は aborted に対して何もしない）。
- 1 ページ 10 件、最大ページ数は `min(ceil(total/10), 100)`。実測（2026-10-19、当時は per_page=30、`page=34`）では 200 が返り 30 件すべて揃っていたため、GitHub の 1000 件制限は開始オフセットで判定している（`(page-1)*per_page < 1000`）と分かる。per_page=10 に換算すると 100 ページ目まで完全にアクセスでき、101 ページ目はドキュメントどおり 422 を返す。ユーザーは実装後に 1 ページあたりの件数を 30 から 10 に変更し、1 ページの長さを短くした。

### D6. リクエストパラメータのマッピング
| UI ソート | API パラメータ |
|--------|---------|
| best | sort を渡さない |
| stars | `sort=stars&order=desc` |
| updated | `sort=updated&order=desc` |

`q` は `encodeURIComponent(query.trim())` をそのまま使う。`per_page=10`。

### D7. UI コンポーネント
- atoms: `Input`（ネイティブ input、token スタイル）、`Tag`（topic タグ）、`SelectField`（Base UI Select の汎用ラッパー。label と options を持ち、ソート選択で使用）、icons: `SearchIcon`、`StarIcon`、`ChevronLeftIcon`、`ChevronRightIcon`、`SpinnerIcon`。
- molecules: `SearchHints`（検索ボックス下部のサンプルクエリ chip と構文ドキュメントへのリンク。chip のクリックは入力ボックスと同じ `submit` を通る）、`SearchBar`（Input + SelectField。独立した検索ボタンはなし: Enter で送信、入力ボックス内右側の矢印アイコンがヒント兼クリック送信。`type="search"` + `enterKeyHint="search"` でスマートフォンのソフトキーボードに「検索」キーを表示する。読み込み中は矢印が spinner に変わるが何も無効化せず、新しい送信は古いリクエストを直接キャンセルする）、`RepositoryCard`、`Pagination`（Previous / ページ番号 / Next に ghost ボタンとページ番号ボタンを使い、現在ページは accent 背景に白文字でホバーしても変化しない。`pageRange()` が先頭・末尾と現在ページ ±2 のウィンドウおよび省略記号を担当する）、`StatusMessage`（loading / empty / error の 3 状態。error には再試行ボタンが付く）。
  - 履歴: 当初は独立した Search ボタンがあり、読み込み中はネイティブの `disabled` を使っていたが、これはブラウザの暗黙の送信（Enter）も同時に無効化し、「進行中に新しい検索を送信したら古いリクエストをキャンセルする」と矛盾した。`aria-disabled` と click の `preventDefault` も実際のブラウザでは同様に Enter を阻害する。独立ボタンを削除したことでこの矛盾は解消し、元の TODO はそれに伴ってクローズした。
- organisms: `SearchResults`（件数、リスト、ページネーションの組み合わせ）。
- 結果カードの追加シグナル（2026-10-20 確定）: 活動度は `pushed_at` から導出（`activityOf`: 30 日以内 active、180 日以内 quiet、それ以外 inactive）、Archived / Fork / Template は `archived` / `fork` / `is_template` から、fork 数、未クローズ issue 数（GitHub は PR を含めて数える）、`size`（KB、`formatKb`）、`owner.type`、`homepage`。かつて表示していた star 増加速度は削除した。
- topic タグは `<button>` であり、クリック後に `onSearch` コールバック経由で `topic:<名称>` を `useRepositorySearch().submit` に渡す。入力ボックスからの送信と同じ経路を通る。`SearchBar` は送信済みの `query` を受け取りローカルの入力値に同期するため、検索がどこから発起されても入力ボックスは現在のクエリを表示する。
- `HomePage` は SearchBar + SearchResults を組み合わせ、タグラインは検索ボックスの上に残す（草案と一致）。
LanguageSwitcher は範囲拡大を避けるため当面 SelectField に切り替えない。後で統一できる。

### D8. 文言とフォーマット
- 新規キーは `search.*` 名前空間に置く: `search.placeholder`、`search.submit`、`search.sort.{label,best,stars,updated}`、`search.count`（`{{count}}` 補間付き）、`search.countCapped`、`search.pagination.{previous,next,page}`（previous / next の文言には page の語を含めない。ユーザーの要望）、`search.state.{loading,empty}`、`search.error.{rateLimited,rateLimitedUntil,invalidQuery,network,api,retry}`、`search.repo.{stars,updated,license}`。
- 数値、相対時間、時刻はすべて `Intl` を使い現在の言語を渡す。手書きのフォーマットはしない。単体テストは `en` に固定し、`vi.setSystemTime` で現在時刻を固定する。
- 時刻表示は GitHub 式の混合戦略（`formatTimestamp`）を採用する: 30 日以内は相対時間、それを超えると `Intl.DateTimeFormat` の絶対日付。要素の `title` には分単位まで正確な完全な時刻を付ける。カードは `pushed_at`（Last push、コードのプッシュ）と `updated_at`（Metadata updated、リポジトリメタデータの変更）の両方を表示し、両者のフォーマット規則は同じでラベルの文言で区別する。`title` ではまず意味を説明してから完全な時刻を示す。

### D9. テスト戦略
- `lib/github` の単体テストは `vi.stubGlobal('fetch', vi.fn())` で `Response` を構築し、各ステータスコードとヘッダーの組み合わせをカバーする。msw は導入しない。
- reducer は状態遷移を単独でテストする。hook は Testing Library の `renderHook` と stub fetch でキャンセルと期限切れレスポンスをテストする。
- e2e は `page.route('https://api.github.com/**', ...)` で `e2e/fixtures/*.json` を返す。ケース: 検索成功とフィールド表示、ソート変更による再検索、ページ送りと境界、結果なし、クォータ枯渇の通知、422、オフライン（`route.abort()`）。
- e2e はすべてのケースで GitHub ドメインをインターセプトしなければならず、誤って実 API を叩いてクォータを消費することを避ける。実装方式は、`e2e/helpers/test.ts` で `test.extend` を使って `auto` fixture を登録し、各ページに対してまずすべての `api.github.com` リクエストを abort する route を 1 つ掛ける。すべての spec はこのファイルから `test` を import する。ケース自身が登録した route は後に登録されたものが先にマッチするため、フォールバックを上書きできる。

## Risks / Trade-offs

- [未認証の 60 回/時は IP 単位で計上され、ローカル開発で繰り返し手動テストするとすぐに枯渇する] → 開発時は `npm run dev` にブラウザ devtools のリクエストインターセプトを組み合わせるか、できるだけ早く `github-token` change を実装する。design はこのための一時的な抜け道を追加しない。
- [GitHub の 403 の意味は一意でない] → D3 の判定規則を使う。判定できない場合は汎用の `api` エラーとし、メッセージは引き続き再試行可能とする。
- [34 ページ目の境界の振る舞いは未実測] → タスクに fixture で total=5000 をシミュレートする境界テストを含める。実際の振る舞いは実装時に実リクエストを 1 回行って確認し記録する。
- [`Intl.RelativeTimeFormat` は jsdom 下では Node の ICU に依存する] → Node 24 は full-icu を同梱しており、日本語と中国語が使える。CI で軽量版 Node を使う場合は注意が必要。
- [結果リスト 30 件それぞれに topics が付くと DOM ノードが多くなる] → 本フェーズでは仮想リストは行わない。30 件は実測で問題にならなかった。

## Open Questions

- （解決済み）相対時間の閾値は 30 日と定めた。D8 を参照。
