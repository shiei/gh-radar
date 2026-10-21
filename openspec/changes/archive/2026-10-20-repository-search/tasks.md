# Tasks

## 1. GitHub API アクセス層（specs/github-api-access に対応）

- [x] 1.1 `src/lib/github/types.ts`（`Repository`、`SearchResult`、`SearchSort`）、`errors.ts`（`GitHubError` 判別共用体と型ガード）、`headers.ts`（`buildHeaders()` が Accept と X-GitHub-Api-Version を返し、Authorization は含まない）を作成し、単体テストで `buildHeaders()` のキー集合がちょうどこの 2 項目であることを検証する
- [x] 1.2 `rateLimit.ts` を実装する: `parseRateLimit(headers)` で Remaining / Reset を解析、`getRateLimit()` / `setRateLimit()` / `subscribe()`。単体テストでヘッダーが揃っている、欠落している、数値でないの 3 ケースをカバーする
- [x] 1.3 `request.ts` を実装する: fetch を送信し、毎回のレスポンス後にクォータを更新し、design D3 に従って 403 / 429 / 422 / その他の非 2xx / fetch 例外 / AbortError を分類する。stub fetch の単体テストで各分岐をカバーする（403 + Retry-After、403 + Remaining 0、403 その他、429 ヘッダーなし、キャンセル時はクォータを更新しない、を含む）
- [x] 1.4 `search.ts` を実装する: `searchRepositories({ query, sort, page }, signal)` で URL を構築し（q のエンコード、per_page=10、sort のマッピングは D6 を参照）、レスポンスを `SearchResult` に切り出す。単体テストで 3 種類のソートの URL、`incomplete_results` のパススルー、欠落フィールド（description / license / topics）が null または空配列にマッピングされることを検証する

## 2. フォーマットユーティリティ

- [x] 2.1 `src/lib/format/compactNumber.ts`、`relativeTime.ts`、`dateTime.ts` を実装する。いずれも言語パラメータを受け取り、システム時刻を固定した単体テストで en / ja / zh の 3 言語において 12800 → コンパクト形式、3 日前 → 相対時間、タイムスタンプ → 時:分 の出力が空でなく、期待する数字を含むことを検証する

## 3. 検索ステートマシン（specs/repository-search のソート、ページネーション、読み込み、キャンセルに対応）

- [x] 3.1 `src/features/search/searchReducer.ts`（state と actions は D5 を参照、`maxPage` の導出を含む）を実装し、単体テストで次をカバーする: submit でページ番号をリセット、query がないとき setSort は status を変えない、query があるとき setSort は page=1 にリセット、goToPage の範囲外はクランプされる、成功で総数 0 → empty、エラー → error、aborted は state を変えない
- [x] 3.2 `useRepositorySearch()` を実装する: reducer をラップし、毎回のリクエストに AbortController を作成して前のものをキャンセルし、レスポンス到達時に controller がまだ現在のものか照合する。`renderHook` + stub fetch で「先に react、後に vue、react が後着したら破棄される」および retry が同じパラメータを使うことを検証する

## 4. UI の atoms と molecules（specs/repository-search の表示要件に対応）

- [x] 4.1 3 つの言語ファイルに design D8 に列挙したすべての `search.*` キーを追加し、`locales.test.ts` が通ることを検証する
- [x] 4.2 atoms を作成する: `Input`、`Tag`、`SelectField`（Base UI Select のラッパー、props: label / value / options / onChange、アクセシブルな名前付き）と icons `SearchIcon`、`StarIcon`、`ChevronLeftIcon`、`ChevronRightIcon`、`SpinnerIcon`。単体テストで Input が value/onChange を転送すること、SelectField がキーボードで選択できコールバックすることを検証する
- [x] 4.3 `SearchBar` molecule（入力ボックスのローカル state、Enter またはボタンで送信、空白入力は送信しない、loading 時はボタンを無効化、ソート選択）を実装し、単体テストで 4 つの Submit シナリオと loading の無効化をカバーする
- [x] 4.4 `RepositoryCard` molecule（owner/name リンク target=_blank rel=noopener、説明、stars のコンパクト形式、言語、相対更新時刻、topics Tag、license。欠落フィールドは描画しない）を実装し、単体テストで完全な項目と欠落のある項目の 2 ケースをカバーする
- [x] 4.5 `Pagination` molecule（前のページ / 次のページ / 現在ページと総ページ数、境界では無効化）と `StatusMessage` molecule（loading / empty / error の 3 状態。error は kind によって文言を選び、rate_limited で resetAt があれば時刻を表示し、再試行ボタンを付ける）を実装し、単体テストで 1 ページ目、最終ページ、単一ページの 3 種類の無効化状態と 4 種類の error kind の文言をカバーする

## 5. 結果領域とホームページの接続

