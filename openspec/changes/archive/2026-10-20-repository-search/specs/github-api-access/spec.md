# Spec Delta

## Purpose

アプリケーションがブラウザから GitHub REST API に直接アクセスする方式を定義する: リクエストの形態、認証状態、クォータ情報の解析、および各種の失敗がどのように分類され UI に報告されるか。本フェーズではすべてのアクセスが未認証である。

## ADDED Requirements

### Requirement: Requests target the GitHub REST API directly
すべてのデータリクエストは SHALL ブラウザから直接 `https://api.github.com` に送信され、いかなる中間サービスも経由しない。各リクエストは SHALL GitHub が推奨する JSON メディアタイプと API バージョンヘッダーを付ける。

#### Scenario: Search request shape
- **WHEN** アプリケーションがリポジトリを検索する
- **THEN** リクエストは `GET https://api.github.com/search/repositories` であり、`Accept: application/vnd.github+json` と `X-GitHub-Api-Version` ヘッダーを付ける

### Requirement: Requests are unauthenticated
本フェーズのリクエストは MUST NOT いかなる資格情報や `Authorization` ヘッダーも付けてはならない。アプリケーションは MUST NOT 検索のためにユーザーにログインや token の提供を要求してはならない。

#### Scenario: No credentials attached
- **WHEN** アプリケーションが任意の GitHub API リクエストを送信する
- **THEN** リクエストに `Authorization` ヘッダーがない

### Requirement: Rate limit information is read from every response
各レスポンスの `X-RateLimit-Remaining` と `X-RateLimit-Reset` ヘッダーは SHALL 解析され、現在のクォータ状態として保存され、UI から参照できる。ヘッダーが欠落している場合、クォータ状態は SHALL 不明とみなす。

#### Scenario: Headers present
- **WHEN** レスポンスに `X-RateLimit-Remaining: 7` と `X-RateLimit-Reset: 1760000000` が付いている
- **THEN** クォータ状態は残り 7 回、回復時刻はそのタイムスタンプに対応する時刻である

#### Scenario: Headers absent
- **WHEN** レスポンスにクォータヘッダーがない
- **THEN** クォータ状態は不明となり、エラーにはならない

### Requirement: Rate limit exhaustion is reported with a reset time
レスポンスのステータスが 403 かつ残りクォータが 0、またはステータスが 429 の場合、リクエストは SHALL 「クォータ枯渇」として失敗し、再試行可能な時刻を添える。その時刻は SHALL `Retry-After` ヘッダー（秒）を優先し、なければ `X-RateLimit-Reset` から取得する。両者とも欠落している場合も SHALL クォータ枯渇として報告するが、時刻は添えない。

#### Scenario: Primary rate limit
- **WHEN** レスポンスが 403 で `X-RateLimit-Remaining: 0`、`X-RateLimit-Reset: 1760000000` である
- **THEN** 失敗の種類はクォータ枯渇、再試行時刻は 1760000000 に対応する時刻である

#### Scenario: Secondary rate limit
- **WHEN** レスポンスが 403 で `Retry-After: 60` が付いている
- **THEN** 失敗の種類はクォータ枯渇、再試行時刻は現在時刻 + 60 秒である

#### Scenario: 429 without headers
- **WHEN** レスポンスが 429 でクォータヘッダーがない
- **THEN** 失敗の種類はクォータ枯渇、再試行時刻は不明である

### Requirement: Failures are classified
クォータ枯渇以外のリクエスト失敗は SHALL 次のいずれかの種類に分類される: クエリ無効（422）、ネットワーク到達不能（fetch が例外を投げる）、その他の API エラー（その他すべての非 2xx ステータス、ステータスコードを添える）。UI は生のステータスコードではなく種類に基づいてメッセージを決定する。

#### Scenario: Invalid query
- **WHEN** レスポンスが 422 である
- **THEN** 失敗の種類はクエリ無効である

#### Scenario: Network unreachable
- **WHEN** リクエストがオフラインにより例外を投げる
- **THEN** 失敗の種類はネットワーク到達不能である

#### Scenario: Server error
- **WHEN** レスポンスが 503 である
- **THEN** 失敗の種類はその他の API エラーで、ステータスコード 503 を添える

### Requirement: In-flight requests can be cancelled
各リクエストは SHALL 呼び出し側からキャンセルできる。キャンセルされたリクエストは MUST NOT 成功結果を生成してはならず、また MUST NOT 上記のいずれの失敗の種類にも分類されてはならず、「キャンセル済み」として終了する。

#### Scenario: Cancelled before response
- **WHEN** 呼び出し側がレスポンス到達前にリクエストをキャンセルする
- **THEN** リクエストはキャンセル済みとして終了し、クォータ状態を更新せず、エラーを報告しない
