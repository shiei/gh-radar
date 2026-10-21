# Spec Delta

## Purpose

ユーザーが本サイトで GitHub の個人 token を設定する方式を定義する: 入口、検証、保存、削除、セキュリティ制約、およびクォータ状態をユーザーにどのように表示するか。

## ADDED Requirements

### Requirement: Token entry lives in the header
ヘッダーには SHALL 常時表示される token の入口がある。未設定時は「GitHub に接続」のような文言を表示し、設定済みの時は現在の search クォータの「残り / 上限」を表示する。入口のクリックは SHALL ポップオーバーを開く。

#### Scenario: Not configured
- **WHEN** ユーザーが token を設定していない
- **THEN** ヘッダーの入口は接続の案内を表示し、クォータの数値は表示しない

#### Scenario: Configured
- **WHEN** ユーザーが token を設定済みで、最新レスポンスのクォータが残り 27、上限 30 である
- **THEN** ヘッダーの入口は 27 / 30 を表示する

### Requirement: Token is validated before it is saved
ポップオーバー内には SHALL パスワード型の入力ボックスと保存操作がある。保存時は SHALL まず token を検証する。検証に成功した場合のみローカルストレージに書き込みポップオーバーを閉じる。検証に失敗した場合は SHALL 無効の通知を表示し、保存しない。検証中は SHALL 読み込み状態を表示する。

#### Scenario: Save a valid token
- **WHEN** ユーザーが有効な token を貼り付けて保存する
- **THEN** token が保存され、ポップオーバーが閉じ、ヘッダーの入口がクォータ表示に変わる

#### Scenario: Reject an invalid token
- **WHEN** ユーザーが無効な token を貼り付けて保存する
- **THEN** 「token が無効」の通知を表示し、入力ボックスは内容を保持し、ストレージに token はない

#### Scenario: Blank input
- **WHEN** ユーザーが何も入力せずに保存する
- **THEN** 検証を発起せず、保存しない

### Requirement: Token lives in memory unless the user opts to remember it
保存した token はデフォルトで SHALL メモリにのみ保持し、タブを閉じると消え、MUST NOT いかなる永続ストレージにも書き込んではならない。ポップオーバーは SHALL 「このデバイスで記憶する」のチェックを提供し、デフォルトは未チェックとする。チェックした場合のみ token をこのブラウザの localStorage に書き込む。チェックの横には SHALL ページのスクリプトやブラウザ拡張機能が読み取る可能性があること、共用のコンピューターではチェックしないことを説明する。いずれの方式でも、token は MUST NOT `api.github.com` 以外のいかなるアドレスにも送信してはならない。

#### Scenario: Default is memory only
- **WHEN** ユーザーが token を保存し、「このデバイスで記憶する」をチェックしていない
- **THEN** このタブ内のリクエストはその token を付け、localStorage に token はなく、ページをリロードすると未設定状態に戻る

#### Scenario: Remember on this device
- **WHEN** ユーザーが「このデバイスで記憶する」をチェックして保存する
- **THEN** token が localStorage に書き込まれ、ページをリロードしても設定済み状態のままで、ポップオーバーは「このデバイスで記憶済み」と表示する

#### Scenario: Risk note is shown
- **WHEN** ユーザーがポップオーバーを開く
- **THEN** 「デフォルトではメモリのみ、GitHub にのみ送信する」という説明と、チェック項目の横にスクリプトや拡張機能から読み取れることに関する注意書きが見える

### Requirement: Guidance asks for a least-privilege token
ポップオーバーは SHALL GitHub の fine-grained token 新規作成ページへのリンクを提供し、リンクの文言は用途のみを説明する。リンクの下には SHALL 別途注意書きを置き、漏洩後のリスクを下げるために推奨する点を説明する: 読み取り専用、公開リポジトリのみ、短期の有効期限。

#### Scenario: Link and wording
- **WHEN** ユーザーがポップオーバーを開く
- **THEN** 作成リンクが見え、その下の注意書きに読み取り専用、公開リポジトリのみ、短期の有効期限の 3 点が含まれる

### Requirement: Production page restricts script and connection origins
本番ビルドのページは SHALL Content Security Policy を持つ: スクリプトは本サイトのオリジンのみ許可する（インラインのテーマ起動スクリプトはハッシュで許可する）。ネットワーク接続は本サイトと `api.github.com` のみ許可する。画像は本サイトと GitHub のアバタードメインのみ許可する。object と外部の base を禁止する。開発モードはこの制約を受けない。

#### Scenario: Policy present in the built page
- **WHEN** 本番ビルドのホームページを読み込む
- **THEN** ページは上記のポリシーを宣言しており、テーマ起動スクリプトは引き続き正常に実行され、検索とアバターの読み込みは影響を受けない

#### Scenario: Injected script is blocked
- **WHEN** ページ内に他のドメインからのスクリプトや許可されていないインラインスクリプトが現れる
- **THEN** ブラウザは実行を拒否する

### Requirement: Token can be removed
設定済みの時、ポップオーバーは SHALL 削除操作を提供する。削除後は SHALL ローカルストレージ内の token をクリアし、クォータ状態を不明にリセットし、以降のリクエストは資格情報を付けない。

#### Scenario: Remove
- **WHEN** ユーザーが削除をクリックする
- **THEN** ヘッダーの入口は未設定状態に戻り、次の検索リクエストに `Authorization` ヘッダーがない

### Requirement: Token input is never echoed
入力ボックスは SHALL パスワード型であり、保存済みの token は MUST NOT UI 上に平文で表示されてはならない。

#### Scenario: Reopen after saving
- **WHEN** ユーザーが token を保存した後にポップオーバーを再度開く
- **THEN** 入力ボックスは空でパスワード型であり、token の内容ではなく「設定済み」状態を表示する
