# analytics-consent Specification

## Purpose

訪問数を Google Analytics 4 で計測しつつ、訪問者が明示的に許可するまで Google に一切接続しないことを保証する。許可と拒否は同じ手間で選べ、いつでも撤回できる。

## Requirements

### Requirement: Analytics loads only after explicit consent
初回訪問時、ページ下部に Cookie の使用を知らせるバナー SHALL 表示し、「許可する」と「許可しない」のボタンを同じ大きさ・同じ手間で並べる。バナー SHALL 一行の本文と、展開すると用途（訪問数の集計のみ、広告には使わないこと、許可するまで何も読み込まれないこと、フッターから変更できること）を説明する詳細を持つ。第三者（Google Analytics）の名前と収集する項目は README の Privacy 節に記載し、バナーには載せない。gtag.js の注入 SHALL 訪問者が「許可する」を選んだ後にのみ行い、それまで MUST NOT Google のいかなるホストにも接続しない。

#### Scenario: First visit
- **WHEN** 決定が保存されていない状態でページを開く
- **THEN** バナーが表示され、`googletagmanager.com` へのリクエストは発生しない

#### Scenario: Accept
- **WHEN** 「許可する」を押す
- **THEN** バナーが消え、`https://www.googletagmanager.com/gtag/js?id=<測定 ID>` が読み込まれる

#### Scenario: Decline
- **WHEN** 「許可しない」を押す
- **THEN** バナーが消え、Google へのリクエストは発生しない

### Requirement: The decision is remembered and can be withdrawn
決定 SHALL `localStorage['osr.consent']` に `granted` または `denied` として保存し、以後の訪問ではバナーを表示せず保存した決定に従う。フッター SHALL 「Cookie の設定」リンクを持ち、押すと決定を消してバナーを再表示する。許可済みの状態から撤回したとき SHALL GA の opt-out フラグ（`ga-disable-<測定 ID>`）を立て、`_ga` および `_ga_*` Cookie を失効させる。読み込み済みのスクリプト自体は次のページ読み込みまで残ってよいが、送信は停止する。

#### Scenario: Reload after accepting
- **WHEN** 許可した後にページを再読み込みする
- **THEN** バナーは表示されず、gtag.js は直ちに読み込まれる

#### Scenario: Reload after declining
- **WHEN** 拒否した後にページを再読み込みする
- **THEN** バナーは表示されず、Google へのリクエストは発生しない

#### Scenario: Withdraw from the footer
- **WHEN** 「Cookie の設定」を押す
- **THEN** 保存した決定が消え、バナーが再表示される

### Requirement: Collection is minimal and off outside production
GA の設定 SHALL 広告機能（`allow_google_signals`、`allow_ad_personalization_signals`）を無効にし、IP 匿名化を有効にする。タグの読み込み SHALL 本番ビルドでのみ行い、開発サーバーと単体テストからは実プロパティへ MUST NOT 送信しない。e2e テストは Google のホストへのリクエストをすべて abort し、同意を事前に `denied` としておく。本番ビルドの Content Security Policy SHALL `*.googletagmanager.com` からのスクリプト、`*.google-analytics.com` / `*.analytics.google.com` / `*.googletagmanager.com` への接続と画像を許可する。

#### Scenario: Development server
- **WHEN** `npm run dev` で起動したページで「許可する」を押す
- **THEN** gtag.js は読み込まれない

### Requirement: Storage failures do not break the page
`localStorage` が使えない環境（プライベートモード、ブロック）でも SHALL バナーと決定はメモリ上で機能し、ページの他の部分に影響しない。保存されている値が `granted` / `denied` 以外のときは未回答として扱う。

#### Scenario: Storage throws
- **WHEN** `localStorage` へのアクセスが例外を投げる
- **THEN** バナーは表示され、「許可しない」を押すとそのタブ内では消える
