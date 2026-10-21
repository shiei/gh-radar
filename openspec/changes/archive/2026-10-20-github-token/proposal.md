# Proposal

## Why

GitHub API への未認証アクセスのクォータ（search は毎分 10 回、その他は IP ごとに毎時 60 回）はフローの検証には足りるが、第 2 フェーズの種類別カウント、ランキング、フィルターを支えることはできない。ユーザーが自分の個人 token を設定すると、search は毎分 30 回、その他は毎時 5000 回に引き上げられ、これが以降のすべての機能の前提となる。同時にセッション内の結果キャッシュを追加し、重複リクエストを減らす。

## What Changes

- ヘッダーに token の入口を新設する: 未設定時は「GitHub に接続」を表示し、設定済みの時は残りの search クォータを表示する。クリックするとポップオーバーが開き、token の貼り付け、検証、保存、削除ができる。
- token はローカルブラウザの localStorage にのみ保存し、`api.github.com` にのみ送信する。ポップオーバー内で明示的に説明し、読み取り専用の fine-grained token の作成を案内する。
- 保存前に `GET /rate_limit` で検証する（このエンドポイントはクォータに計上されない）。無効な token は保存せず通知する。
- すべての GitHub リクエストは token がある場合に `Authorization: Bearer` を付ける。
- クォータ状態に上限値を追加し、ヘッダーに「残り / 上限」を表示する。
- 検索結果は `クエリ|ソート|ページ番号` をキーにセッション内で 5 分間キャッシュし、ヒット時はリクエストを発行しない。ページをリロードすると失効する。
- 本 change の完了後に単独で git commit する。

## Capabilities

### New Capabilities

- `github-token`: ユーザーが個人 token を設定、検証、削除する振る舞い、token の保存場所とセキュリティ制約、およびクォータ状態の表示。

### Modified Capabilities

- `github-api-access`: "Requests are unauthenticated" を「token がある場合は Authorization を付ける」に変更する。クォータ解析に上限値を追加する。
- `repository-search`: セッション内キャッシュの要件を追加する。

## Impact

- `src/lib/github/`: `token.ts` を新規追加。`headers.ts` が token を読む。`rateLimit.ts` が `X-RateLimit-Limit` を解析する。`validateToken()` を新規追加。
- `src/features/search/`: キャッシュロジック。
- `TokenMenu` molecule を新規追加し、`Header` に組み込む。
- 3 つの言語ファイルに `token.*` キーを新規追加。
- 外部依存は変わらず、引き続き GitHub REST API である。
