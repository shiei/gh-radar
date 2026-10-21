# Proposal

## Why

検索はこの製品の中核となる入口であり、優先度が最も高い。`project-foundation` が提供する骨格の上で、GitHub REST Search API をブラウザから直接呼び出して検索すれば、バックエンドなしで使える最小の製品を提供できる。本フェーズでは意図的に token 設定を行わず、最小の範囲で検索フロー、結果表示、クォータ制限時の体験を検証する。

## What Changes

- ホームページに検索ボックスを追加する。独立した検索ボタンは設けない。ユーザーがキーワードを入力して明示的に送信（Enter、または入力ボックス内の送信アイコンをクリック）した後、`GET https://api.github.com/search/repositories` を呼び出して結果を取得する。
- 検索ボックスの内容はそのまま `q` パラメータとして渡すため、ユーザーは GitHub の qualifier 構文（例: `language:rust cli`）を直接使える。
- ソート選択を提供する: best match（デフォルト）、stars、recently updated。API ネイティブの sort パラメータに対応する。
- 結果はリストで表示し、各項目には owner / name、説明、stars、主要言語、最終更新時刻、topics、license を含める。クリックで GitHub のリポジトリページに遷移する。
- ページネーションをサポートし、Search API の上限に従う: 1 ページ最大 100 件、先頭 1000 件まで到達可能。
- すべてのリクエストは未認証呼び出しである。403 / 429（クォータ枯渇）を受信した場合は分かりやすいメッセージを表示し、レスポンスヘッダー `X-RateLimit-Reset` に基づいていつ再試行できるかをユーザーに伝える。
- 読み込み中、結果なし、リクエスト失敗の 3 種類の状態を表示する。
- 新規文言はすべて 3 言語の言語ファイルに入れる。すべてのスタイルは tokens を使う。
- 単体テストはクエリパラメータの構築とレスポンスの解析をカバーする。E2E テストは mock の API レスポンスを使い、GitHub に実際にリクエストしない。
- 本 change の完了後に単独で git commit する。

## Capabilities

### New Capabilities

- `repository-search`: ユーザーが検索を送信し、ソートを選択し、ページ分割された結果を閲覧する振る舞い、および結果項目に表示するフィールド。
- `github-api-access`: ブラウザから GitHub REST API に直接アクセスする方式、認証状態（本フェーズでは未認証）、およびクォータ制限時のユーザー可視の振る舞い。後続の token 設定 change がこの capability を変更する。

### Modified Capabilities

（なし。）

## Impact

- GitHub API クライアントモジュール、検索ページとそのコンポーネント（Atomic Design に沿って階層化）、3 言語の新規文言を追加する。
- 外部依存: GitHub REST API の `search/repositories` エンドポイント。未認証のクォータは search リクエストが毎分 10 回、総リクエストが IP ごとに毎時 60 回。
- バックエンドなし、永続化なし。

## Deferred: requires backend

以下の要件は純粋なフロントエンドアーキテクチャでは実現できないか体験が極めて悪いため、明確に先送りする。一覧はリポジトリルートの `ROADMAP.md` に統合済みであり、以後はそれを正とする。

| 要件                                        | フロントエンドで実現できない理由                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Trending ランキング（直近 7 / 30 日の新規 Stars） | GitHub には trending API がなく、star 増分フィールドもない。サーバー側で定期的に star 数をスナップショットして差分を取る必要がある。 |
| プロジェクト比較ページの成長トレンド曲線                    | 同上。履歴データが必要。                                                               |
| Rising Stars の正確な成長率                   | 同上。純粋なフロントエンドでは `created:>日付` による近似しかできない。                                        |
| AI によるプロジェクト分析                                 | LLM API key をブラウザに露出できないため、サーバー側プロキシが必要。                                   |
| Watchlist のデバイス間同期                        | ユーザー ID とサーバー側ストレージが必要。ローカルのみの localStorage 版にはバックエンドは不要。                   |
| token なしで利用でき、かつ 60 回/時の制限を受けない          | サーバー側プロキシでより高いクォータの token を共有し、キャッシュする必要がある。                                  |

## Not in this change (planned as later frontend-only changes)

- `github-token`: ユーザーが個人 token を設定し、localStorage に保存し、`GET /rate_limit` で検証し、search クォータを毎分 30 回に引き上げる。
- `category-browse`: 6 つのカテゴリ（Frontend、Backend、AI/ML、DevOps、Database、Design）から topic クエリへのマッピングファイルとカテゴリナビゲーションページ。qualifier 構文を知らないユーザーが探索できる主要な入口でもある。
- `repository-detail`: プロジェクト詳細ページ。
- Most Popular と Rising Stars（近似版）ランキング。
- 構造化された技術スタックフィルター（言語、最低 star 数、fork 除外など）。プログラムが qualifier を組み立て、手書き構文を上級機能に後退させる。
- プロジェクト比較（静的な次元）。
- リポジトリへの star 付与は未定: ユーザー token による書き込み操作が必要で、`github-token` の後に単独で評価する（詳細は tasks.md の Workflow follow-up を参照）。
- セッション内の結果キャッシュは未実施: 現状はキャッシュせず、同じパラメータでも再リクエストする。`github-token` change に含めることを推奨する（詳細は tasks.md の Workflow follow-up を参照）。
