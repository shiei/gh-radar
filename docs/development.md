# 開発ガイド

ローカルで実行したり、コードを変更したい人向けの文書である。使い方は [README](../README.md)、デプロイは [deploy.md](deploy.md)、スナップショットスクリプトは [scripts/README.md](../scripts/README.md) を参照。

## 技術スタック

- React 19 + Vite 8 + TypeScript 6
- Tailwind CSS 4。ビジュアル仕様は `src/styles/tokens.css` の Design Tokens で一元的に定義する
- Base UI をスタイルなしコンポーネントの基盤とし、Atomic Design に沿って階層化する
- i18next：英語（既定）、日本語、中国語
- Vitest + Testing Library で単体テスト、Playwright で E2E テストを行う
- ESLint、Prettier、Stylelint、`tsc` で静的検査を行う

## クイックスタート

```bash
npm install
npx playwright install chromium   # 初回、または Playwright を更新した後のみ必要
npm run dev
```

## npm scripts

| コマンド               | 役割                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | 開発サーバーを起動する                                              |
| `npm run build`        | 型検査を行い `dist/` にビルドする                                   |
| `npm run preview`      | ビルド成果物をローカルでプレビューする                              |
| `npm run typecheck`    | `tsc -b --noEmit`                                                   |
| `npm run lint`         | `lint:js`（ESLint）と `lint:css`（Stylelint）を順に実行する         |
| `npm run format`       | Prettier で全ファイルを整形する                                     |
| `npm run format:check` | 検査のみ行い、変更しない                                            |
| `npm run test`         | Vitest 単体テスト（単発実行）                                       |
| `npm run test:e2e`     | Playwright E2E テスト。先にビルドしてから `vite preview` で起動する |
| `npm run check`        | typecheck + lint + format:check + test。コミット前にこれを実行する  |

`check` には e2e を含まないので、e2e は個別に実行する。

## ディレクトリ構成

```
src/
  app/            アプリのエントリと Provider の組み合わせ
  components/
    atoms/        最小の UI 単位（Button、Text、icons/）
    molecules/    atoms の組み合わせ（ThemeToggle、LanguageSwitcher）
    organisms/    ページ区画（Header）
    templates/    ページレイアウトの骨格（AppShell）
  pages/          ページ（HomePage）
  features/
    search/       検索の状態機械：searchReducer（純関数）と useRepositorySearch（hook）
  lib/
    categories.ts 6 つのカテゴリとクエリ（サイトとスナップショットスクリプトで共用）
    github/       GitHub REST アクセス層：リクエストヘッダー、エラー分類、クォータ解析、search エンドポイント（React に依存しない）
    format/       Intl のラッパー：コンパクト数値、相対時間、時刻
    theme/        テーマの解決、永続化、ThemeProvider / useTheme
    i18n/         i18next の初期化、言語の永続化、キー型の拡張
    cx.ts         class 名の連結
  locales/        en.json / ja.json / zh.json
  styles/         tokens.css（Design Tokens）、globals.css（Tailwind へのマッピングと基本スタイル）
  test/           Vitest setup
scripts/          日次スナップショットスクリプト（scripts/README.md を参照）
data/             watchlist.txt 手動のウォッチリスト
public/data/      スナップショットデータセット（Actions がコミットする）
e2e/              Playwright テスト
  fixtures/       mock した GitHub レスポンス
  helpers/        共有 test（GitHub リクエストのフォールバック遮断を含む）と mock ユーティリティ
openspec/         計画ファイル（proposal / specs / design / tasks）
```

階層化の規約：`components/` には UI のみを置く（Atomic Design）。React に依存しないコードは `lib/` に置く。ある機能の React 状態ロジックは `features/<name>/` に置く。

## トップページのカテゴリとランキング

左カラムの 6 つのカテゴリは `src/lib/categories.ts` に由来し、クリックするとそのカテゴリのクエリを送信する。右カラムの 2 つのランキングは `public/data/` を読み取る。Most Popular はスナップショットの star 数順、Rising Stars は直近 30 日の star 増加数順である（系列が 7 日に満たない場合は、直近 90 日に作成されたリポジトリを star 数順に並べる表示に切り替え、「履歴を蓄積中」と注記する）。ランキングは選択中のカテゴリで絞り込まれ、API クォータを消費しない。スナップショットが存在しない、または 3 日以上更新されていない場合は通知を表示する。

## 検索タイプとフィルター

検索ボックスの上で検索対象を切り替えられる。Repositories（既定）、Users、Topics はそれぞれ `/search/repositories`、`/search/users`、`/search/topics` を呼び出し、それぞれ専用の結果カードを持つ。並び替えはリポジトリにのみ有効である。token が設定されている場合、検索ごとに他の 2 タイプへも `per_page=1` のリクエストを 1 回ずつ追加で送り、一致件数を切り替えボタンに表示する（`src/features/search/useTypeCounts.ts`）。未設定の場合は送信せず、ボタンにはタイプ名のみ表示する。

