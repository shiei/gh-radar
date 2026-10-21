# Spec Delta

## ADDED Requirements

### Requirement: Requests carry the user's token when configured
ユーザーが token を設定済みの場合、すべての GitHub API リクエストは SHALL `Authorization: Bearer <token>` ヘッダーを付ける。未設定の場合は MUST NOT いかなる資格情報も付けてはならない。token は MUST NOT `api.github.com` 以外のいかなるアドレスにも送信してはならない。

#### Scenario: Token configured
- **WHEN** ユーザーが有効な token を保存済みで検索を発起する
- **THEN** リクエストは `Authorization: Bearer` ヘッダーを付け、その値はその token である

#### Scenario: No token
- **WHEN** ユーザーが token を設定していない
- **THEN** リクエストに `Authorization` ヘッダーがない

### Requirement: Token can be validated without spending quota
アプリケーションは SHALL `GET /rate_limit` で token を検証する: 200 は有効とみなし同時にクォータ状態を更新する。401 は無効とみなす。このリクエストはクォータに計上されない。

#### Scenario: Valid token
- **WHEN** token を付けた `/rate_limit` へのリクエストが 200 を返す
- **THEN** 検証に成功し、クォータ状態はレスポンス内の search リソースの上限と残りに更新される

#### Scenario: Invalid token
- **WHEN** token を付けた `/rate_limit` へのリクエストが 401 を返す
- **THEN** 検証に失敗し、token が無効であると報告し、クォータ状態は変わらない

## MODIFIED Requirements

### Requirement: Rate limit information is read from every response
各レスポンスの `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset` ヘッダーは SHALL 解析され、現在のクォータ状態（上限、残り、回復時刻）として保存され、UI から参照できる。Remaining または Reset が欠落している場合、クォータ状態は SHALL 不明とみなす。Limit が欠落している場合は上限を不明とみなすが、その他のフィールドには影響しない。

#### Scenario: Headers present
- **WHEN** レスポンスに `X-RateLimit-Limit: 30`、`X-RateLimit-Remaining: 7`、`X-RateLimit-Reset: 1760000000` が付いている
- **THEN** クォータ状態は上限 30、残り 7、回復時刻はそのタイムスタンプに対応する時刻である

#### Scenario: Headers absent
- **WHEN** レスポンスにクォータヘッダーがない
- **THEN** クォータ状態は不明となり、エラーにはならない

## REMOVED Requirements

### Requirement: Requests are unauthenticated
**Reason**: 第 2 フェーズではユーザーが個人 token を設定できるようになり、未認証が唯一の状態ではなくなった。
**Migration**: "Requests carry the user's token when configured" でカバーする: token 未設定時の振る舞いは元の要件と同じである。
