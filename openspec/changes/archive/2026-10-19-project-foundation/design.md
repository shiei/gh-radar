# Design

## Context

グリーンフィールドプロジェクトであり、実装前のディレクトリには OpenSpec の計画ファイルと要件メモしかなく、コードは一切ない。動機は proposal.md の Why を参照。ローカルのツールチェーン: Node 24、npm 11、macOS 12。pnpm はインストールされていない。

実装時に実際にロックしたバージョン（計画時との差異は注記済み）:

| 依存 | バージョン | 備考 |
|------|------|------|
| vite / @vitejs/plugin-react | 8.3.4 / 6.1.2 | 計画どおり |
| react / react-dom | 19.3.1 | |
| typescript | 6.0.3 | create-vite 9.2 テンプレートのデフォルトが TS 6 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | |
| @base-ui-components/react | 1.0.0-rc.0 | `latest` タグ、正確にロック |
| i18next / react-i18next | 26.5.2 / 17.1.0 | |
| vitest / jsdom | 5.0.5 / 30.1.3 | |
| @playwright/test | **1.56.1** | 計画では 1.64 だったが、1.64 は macOS 12 への Chromium インストールを拒否する。1.56.1 はローカルでインストールと実行が可能な最新バージョン |
| eslint / typescript-eslint | 10.13.0 / 8.71.2 | create-vite 9 テンプレートのデフォルトは oxlint。削除し、D9 に従って ESLint に変更 |
| stylelint / stylelint-config-standard | 17.16.0 / 40.0.0 | |
| prettier / prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 | |

振る舞いの契約は `specs/ui-theme/spec.md` と `specs/localization/spec.md` を参照。本書では繰り返さない。

## Goals / Non-Goals

**Goals:**

- ビジュアル規約（tokens）を一箇所で定義する。コンポーネントは意味付けされた token のみを利用し、生の色値には触れない。
- テーマと言語の「選択、永続化、初期化」ロジックを UI コンポーネントから分離し、以降の change でそのまま再利用できるようにする。
- すべての品質ゲート（typecheck、lint、format、unit、e2e）を 1 つのコマンドで実行でき、スキャフォールド段階ですべてグリーンである。
- ディレクトリ構成を初日に確定し、以降の change でファイルを移動する必要がないようにする。

**Non-Goals:**

- ルーティングは行わない。ホームページが唯一のページであり、ルーティングは 2 つ目のページが必要になる change で導入する。
- レスポンシブなブレークポイント以外のモバイル対応の詳細は行わない。
- 状態管理ライブラリは導入しない。
- CI は設定しない。本 change はローカルコマンドが動作することのみを保証する。

## Decisions

### D1. パッケージマネージャーは npm を使う

ローカルには npm しかない。`package-lock.json` をコミットする。環境の前提条件を増やさないため pnpm は導入しない。

### D2. ディレクトリ構成

```
src/
  app/            アプリのエントリと Provider の組み合わせ (App.tsx, providers.tsx)
  components/
    atoms/        最小の UI 単位: Button, Icon(SVG), Text ...
    molecules/    atoms の組み合わせ: ThemeToggle, LanguageSwitcher
    organisms/    ページ区画: Header
    templates/    ページレイアウトの骨格: AppShell
  pages/          HomePage
  lib/
    theme/        テーマの読み取り/書き込み/初期化ロジック + useTheme
    i18n/         i18next の初期化 + 言語の永続化
  locales/        en.json ja.json zh.json
  styles/         tokens.css, globals.css
  test/           Vitest setup
e2e/              Playwright テスト
```

Atomic Design が管理するのは `components/` と `pages/` のみとする。UI 以外のロジックは `lib/` に置き、hook をコンポーネント層に押し込むことを避ける。代替案は feature ベースのディレクトリ（`features/theme/` にロジックとコンポーネントを同居させる）だが、要件が Atomic Design の階層化を明確に求めており、2 方式が併存するとコンポーネントの置き場所が分からなくなるため採用しなかった。

