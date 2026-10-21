# github-token Specification

## Purpose

ユーザーが本サイトで GitHub の個人 token を設定する方式を定義する：入口、検証、保存、削除、セキュリティ上の制約、およびクォータ状態をユーザーにどう表示するか。

## Requirements

### Requirement: Token entry lives in the header
ヘッダー SHALL 常に表示される token 入口を 1 つ持つ。未設定時は「GitHub に接続」といった文言を表示し、設定済みのときは現在の search クォータの「残量 / 上限」を表示する。入口のクリック SHALL ポップオーバーを開く。

#### Scenario: Not configured
- **WHEN** ユーザーが token を設定していない
- **THEN** ヘッダーの入口に接続の案内が表示され、クォータの数字は表示されない

#### Scenario: Configured
- **WHEN** ユーザーが token を設定済みで、直近のレスポンスのクォータが残量 27、上限 30 である
- **THEN** ヘッダーの入口に 27 / 30 が表示される

### Requirement: Token is validated before it is saved
ポップオーバー SHALL パスワード型の入力欄と保存操作を持つ。保存時 SHALL まず token を検証する。検証に成功した場合のみ本機のストレージに書き込んでポップオーバーを閉じ、検証に失敗した場合 SHALL 無効の案内を表示して保存しない。検証中 SHALL ローディング状態を表示する。

#### Scenario: Save a valid token
- **WHEN** ユーザーが有効な token を貼り付けて保存する
- **THEN** token が保存され、ポップオーバーが閉じ、ヘッダーの入口がクォータ表示に変わる

#### Scenario: Reject an invalid token
- **WHEN** ユーザーが無効な token を貼り付けて保存する
- **THEN** 「token が無効」の案内が表示され、入力欄の内容は保持され、ストレージに token はない

#### Scenario: Blank input
- **WHEN** ユーザーが何も入力せずに保存する
- **THEN** 検証を開始せず、保存もしない

### Requirement: Token lives in memory unless the user opts to remember it
保存した token はデフォルトで SHALL メモリ上にのみ保持し、タブを閉じると消え、MUST NOT いかなる永続ストレージにも書き込まない。ポップオーバー SHALL 「このデバイスで記憶する」チェックボックスを提供し、デフォルトは未チェックとする。チェックした場合のみ token をこのブラウザの localStorage に書き込み、チェックボックスの横 SHALL ページのスクリプトやブラウザ拡張が読み取り得ること、共用 PC ではチェックしないことを説明する。いずれの方式でも、token は MUST NOT `api.github.com` 以外のいかなるアドレスにも送らない。

#### Scenario: Default is memory only
- **WHEN** ユーザーが「このデバイスで記憶する」をチェックせずに token を保存する
- **THEN** このタブ内のリクエストはその token を付け、localStorage に token はなく、ページを再読み込みすると未設定状態に戻る

#### Scenario: Remember on this device
- **WHEN** ユーザーが「このデバイスで記憶する」をチェックして保存する
- **THEN** token が localStorage に書き込まれ、ページを再読み込みしても設定済み状態のままで、ポップオーバーに「このデバイスで記憶済み」と表示される

#### Scenario: Risk note is shown
- **WHEN** ユーザーがポップオーバーを開く
- **THEN** 「デフォルトではメモリ上のみ、送信先は GitHub のみ」という説明と、チェック項目の横にスクリプトや拡張から読み取り得る旨の注意が見える

### Requirement: Guidance asks for a least-privilege token
ポップオーバー SHALL GitHub の fine-grained token 新規作成ページへのリンクを提供し、リンク文言は用途のみを説明する。リンクの下 SHALL 別に注意書きを 1 つ置き、漏洩後のリスクを下げるために推奨する点を説明する：読み取り専用、公開リポジトリのみ、短期の有効期限。

#### Scenario: Link and wording
- **WHEN** ユーザーがポップオーバーを開く
- **THEN** 作成リンクが見え、その下の注意書きに読み取り専用、公開リポジトリのみ、短期の有効期限の 3 点が含まれる

### Requirement: Production page restricts script and connection origins
本番ビルドのページ SHALL Content Security Policy を持つ：スクリプトは本サイトのオリジンのみ許可（インラインのテーマ起動スクリプトはハッシュで許可）、ネットワーク接続は本サイトと `api.github.com` のみ許可、画像は本サイトと GitHub のアバタードメインのみ許可、object と外部 base は禁止。開発モードはこの制約を受けない。

#### Scenario: Policy present in the built page
- **WHEN** 本番ビルドのトップページを読み込む
- **THEN** ページが上記ポリシーを宣言しており、テーマ起動スクリプトは正常に実行され、検索とアバターの読み込みは影響を受けない

#### Scenario: Injected script is blocked
- **WHEN** ページ内に他ドメイン由来のスクリプトや許可されていないインラインスクリプトが現れる
- **THEN** ブラウザが実行を拒否する

### Requirement: Token can be removed
設定済みのとき、ポップオーバー SHALL 削除操作を提供する。削除後 SHALL 本機のストレージから token を消去し、クォータ状態を不明にリセットし、以降のリクエストには資格情報を付けない。

#### Scenario: Remove
- **WHEN** ユーザーが削除をクリックする
- **THEN** ヘッダーの入口が未設定状態に戻り、次の検索リクエストに `Authorization` ヘッダーがない

### Requirement: Token input is never echoed
入力欄 SHALL パスワード型とし、保存済みの token を MUST NOT 平文で UI に表示しない。

#### Scenario: Reopen after saving
- **WHEN** ユーザーが token を保存した後に再びポップオーバーを開く
- **THEN** 入力欄は空でパスワード型であり、token の内容ではなく「設定済み」状態が表示される
