# Spec Delta

## Purpose

アプリケーションのライトとダークの 2 種類の外観、ユーザーが外観を切り替える方法、および切替結果がブラウザ内でどのように保持されるかを定義する。すべての UI 要素は現在の外観に従う。

## ADDED Requirements

### Requirement: Two appearance modes

アプリケーションは SHALL 2 種類の外観を提供する: ライト（light）とダーク（dark）。任意の時点でちょうど 1 つの外観がアクティブであり、すべての可視 UI 要素（背景、文字、境界線、コントロール）は SHALL 現在アクティブな外観に従う。

#### Scenario: Light mode renders light palette

- **WHEN** 現在の外観がライトである
- **THEN** ページは明るい背景と暗い文字を使用し、すべての UI 要素の色はライトのパレットから取得される

#### Scenario: Dark mode renders dark palette

- **WHEN** 現在の外観がダークである
- **THEN** ページは暗い背景と明るい文字を使用し、すべての UI 要素の色はダークのパレットから取得される

### Requirement: User can toggle appearance

アプリケーションは SHALL ヘッダーに常時表示される外観切替コントロールを提供する。ユーザーがそのコントロールを操作すると、外観は SHALL ライトとダークの間で即時に切り替わり、ページのリロードは不要である。

#### Scenario: Toggle from light to dark

- **WHEN** 現在の外観がライトで、ユーザーが外観切替コントロールを操作する
- **THEN** 外観は即時にダークになり、コントロールの状態は現在がダークであることを反映する

#### Scenario: Toggle from dark to light

- **WHEN** 現在の外観がダークで、ユーザーが外観切替コントロールを操作する
- **THEN** 外観は即時にライトになり、コントロールの状態は現在がライトであることを反映する

#### Scenario: Toggle is accessible

- **WHEN** ユーザーがキーボードで外観切替コントロールにフォーカスし、Enter または Space を押す
- **THEN** 外観が切り替わり、コントロールは現在の状態を説明するアクセシブルな名前を持つ

### Requirement: Appearance choice persists

ユーザーが手動で選択した外観は SHALL そのブラウザのローカルに保存される。ユーザーが再度開くかページをリロードした際、SHALL 前回選択した外観を復元する。

#### Scenario: Choice survives reload

- **WHEN** ユーザーが外観をダークに切り替え、その後ページをリロードする
- **THEN** ページはダークの外観で読み込まれる

#### Scenario: Choice survives new session

- **WHEN** ユーザーが外観をダークに切り替え、タブを閉じ、その後同じブラウザでアプリケーションを再度開く
- **THEN** ページはダークの外観で読み込まれる

### Requirement: Initial appearance follows system preference

ブラウザのローカルに外観の選択が保存されていない場合、アプリケーションは SHALL OS の配色設定を初期外観とする。システム設定を取得できない場合はライトをデフォルトとする。

#### Scenario: First visit on a dark-preferring system

- **WHEN** ユーザーが初回アクセスし、OS の設定がダークである
- **THEN** ページはダークの外観で読み込まれる

#### Scenario: First visit on a light-preferring system

- **WHEN** ユーザーが初回アクセスし、OS の設定がライトまたは不明である
- **THEN** ページはライトの外観で読み込まれる

#### Scenario: Stored choice overrides system preference

- **WHEN** ブラウザのローカルに「ライト」が保存済みで、OS の設定がダークである
- **THEN** ページはライトの外観で読み込まれる

### Requirement: No flash of wrong appearance on load

ページ読み込み時は SHALL 初回描画の前に正しい外観を適用し、ユーザーは MUST NOT 一方の外観で描画された後に別の外観へ切り替わるフラッシュを見てはならない。

#### Scenario: Reload in dark mode shows no light flash

- **WHEN** ダークの外観を保存済みのユーザーがページをリロードする
- **THEN** 最初のフレームからページはダークの外観である
