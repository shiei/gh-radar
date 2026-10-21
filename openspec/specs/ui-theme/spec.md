# ui-theme Specification

## Purpose

アプリケーションのライトとダークの 2 つの外観、ユーザーが外観を切り替える方法、切り替え結果をブラウザ内でどう保持するかを定義する。すべての UI 要素は現在の外観に従う。

## Requirements

### Requirement: Two appearance modes

アプリケーション SHALL 2 つの外観を提供する：ライト（light）とダーク（dark）。任意の時点でちょうど 1 つの外観がアクティブであり、すべての可視 UI 要素（背景、文字、枠線、コントロール）SHALL 現在アクティブな外観に従う。

#### Scenario: Light mode renders light palette

- **WHEN** 現在の外観がライトである
- **THEN** ページは明るい背景と暗い文字を使い、すべての UI 要素の色はライトのパレットに由来する

#### Scenario: Dark mode renders dark palette

- **WHEN** 現在の外観がダークである
- **THEN** ページは暗い背景と明るい文字を使い、すべての UI 要素の色はダークのパレットに由来する

### Requirement: User can toggle appearance

アプリケーション SHALL ヘッダーに常に表示される外観切り替えコントロールを提供する。ユーザーがそのコントロールを操作すると、外観 SHALL ライトとダークの間で即時に切り替わり、ページの再読み込みを必要としない。

#### Scenario: Toggle from light to dark

- **WHEN** 現在の外観がライトで、ユーザーが外観切り替えコントロールを操作する
- **THEN** 外観が即時にダークになり、コントロールの状態は現在がダークであることを反映する

#### Scenario: Toggle from dark to light

- **WHEN** 現在の外観がダークで、ユーザーが外観切り替えコントロールを操作する
- **THEN** 外観が即時にライトになり、コントロールの状態は現在がライトであることを反映する

#### Scenario: Toggle is accessible

- **WHEN** ユーザーがキーボードで外観切り替えコントロールにフォーカスし、Enter または Space を押す
- **THEN** 外観が切り替わり、コントロールには現在の状態を説明するアクセシブルな名前が付いている

### Requirement: Appearance choice persists

ユーザーが手動で選択した外観 SHALL そのブラウザのローカルに保存する。ユーザーが再びページを開くか再読み込みしたとき、SHALL 前回選択した外観を復元する。

#### Scenario: Choice survives reload

- **WHEN** ユーザーが外観をダークに切り替え、その後ページを再読み込みする
- **THEN** ページはダークの外観で読み込まれる

#### Scenario: Choice survives new session

- **WHEN** ユーザーが外観をダークに切り替え、タブを閉じ、その後同じブラウザでアプリケーションを再び開く
- **THEN** ページはダークの外観で読み込まれる

### Requirement: Initial appearance follows system preference
ブラウザのローカルに外観の選択が保存されていないとき、アプリケーション SHALL ダークを初期外観とし、OS の配色設定を参照しない。これは 2026-10-21 の決定である：サイトはダークをブランドのデフォルトとし、システム設定はもはや根拠としない。

#### Scenario: First visit on a dark-preferring system
- **WHEN** ユーザーが初めて訪問し、OS の設定がダークである
- **THEN** ページはダークの外観で読み込まれる

#### Scenario: First visit on a light-preferring system
- **WHEN** ユーザーが初めて訪問し、OS の設定がライトまたは不明である
- **THEN** ページは引き続きダークの外観で読み込まれる

#### Scenario: Stored choice overrides system preference
- **WHEN** ブラウザのローカルに「ライト」が保存されている
- **THEN** ページはライトの外観で読み込まれる
### Requirement: No flash of wrong appearance on load

ページ読み込み時 SHALL 最初の描画より前に正しい外観を適用し、ユーザーは MUST NOT 一方の外観で描画された後に別の外観へ切り替わるフラッシュを見ない。

#### Scenario: Reload in dark mode shows no light flash

- **WHEN** ダークの外観を保存済みのユーザーがページを再読み込みする
- **THEN** 最初のフレームからページはダークの外観である
