# app-resilience Specification

## Purpose

描画時の予期しないエラーで画面が真っ白になるのを防ぎ、実行時エラーを 1 か所に集約して将来の外部送信先（Sentry など）を差し込めるようにする。

## Requirements

### Requirement: Render errors show a recovery screen
アプリ全体 SHALL React の error boundary で包み、描画中に捕捉されない例外が起きたとき SHALL 空白ページの代わりに短い案内（見出し、説明、再読み込みボタン）を 3 言語で表示する。案内 SHALL `role="alert"` を持つ。再読み込みボタン SHALL ページを再読み込みする。

#### Scenario: A component throws while rendering
- **WHEN** いずれかのコンポーネントが描画中に例外を投げる
- **THEN** 「問題が発生しました」の案内と再読み込みボタンが表示され、ボタンを押すとページが再読み込みされる

### Requirement: Errors are reported through one seam
描画エラー、`window` の `error` イベント、未処理の Promise rejection SHALL すべて `src/lib/report.ts` の `reportError` を経由する。`reportError` MUST NOT 例外を投げない。現時点の送信先はコンソールであり、外部サービスへの送信を追加する場合 SHALL この関数のみを変更する。

#### Scenario: Unhandled rejection
- **WHEN** イベントハンドラ内の非同期処理が reject され、どこにも catch されない
- **THEN** `reportError` が `source: 'promise'` で呼ばれ、画面はそのまま動作を続ける
