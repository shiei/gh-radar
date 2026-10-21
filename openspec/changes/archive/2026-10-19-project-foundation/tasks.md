# Tasks

## 1. 工程骨格

- [x] 1.1 `npm create vite@latest` の react-ts テンプレートでリポジトリルートにプロジェクトを生成し、tsconfig を `strict` + `noUncheckedIndexedAccess` に強化し、`npm run build` が成功することを検証する
- [x] 1.2 design.md D2 に従って `src/app`、`src/components/{atoms,molecules,organisms,templates}`、`src/pages`、`src/lib/{theme,i18n}`、`src/locales`、`src/styles`、`src/test`、`e2e` ディレクトリを作成し（空ディレクトリには `.gitkeep` を置く）、`tree src e2e` が設計と一致することを検証する
- [x] 1.3 `.gitignore` を拡張し（node_modules、dist、coverage、playwright-report、test-results、.env*）、既存のエントリは保持したまま、`git status` にビルド成果物が現れないことを検証する
- [x] 1.4 テンプレート付属のサンプルコンポーネント、スタイル、リソースを削除し、空の `App` を描画する `main.tsx` だけを残し、`npm run dev` 起動後にページにエラーが出ないことを検証する

## 2. コード品質ツール

- [x] 2.1 ESLint 10 flat config（design.md D9 に列挙したプラグイン）をインストール・設定し、`lint:js` スクリプトを追加し、現在のコードに対して実行してエラーがないことを検証する
- [x] 2.2 Prettier と `prettier-plugin-tailwindcss` をインストールし、`.prettierrc` と `format` / `format:check` スクリプトを追加し、`format:check` が通ることを検証する
- [x] 2.3 Stylelint 17 と `stylelint-config-standard` をインストールし、Tailwind v4 の at-rules 無視リストを設定し、`lint:css` スクリプトを追加し、`src/styles` に対して実行してエラーがないことを検証する
- [x] 2.4 `typecheck`（`tsc -b --noEmit`）、`lint`（js + css）、`check`（typecheck + lint + format:check + test）スクリプトを追加し、現状で `npm run check` が通ることを検証する（test 段階は一時的にケースがなくてもよい）

## 3. Tailwind と Design Tokens

- [x] 3.1 `tailwindcss` と `@tailwindcss/vite` をインストールし、`vite.config.ts` にプラグインを登録し、Tailwind を読み込む `src/styles/globals.css` を作成し、ビルド成果物に Tailwind の基本スタイルが含まれることを検証する
- [x] 3.2 `src/styles/tokens.css` を作成する: `:root` でライトの意味 token（surface、surface-muted、text、text-muted、border、accent、accent-text など）を定義し、`[data-theme="dark"]` でダークの値を上書きし、`npm run lint:css` が通ることを検証する
- [x] 3.3 `globals.css` で `@theme inline` を使って token を Tailwind ユーティリティクラスにマッピングし、間隔、角丸、フォントサイズの token も `@theme` 内で宣言し、`bg-surface text-text` などのクラスがビルド成果物に生成されることを検証する
- [x] 3.4 `src/components/atoms/` に意味クラスを使う `Text` atom と `Button` atom を書き、Vitest + Testing Library でそれらが描画され、期待する class を持つことを検証する

## 4. テーマ（specs/ui-theme に対応）

