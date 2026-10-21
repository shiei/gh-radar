# Tasks

## 1. アクセス層

- [x] 1.1 `src/lib/github/token.ts` を新規追加する（get / set / clear / subscribe、キー `osr.token`、変更時にクォータ状態をリセット）。単体テストで永続化と購読をカバーする
- [x] 1.2 `buildHeaders()` が token がある場合に `Authorization: Bearer` を追加し、`RateLimit` に `limit` を追加して `X-RateLimit-Limit` を解析し、対応する単体テストを更新する
- [x] 1.3 `validateToken()` を新規追加する: `GET /rate_limit` に候補の token を付け、200 ならクォータを更新して ok を返し、401 なら `invalid_token` を返す。単体テストで 3 種類のレスポンスをカバーする

## 2. キャッシュ

- [x] 2.1 `src/features/search/searchCache.ts` を新規追加する（TTL 5 分、上限 50、キー `query|sort|page`）。単体テストでヒット、期限切れ、追い出しをカバーする
- [x] 2.2 `useRepositorySearch` はキャッシュヒット時に直接 `succeeded` とし、成功後に書き込み、`retry` の前にそのキーを削除する。単体テストで 2 回目の同じパラメータでは fetch を呼ばないことを検証する

## 3. UI

- [x] 3.1 3 つの言語ファイルに `token.*` キーを新規追加する（入口文言、説明、リンク、入力プレースホルダー、保存、削除、無効の通知、検証中）
- [x] 3.2 `TokenMenu` molecule（Base UI Popover、パスワード入力、保存時の検証、エラー、削除、クォータ表示）を実装して `Header` に組み込む。単体テストで有効 / 無効の保存、削除、空入力をカバーする
- [x] 3.3 e2e `e2e/token.spec.ts`: `/rate_limit` を mock し、有効な token を保存した後の検索に Authorization が付く、無効な token は保存しない、リロード後も設定済み、削除後は Authorization なし、同じパラメータの 2 回目の検索はリクエストを発行しない、を確認する

## 4. セキュリティ強化（2026-10-20 追加）

- [x] 4.1 token はデフォルトでメモリにのみ保存し、ポップオーバーに「このデバイスで記憶する」チェックとリスクの注意書きを追加する。単体テストと e2e でデフォルトではディスクに書かない経路と記憶する経路の両方をカバーする
- [x] 4.2 Vite ビルドで CSP meta を注入する（スクリプトは self + インラインハッシュ、接続は api.github.com のみ）。e2e で本番ページにポリシーが付き、テーマスクリプトが引き続き実行されることを検証する
- [x] 4.3 文言を、読み取り専用、公開リポジトリのみ、短期の有効期限を持つ fine-grained token を求めるものに変更する

## 5. 仕上げ

- [x] 5.1 `npm run check` と `npm run test:e2e` がすべて通る。README に token の説明を補足する。ROADMAP の A にチェックを入れる
