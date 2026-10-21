# Proposal

## Why

プロジェクトには現在、要件メモ 1 件とレイアウト草案 3 枚しかなく、コードは一切ない。今後の検索、分類、ランキングなどの機能はすべて、同一のビジュアル規約（Design Tokens 駆動のライト / ダークテーマ）、同一の多言語機構、同一のテスト・コード品質ツールに依存する。まずこの基盤層を単独で実装し検証しておくことで、以降の各業務 change を小さくレビュー可能な単位に保てる。

## What Changes

- React + Vite + TypeScript のシングルページアプリケーション骨格を新規作成する。純粋なフロントエンドで、バックエンドは持たない。
- Tailwind CSS を導入し、Design Tokens（CSS 変数）をビジュアル規約の唯一のソースとして、スタイルとコンポーネントから利用する。
- ライト / ダークの 2 種類の外観を実装する。ユーザーが手動で切り替えでき、選択はブラウザのローカルに永続化する。
- 多言語機構を実装する。英語、日本語、中国語をサポートし、デフォルトは英語とする。すべての UI 文言は言語ファイルに集約し、ユーザーはいつでも切り替えられる。
- Base UI をスタイルなしコンポーネントライブラリとして導入し、Atomic Design（atoms / molecules / organisms / templates / pages）に沿って UI コンポーネントディレクトリを構成する。
- Vitest による単体テストと Playwright による E2E テストを設定し、それぞれ最小のサンプルケースを 1 つ添えてパイプラインが動作することを検証する。
- ESLint、Prettier、Stylelint および TypeScript 型チェックを設定し、統一された npm scripts を提供する。
- アイコンは SVG コンポーネントに統一する。
- アプリケーションシェル（ヘッダー、テーマ切替、言語切替）のみを含むホームページを提供する。業務機能は一切含まない。
- 本 change の完了後に単独で git commit する。

## Capabilities

### New Capabilities

- `ui-theme`: ライト / ダーク外観の定義、切替、永続化。Design Tokens はその実装基盤であるが、spec はユーザーが観察可能な振る舞いのみを記述する。
- `localization`: UI 言語の利用可能な集合、デフォルト言語、切替の振る舞い、文言のソース。

### Modified Capabilities

（なし。プロジェクトには既存の spec がない。）

## Impact

- フロントエンド工程全体を新規追加する: `package.json`、Vite 設定、Tailwind 設定、tokens ファイル、i18n 言語ファイル、コンポーネントディレクトリ、テストディレクトリ、lint とフォーマット設定。
- npm scripts を新規追加する: dev、build、test、test:e2e、lint、format、typecheck。
- 外部サービス依存なし、API 呼び出しなし。
- 以降の change に対する制約を定める: すべての色、間隔、フォントサイズは tokens から取得しなければならない。すべてのユーザー可視文言は言語ファイルから取得しなければならない。新規コンポーネントは Atomic Design のいずれかの層に配置しなければならない。