- [x] 5.1 `SearchResults` organism（1000 件上限の説明を含む件数文言、`RepositoryCard` リスト、`Pagination`、ページ送り後に領域の先頭へスクロール）を実装し、単体テストで総数 42 と 120000 の 2 種類の件数文言、およびリストの描画件数を検証する
- [x] 5.2 `HomePage` を改修する: タグラインを残し、`SearchBar` と `SearchResults` を追加し、`useRepositorySearch()` で接続する。単体テスト（stub fetch）で送信後に結果カードが表示されることを検証する
- [x] 5.3 `npm run dev` で実際の検索を手動で 1 回通す（1 回のみ。実際のレスポンス形状が fixture と一致することを確認する）。そのレスポンスを匿名化して `e2e/fixtures/search-react.json` として保存し、34 ページ目の実際の振る舞いを design.md の D5 に記録する

## 6. E2E テスト（mock API）

- [x] 6.1 `e2e/fixtures/`（成功 10 件、成功 7 件、空の結果、total 5000 の 100 ページ目）と `e2e/helpers/mockGitHub.ts`（`page.route` で fixture を返し、マッチしない api.github.com リクエストはすべて abort する）を作成し、Playwright 設定で各ケースがこのフォールバックのインターセプトを読み込むことを保証し、意図的に mock しないリクエストが abort されることを検証する
- [x] 6.2 `e2e/search.spec.ts` を書く: 入力 + Enter で結果が出てすべてのフィールドが表示される、入力 + ボタンで結果が出る、qualifier がそのままリクエスト URL に入る、ソート変更後のリクエスト URL に sort=stars と page=1 が付く、2 ページ目へのページ送り、7 件の結果でページネーションが無効化される、100 ページ目で次のページが無効化される、を確認して通ることを検証する
- [x] 6.3 `e2e/search-errors.spec.ts` を書く: 空の結果で通知が出て入力ボックスにクエリが残る、403 + Remaining 0 で回復時刻を表示、422 でクエリ無効を表示、`route.abort()` でネットワーク失敗を表示し再試行できる、未認証リクエストに Authorization ヘッダーが含まれない、を確認して通ることを検証する

## 7. 統合検証とドキュメント

- [x] 7.1 `npm run check` と `npm run test:e2e` を実行し、すべて通ることを確認する。実装中に design.md と異なる決定をした場合（34 ページ目の振る舞い、ディレクトリ名など）は design.md を更新する
- [x] 7.2 `README.md` を更新する: `src/features/`、`src/lib/github/`、`src/lib/format/` のディレクトリ説明を追加し、未認証のクォータ制限と e2e の mock 規約を説明し、README に列挙したコマンドが引き続きそのまま実行できることを検証する

## Workflow follow-up

- change をまたぐ TODO はリポジトリルートの `ROADMAP.md` に統合済みであり、以後はそれを正とする。以下の項目は本 change の記録として残す。
- すべてのタスク完了後に git commit を 1 回実行する（change ごとに単独でコミット）。
- 本 change をアーカイブし、2 つのメイン spec を同期する。
- 次の change 候補: `github-token`（`headers.ts` に Authorization を追加し、`github-api-access` spec の「未認証」要件を変更する）。
- クローズ済み: 読み込み中の送信の振る舞い。独立した検索ボタンを削除した後は、読み込み中にいかなるコントロールも無効化せず、Enter と入力ボックス内のアイコンのどちらも直接新しい検索を発起して古いリクエストをキャンセルする。spec の Loading state 要件は書き換え済み。design.md D7 を参照。
- TODO: セッション内の結果キャッシュ。現状はキャッシュしておらず、ページを戻る場合や同じパラメータを再送信する場合も再度リクエストするため、未認証の 60 回/時のクォータでは無駄が目立つ。`github-token` change の一部として実装することを推奨する: `useRepositorySearch` 内で `query|sort|page` をキーに Map を作り、タイムスタンプを付け、鮮度期間は約 5 分とし、ヒットすればリクエストを発行せず直接 `succeeded` にする。リロードで失効し、永続化しない。複数エンドポイントの並行処理（詳細ページ、比較ページ）が出てきた時点で TanStack Query への置き換えを評価する。
- TODO: リポジトリへの star 付与。書き込み操作であり、ユーザーの `repo` 権限付き token で `PUT /user/starred/{owner}/{repo}` を呼ぶ必要があるため、未認証フェーズでは不可能である。`github-token` 完了後は技術的に可能だが、ユーザー token による変更と読み取り専用アクセスは別のレベルであるため、単独で評価してから行うことを推奨する。
- TODO（発見可能性）: qualifier 構文は一般ユーザーには見えない。短期的にはサンプル chip で緩和済み（spec の Example queries を参照）。中期的には `category-browse`（6 大カテゴリ = プリセットの topic クエリ）と構造化フィルター（言語、最低 star 数、fork 除外など。プログラムが qualifier を組み立てる）で根本的に解決する。両者は独立した change としてスケジュールする。
- 確定（2026-10-20）: 結果項目の追加シグナルはすべて保持する（活動度と最終プッシュ、メタデータ更新、Archived / Fork / Template、fork 数、未クローズ issue 数、サイズ、組織か個人か、公式サイト）。star 増加速度は削除する。spec の Result items 要件と design D7 は更新済み。