### D3. Tailwind v4 + CSS 変数 tokens。`dark:` バリアントは使わない

- `src/styles/tokens.css` では `:root` でライトの token を定義し、`[data-theme="dark"]` でダークの token を上書きする。token 名は意味ベース（`--color-surface`、`--color-text`、`--color-border`、`--color-accent` など）であり、色名ではない。
- Tailwind v4 の `@theme inline` でこれらの変数をユーティリティクラス（`bg-surface`、`text-text`）にマッピングし、コンポーネントはこれらの意味クラスのみを使う。
- 間隔、角丸、フォントサイズも同様に `@theme` 内で token として宣言する。
- 統合方式は公式の `@tailwindcss/vite` プラグインを使い、PostCSS は経由しない。

代替案は Tailwind の `dark:` クラスバリアントで、各コンポーネントで色を 2 回書く方式である。採用しなかった理由: 色がコンポーネント内に散在し、「tokens がビジュアル規約の唯一のソースである」ことと矛盾する上、将来の 3 つ目のテーマにも対応できない。

### D4. テーマ状態: `<html data-theme>` + localStorage + 初回描画前のインラインスクリプト

- アクティブなテーマは `<html>` の `data-theme` 属性で表し、値は `light` または `dark` とする。CSS はこの属性のみに依存する。
- 永続化キーは `osr.theme`、値は上記と同じ。未保存の場合は `prefers-color-scheme` で決定し、判定できない場合は `light` とする。
- `index.html` の `<head>` に、いかなるモジュールにも依存しないインラインスクリプトを置き、初回描画前に上記の解決を完了して属性を設定することで、「フラッシュしない」要件を満たす。
- React 側では `lib/theme` が `ThemeProvider` と `useTheme()` を提供し、切替時に属性と localStorage を同時に更新する。インラインスクリプトと React 側は同一の解決規則を共有し、規則は純関数として抽出し単体テストを持つ。インラインスクリプトは import できないため極めて短く保ち、e2e でカバーする。

代替案は React のマウント後にのみテーマを設定する方式だが、リロード時に必ず 1 フレーム誤ったテーマが表示されるため採用しなかった。

### D5. i18n は i18next + react-i18next を使い、リソースは静的にバンドルする

- 3 つの JSON を `src/locales/` に置き、ビルド時に静的 import する。http backend は使わない。
- 言語検出プラグインは入れない。初期言語: localStorage キー `osr.lang` に値があればそれを使い、なければ `en`。これは要件が明確に求める「デフォルト英語」であり、見落としではない。
- 言語切替時に `document.documentElement.lang` を同期する。
- i18next の TypeScript モジュール拡張を使い、`en.json` をキーの型ソースとする。コンポーネント内でキー名を誤ると typecheck 段階でエラーになる。
- キー集合の一貫性は 1 つの Vitest ケースで保証する: 3 つの JSON を読み込み、フラット化後のキー集合が完全に一致することをアサートする。これが spec にある「翻訳の欠落を自動検出できる」の実装である。

代替案は Context + オブジェクト参照の手書き実装である。採用しなかった理由: 今後の検索結果ページでは補間と複数形が必要になり、その時点で移行するとコストがより高くなる。

### D6. Base UI をスタイルなしコンポーネントの基盤とする

- パッケージ名は `@base-ui-components/react`。実装当日に `latest` が解決される正確なバージョンにロックする。
- ThemeToggle は Base UI の Switch または Toggle をベースにし、LanguageSwitcher は Base UI の Select をベースにする。
- すべての Base UI コンポーネントは自前の atom または molecule でラップし、ページと organism は Base UI を直接 import しない。これにより rc バージョンの API 変更の影響が数ファイルに限定される。

### D7. アイコン: 手書きの SVG React コンポーネント

`components/atoms/icons/` 配下にアイコンごとに 1 コンポーネントを置き、`currentColor` を使用し、デフォルトで `aria-hidden="true"` とする。props でサイズとアクセシブルなラベルを指定できる。アイコンライブラリは導入しない。要件が明確にまず SVG を使うとしている。