- [x] 4.1 `src/lib/theme/constants.ts`（ストレージキー `osr.theme`、値 `light` / `dark`、属性名）と純関数 `resolveInitialTheme(stored, prefersDark)` を作成し、Vitest で「保存済みを優先 / 未保存ならシステムに従う / システム不明なら light をデフォルト」の 3 ケースをカバーする
- [x] 4.2 `index.html` の `<head>` にインラインスクリプトを追加し、初回描画前に同じ規則で `<html data-theme>` を設定し、ビルド後の HTML にそのスクリプトが含まれ、スタイルシートより前に位置することを検証する
- [x] 4.3 `ThemeProvider` と `useTheme()`（現在値の読み取り、`toggle()`、`setTheme()`、属性と localStorage への書き込み）を実装し、Vitest で切替後に属性と localStorage が同期して更新されることを検証する
- [x] 4.4 `@base-ui-components/react` をインストールし（正確なバージョンにロックし、design.md の Context に記録する）、`SunIcon` / `MoonIcon` SVG atoms を作成し、`ThemeToggle` molecule（アクセシブルな名前を持ち、キーボードの Enter / Space をサポート）を実装し、Vitest でクリックとキーボード操作の双方でテーマが切り替わることを検証する
- [x] 4.5 Playwright ケース `e2e/theme.spec.ts` を書く: 初回アクセスはシステム設定に従う（`emulateMedia` を使用）、dark に切り替えた後リロードしても dark のまま、リロード時の `domcontentloaded` 時点で `data-theme` がすでに正しい、を確認し、`npm run test:e2e` が通ることを検証する（本タスクで Playwright のインストールと `playwright.config.ts` も同時に完了させる。webServer は build + preview を使う）

## 5. 多言語（specs/localization に対応）

- [x] 5.1 `src/locales/en.json`、`ja.json`、`zh.json` を作成し、初期キーとして `app.name`、`app.tagline`、`theme.toggle.*`、`language.label`、`language.names.*`、`home.welcome` を含め、3 ファイルのフラット化後のキー集合が完全に一致することをアサートする Vitest ケースを書く
- [x] 5.2 `i18next` と `react-i18next` をインストールし、`src/lib/i18n/index.ts` を作成し（3 つのリソースを静的に読み込む、検出プラグインなし、初期言語 = localStorage `osr.lang` または `en`、切替時に localStorage に書き戻し `document.documentElement.lang` を更新）、Vitest でデフォルト en、永続化値の読み取り、切替後の `lang` 属性更新を検証する
- [x] 5.3 i18next の型拡張を追加し、`en.json` をキーの型ソースとし、コンポーネント内で存在しないキーを参照した際に `npm run typecheck` がエラーになることを検証する（検証後にその誤った参照は削除する）
- [x] 5.4 `LanguageSwitcher` molecule（Base UI Select ベース、選択肢は各言語のネイティブ名 English / 日本語 / 中文 を表示、アクセシブルな名前を持ち、キーボード操作をサポート）を実装し、Vitest で選択後に UI 文言が変わることを検証する
- [x] 5.5 Playwright ケース `e2e/language.spec.ts` を書く: 初回アクセスは英語（ブラウザ locale を ja に設定しても英語のまま）、中国語に切り替えた後ヘッダー文言が中国語で `<html lang>` が zh、リロード後も中国語のまま、を確認して通ることを検証する

## 6. アプリケーションシェル

- [x] 6.1 `Header` organism（ブランド名は `app.name` から取得、`ThemeToggle`、`LanguageSwitcher`）と `AppShell` template を実装し、Vitest で Header が 3 つの部分を描画することを検証する
- [x] 6.2 `HomePage`（`app.tagline` と `home.welcome` のみ表示）を実装し、`src/app/App.tsx` で `ThemeProvider` + i18n + `AppShell` + `HomePage` を組み合わせ、`npm run dev` で開いた後にヘッダーとホームページの文言が正しく表示されることを検証する
- [x] 6.3 `e2e/smoke.spec.ts` にスモークケースを書く: ページ読み込み、ヘッダーの 3 要素が可視、console error なし、を確認して通ることを検証する

## 7. 統合検証とドキュメント

- [x] 7.1 `npm run check` と `npm run test:e2e` を実行し、すべて通ることを確認する。実装過程でバージョンが design.md の Context と一致しない場合は、design.md を更新して実際のバージョンを記録する
- [x] 7.2 `README.md` を書く: プロジェクト概要、ディレクトリ構成の説明、すべての npm scripts の用途、文言追加と token 追加の規約を記載し、README に列挙した各コマンドがそのまま実行できることを検証する

## Workflow follow-up

- すべてのタスク完了後に git commit を 1 回実行する（本 change の規約は change ごとに単独でコミットすること）。
- プロジェクトのレビュー要件を満たした後に本 change をアーカイブする。
