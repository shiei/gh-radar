# github-api-access Specification

## Purpose

アプリケーションがブラウザから直接 GitHub REST API にアクセスする方式を定義する：リクエストの形、認証状態、クォータ情報の解析、および各種の失敗をどう分類して UI に報告するか。本フェーズではすべてのアクセスは未認証である。

## Requirements

### Requirement: Requests target the GitHub REST API directly
すべてのデータリクエスト SHALL ブラウザから直接 `https://api.github.com` に送り、いかなる中間サービスも経由しない。各リクエスト SHALL GitHub が推奨する JSON メディアタイプと API バージョンのヘッダーを付ける。

#### Scenario: Search request shape
- **WHEN** アプリケーションがリポジトリを検索する
- **THEN** リクエストは `GET https://api.github.com/search/repositories` で、`Accept: application/vnd.github+json` と `X-GitHub-Api-Version` ヘッダーを伴う

### Requirement: Rate limit information is read from every response
各レスポンスの `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset` ヘッダー SHALL 解析して現在のクォータ状態（上限、残量、回復時刻）として保存し、UI から参照できるようにする。Remaining または Reset が欠けている場合、クォータ状態 SHALL 不明とみなす。Limit が欠けている場合は上限を不明とみなすが、他のフィールドには影響しない。

#### Scenario: Headers present
- **WHEN** レスポンスに `X-RateLimit-Limit: 30`、`X-RateLimit-Remaining: 7`、`X-RateLimit-Reset: 1760000000` が付いている
- **THEN** クォータ状態は上限 30、残量 7、回復時刻はそのタイムスタンプに対応する時刻になる

#### Scenario: Headers absent
- **WHEN** レスポンスにクォータヘッダーがない
- **THEN** クォータ状態は不明となり、エラーにはならない
### Requirement: Rate limit exhaustion is reported with a reset time
レスポンスのステータスが 403 かつ残量クォータが 0、またはステータスが 429 のとき、リクエスト SHALL 「クォータ枯渇」として失敗し、リトライ可能な時刻を添える。その時刻 SHALL `Retry-After` ヘッダー（秒）を優先し、なければ `X-RateLimit-Reset` から取る。両方が欠けている場合 SHALL クォータ枯渇は報告するが時刻は添えない。

#### Scenario: Primary rate limit
- **WHEN** レスポンスが 403 で `X-RateLimit-Remaining: 0`、`X-RateLimit-Reset: 1760000000` を伴う
- **THEN** 失敗種別はクォータ枯渇で、リトライ時刻は 1760000000 に対応する時刻になる

#### Scenario: Secondary rate limit
- **WHEN** レスポンスが 403 で `Retry-After: 60` を伴う
- **THEN** 失敗種別はクォータ枯渇で、リトライ時刻は現在時刻に 60 秒を加えた時刻になる

#### Scenario: 429 without headers
- **WHEN** レスポンスが 429 でクォータヘッダーがない
- **THEN** 失敗種別はクォータ枯渇で、リトライ時刻は不明になる

### Requirement: Failures are classified
クォータ枯渇以外のリクエスト失敗 SHALL 次のいずれかの種別に分類する：無効なクエリ（422）、ネットワーク到達不能（fetch が例外を投げる）、その他の API エラー（それ以外の非 2xx ステータス、ステータスコードを添える）。UI は生のステータスコードではなく種別に基づいて表示を決める。

#### Scenario: Invalid query
- **WHEN** レスポンスが 422 である
- **THEN** 失敗種別は無効なクエリになる

#### Scenario: Network unreachable
- **WHEN** リクエストがオフラインのため例外を投げる
- **THEN** 失敗種別はネットワーク到達不能になる

#### Scenario: Server error
- **WHEN** レスポンスが 503 である
- **THEN** 失敗種別はその他の API エラーで、ステータスコード 503 を添える

### Requirement: In-flight requests can be cancelled
各リクエスト SHALL 呼び出し側からキャンセルできる。キャンセルされたリクエストは MUST NOT 成功結果を生成せず、MUST NOT 上記のいずれの失敗種別にも分類されず、「キャンセル済み」として終了する。

#### Scenario: Cancelled before response
- **WHEN** 呼び出し側がレスポンス到着前にリクエストをキャンセルする
- **THEN** リクエストはキャンセル済みとして終了し、クォータ状態を更新せず、エラーも報告しない

### Requirement: Requests carry the user's token when configured
ユーザーが token を設定済みのとき、すべての GitHub API リクエスト SHALL `Authorization: Bearer <token>` ヘッダーを付ける。未設定のときは MUST NOT いかなる資格情報も付けない。token は MUST NOT `api.github.com` 以外のいかなるアドレスにも送らない。

#### Scenario: Token configured
- **WHEN** ユーザーが有効な token を保存済みで検索を開始する
- **THEN** リクエストに `Authorization: Bearer` ヘッダーが付き、その値は当該 token である

#### Scenario: No token
- **WHEN** ユーザーが token を設定していない
- **THEN** リクエストに `Authorization` ヘッダーがない

### Requirement: Token can be validated without spending quota
アプリケーション SHALL `GET /rate_limit` で token を検証する：200 は有効とみなし同時にクォータ状態を更新する。401 は無効とみなす。このリクエストはクォータに計上されない。

#### Scenario: Valid token
- **WHEN** token を付けて `/rate_limit` をリクエストし 200 が返る
- **THEN** 検証に成功し、クォータ状態がレスポンス中の search リソースの上限と残量に更新される

#### Scenario: Invalid token
- **WHEN** token を付けて `/rate_limit` をリクエストし 401 が返る
- **THEN** 検証に失敗し、token が無効であると報告し、クォータ状態は変わらない