### D8. テスト

- 単体: Vitest + jsdom + Testing Library（react、jest-dom、user-event）。`src/test/setup.ts` で jest-dom のマッチャーを登録する。
- E2E: Playwright。Chromium のみインストールする。バージョンは 1.56.1 にロックする（Context の表を参照、macOS 12 の制約）。マシンの OS をアップグレードした後は最新版に追従できる。`playwright.config.ts` の `webServer` はまず `vite build` し、その後 `vite preview` する。テストは本番ビルドに対して行い、実際の振る舞いに近づける。
- 2 種類のテストはそれぞれ少なくとも 1 つの実際のケース（テーマの永続化、言語切替）を持ち、空の殻ではない。

### D9. コード品質ツール

- ESLint 10 flat config: `@eslint/js`、`typescript-eslint`（type-checked ルールセット）、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`、`eslint-config-prettier` でフォーマット系ルールを無効化する。
- Prettier + `prettier-plugin-tailwindcss` で class をソートする。
- Stylelint 17 + `stylelint-config-standard`。`at-rule-no-unknown` では Tailwind v4 の `@theme`、`@utility`、`@variant`、`@custom-variant`、`@apply`、`@source`、`@plugin` を無視する。
- Typecheck は `tsc -b --noEmit` を使い、TS は `strict` と `noUncheckedIndexedAccess` を有効にする。
- npm scripts: `dev`、`build`、`preview`、`typecheck`、`lint`（eslint + stylelint）、`format`、`format:check`、`test`、`test:e2e`、`check`（typecheck + lint + format:check + test）。

### D10. アプリケーションシェル

`AppShell` テンプレート = `Header` organism + コンテンツ領域。`Header` にはブランド名（言語ファイルの `app.name` キーから取得）、`ThemeToggle`、`LanguageSwitcher` を含む。`HomePage` には言語ファイルから取得したウェルカム文言を 1 段落置くだけとする。

## Risks / Trade-offs

- [Base UI はまだ rc であり、API が変わる可能性がある] → 正確なバージョンにロックする。すべての利用箇所を atom/molecule 層に集約し、アップグレード時はそれら数ファイルのみを変更する。
- [Vite 8 はリリース直後であり、一部プラグインが非互換の可能性がある] → 実装で検証済み: `@vitejs/plugin-react` 6.1 と `@tailwindcss/vite` 4.3 は Vite 8.3 下でビルド、テストともに正常であり、Vite 7 には戻していない。
- [npm audit が 7 件の high を報告する] → すべて Stylelint の依存チェーン内の `braces` / `micromatch` の正規表現スタック枯渇問題に由来し、ローカルの開発ツールにのみ影響する。Stylelint をダウングレードせずに修正する手段がないため、当面は対処しない。
- [Stylelint が Tailwind v4 の at-rules を認識しない] → D9 の ignoreAtRules リストで対応する。それでもエラーが出る場合はルールを無効化するのではなく設定の調整を優先する。
- [インラインのテーマスクリプトはモジュールシステムを経由しないため、React 側のロジックと乖離しやすい] → 解決規則を極めてシンプル（3 行の判定）にし、両者で共有するキー名と値を 1 つの定数ファイルに書く。e2e で「リロード時にフラッシュしない」をカバーする。
- [Playwright の初回インストールではブラウザのダウンロードが遅い] → Chromium のみインストールする。`test:e2e` は `check` スクリプトに含めず、単独で実行する。
- [i18next の型拡張はキーが多くなると tsc を遅くする] → 現在はキーが少ないため当面は対処しない。将来遅くなった場合は名前空間ごとに分割する。

## Open Questions

- 製品名は "GitHub Discovery" と "OpenSource Radar" の間でまだ決まっていない。本 change では "OpenSource Radar" を `app.name` のプレースホルダー値として使う。改名は 3 つの言語ファイルの各 1 行を変更するだけで済み、いかなる spec やタスクにも影響しない。