リポジトリ検索のフィルター（言語、最低 star 数、fork の除外、アーカイブの除外）は `composeQuery()` によって `language:` / `stars:>=` / `fork:false` / `archived:false` に変換され、リクエストの q の末尾に追加される。入力ボックスの内容は変わらない。いずれかの項目を変更すると 1 ページ目から再検索する。広い画面ではフィルターは左カラムのカテゴリの下に、狭い画面では検索ボックスの下に折りたたまれて表示される。結果カード上の言語テキストと topic タグはどちらもクリック可能で、前者は言語フィルターを設定し、後者は `topic:<name>` でリポジトリを再検索する。言語の一覧は `src/lib/languages.ts` にある。

## 日次スナップショットデータセット

`scripts/snapshot.ts` は GitHub Actions 経由で毎日、6 つのカテゴリの人気と新星のリポジトリ、および `data/watchlist.txt` のリポジトリを取得し、`public/data/` に書き込む（`latest.json`、`daily/` は 30 日分保持、`series/` は 1 年間を日単位、それ以降は週単位、`meta.json`）。これらの JSON はサイトと一緒に公開され、ランキングとトレンドのデータソースとなり、訪問者の API クォータを消費しない。ファイル形式、保持ポリシー、ローカルでの実行方法は `scripts/README.md` を参照。

## GitHub API とクォータ

検索はブラウザから直接 `https://api.github.com/search/{repositories,users,topics}` を呼び出す。未認証のクォータは search リクエストが毎分 10 回、送信元 IP ごとに毎時 60 リクエストである。クォータを使い切ると、画面に回復時刻を表示する。

ヘッダーの「GitHub と接続」から個人 token を設定できる。保存前に `GET /rate_limit` で検証し（クォータは消費しない）、設定後は search クォータが毎分 30 回に上がり、ヘッダーに残り回数を表示する。token は `api.github.com` にのみ送信される。既定ではメモリ上にのみ保持され、タブを閉じると消える。「この端末で記憶する」にチェックを入れた場合のみ `localStorage['osr.token']` に書き込む。読み取り専用、公開リポジトリのみ、短い有効期限の fine-grained token を作成すること。

本番ビルドでは `index.html` に Content Security Policy を注入する（スクリプトは自サイトのみ、接続は `api.github.com` のみ。`vite.config.ts` の `cspPlugin` が生成する）。デプロイ時には HTTP レスポンスヘッダーに移すことを推奨する。

同じタイプ、クエリ（フィルター条件を含む）、並び替え、ページ番号はセッション内で 5 分間キャッシュされ、ヒットした場合はリクエストを送らない。ページを再読み込みすると無効になる。

### e2e の mock 規約

すべての Playwright テストケースは `e2e/helpers/test.ts` から `test` をインポートする。これは各ページに、`api.github.com` へのすべてのリクエストを abort するフォールバック route を自動で設定するため、どのテストケースも実際の API に到達しない。レスポンスが必要な場合は `e2e/helpers/mockGitHub.ts` の `mockSearch` / `mockSearchByPage` / `mockSearchTypes` を使い、`e2e/fixtures/` 内の JSON を返す。テストケースが自分で登録した route はフォールバックより優先される。

`e2e/fixtures/search-react.json` は実際のレスポンスに由来し、画面で使うフィールドのみを残している。

## 規約

### 画面テキストの追加

1. `src/locales/en.json`、`ja.json`、`zh.json` の 3 ファイルすべてに同じキーを追加する。
2. コンポーネントでは `useTranslation()` の `t('your.key')` で参照する。キー名の型は `en.json` から導出されるため、誤ったキーは `typecheck` の段階でエラーになる。
3. `src/locales/locales.test.ts` が 3 ファイルのキー集合が完全に一致することを検証するため、1 つでも欠けると失敗する。
4. コンポーネント内にハードコードされたユーザー向けテキストを置くことは許可しない。

### Design Token の追加

1. `src/styles/tokens.css` の `:root` にライトモードの値を、`[data-theme='dark']` にダークモードの値を追加する。
2. `src/styles/globals.css` の `@theme inline` で Tailwind ユーティリティクラスにマッピングする。たとえば `--color-foo: var(--foo)` は `bg-foo` / `text-foo` を生成する。
3. コンポーネントはセマンティックなクラス（`bg-surface`、`text-text-muted`、`border-border` など）のみを使い、生の色は書かない。

### テーマと言語の永続化キー

| キー                        | 値                 |
| --------------------------- | ------------------ |
| `localStorage['osr.theme']` | `light` / `dark`   |
| `localStorage['osr.lang']`  | `en` / `ja` / `zh` |

テーマは `index.html` のインラインスクリプトで初回描画前に適用される。`src/lib/theme/constants.ts` を変更する際は、このスクリプトも同期して更新する必要がある。
