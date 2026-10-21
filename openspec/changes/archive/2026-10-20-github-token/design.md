# Design

## Context

`repository-search` はアーカイブ済み。関連する現状: `headers.ts` がリクエストヘッダーを生成する唯一の場所である。`rateLimit.ts` はモジュールレベル変数で最新レスポンスの remaining / resetAt を保持し、subscribe を提供する。`useRepositorySearch` は requestId ごとに 1 回リクエストを発行する。ヘッダー右側に言語とテーマのコントロールがある。振る舞いの契約は本 change の 3 つの delta spec を参照。

## Goals / Non-Goals

**Goals:**
- token の読み書きを 1 つのモジュールに集約し、リクエスト層は `buildHeaders()` で 1 回だけ読む。
- 検証はクォータを消費せず、失敗しても汚れた状態を残さない。
- キャッシュは reducer に対して透過的である: ヒット時も `succeeded` action を通り、コンポーネントは関知しない。

**Non-Goals:**
- OAuth ログインは行わない。ユーザーに代わって書き込み操作を発起しない。
- キャッシュを localStorage に永続化しない。
- search 以外のリソースのクォータは表示しない。

## Decisions

### D1. token モジュール
`src/lib/github/token.ts`: `getTokenState()` は `{ token, remembered }` を返し、`setToken(token, { remember })`、`clearToken()`、`subscribeToken()` を提供する。デフォルトではメモリにのみ保存し、`remember` が真の場合のみ localStorage（キー `osr.token`）に書く。起動時に localStorage に値があれば記憶済みとみなす。`buildHeaders()` は token がある場合に `Authorization: Bearer` を追加する。token 変更時に `setRateLimit(null)` を呼ぶ。

脅威モデル（2026-10-20 にユーザーと確認）: 純粋なフロントエンドではページ内 JS に対して秘密情報を隠すことはできず、できるのは露出面を狭めることである。3 項目を採用する: デフォルトでディスクに書かない（ディスクと同一マシンの他者を防ぐ）、CSP（スクリプトインジェクションを防ぐ）、最小権限 token の案内（漏洩後の損失上限を抑える）。パスフレーズによる暗号化とバックエンド OAuth は後続の選択肢として ROADMAP に記録する。

### D2. 検証
`validateToken(token, signal)`: `GET /rate_limit` を候補の token（保存済みのものではない）を付けて直接 fetch する。200 → `resources.search` の limit / remaining / reset を解析してクォータ状態に書き込み ok を返す。401 → `{ kind: 'invalid_token' }`。それ以外は `request.ts` の分類を踏襲する。`request()` を再利用しないのは、それが保存済みの token を読むためである。

### D3. クォータ上限
`RateLimit` に `limit: number | null` を追加し、`parseRateLimit` が `X-RateLimit-Limit` を読む。ヘッダーには `remaining / limit` を表示し、limit が不明の場合は remaining のみ表示する。

### D4. UI
`TokenMenu` molecule: Base UI Popover。トリガーボタンは `Header` の設定領域の最も左に置く。内容: 一文の説明、token 作成へのリンク（GitHub の fine-grained token ページを指し、読み取り専用を事前選択）、パスワード入力、保存ボタン（検証中は RadarSpinner を表示）、エラー表示、設定済み時の削除ボタン。`useSyncExternalStore` で token とクォータ状態を購読する。

### D5. キャッシュ
`src/features/search/searchCache.ts`: モジュールレベルの `Map<string, { result, storedAt }>`、キーは `${query}|${sort}|${page}`、TTL 5 分、上限 50 件（超過分は挿入順に追い出す）。`useRepositorySearch` の effect はまずキャッシュを調べる: ヒットすれば同期的に `succeeded` を dispatch して返り、AbortController を作らない。ミスなら元の経路を通り、成功後に書き込む。`retry` の前にそのキーを削除し、再試行が実際のリクエストになることを保証する。token 変更ではキャッシュをクリアしない（結果は認証状態と無関係である）。

### D6. テスト
単体: token モジュール、token あり / なしの headers、limit 付きの parseRateLimit、validateToken の 3 種類のレスポンス、searchCache の TTL と追い出し、hook のヒット経路。e2e: `/rate_limit` を mock し、有効な token を保存した後の次の search リクエストに Authorization が付くことをアサートする。無効な token はエラーを表示し保存しない。リロード後も設定済み。削除後は Authorization なし。同じパラメータの 2 回目の検索はリクエストを発行しない。

### D7. CSP
`vite.config.ts` 内の `cspPlugin`（build のみ）が `index.html` に `<meta http-equiv="Content-Security-Policy">` を注入する: `script-src 'self'` にインラインテーマスクリプトの sha256 ハッシュを加える。`connect-src 'self' https://api.github.com`。`img-src 'self' data: https://avatars.githubusercontent.com`。`style-src 'self' 'unsafe-inline'`（React と Base UI は CSSOM 経由でスタイルを設定するため影響を受けないが、サードパーティの属性による記述に備えて unsafe-inline を残す）。`object-src 'none'`、`base-uri 'self'`、`form-action 'self'`。開発モードでは注入しない。Vite 自身がインラインスクリプトを挿入する必要があるためである。デプロイ時は HTTP レスポンスヘッダーに変更すべきである。

## Risks / Trade-offs

- [token は使用中に必ず平文でメモリに存在し、XSS や拡張機能から読める] → デフォルトでディスクに書かず、CSP でインジェクションを防ぎ、最小権限 token で損失を限定する。本サイトにはサードパーティスクリプトがなく、ユーザー生成の HTML を描画しない。根本的な解決策はバックエンドが秘密情報を保持すること（第 3 フェーズ）。
- [`/rate_limit` の search リソースと実際の search レスポンスヘッダーが一時的に一致しない可能性がある] → ヘッダーは最新のレスポンスを正とし、検証は初期化にすぎない。
- [キャッシュヒット時にクォータ表示が更新されない] → 許容できる。ヒットはそもそもクォータを消費しない。
