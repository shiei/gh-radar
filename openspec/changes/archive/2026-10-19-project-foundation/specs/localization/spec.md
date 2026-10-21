# Spec Delta

## Purpose

アプリケーションの UI 言語の利用可能な集合、デフォルト言語、ユーザーが言語を切り替える際の振る舞い、および UI 文言は集約された言語ファイルから取得しなければならないという制約を定義する。

## ADDED Requirements

### Requirement: Supported languages

アプリケーションは SHALL 3 種類の UI 言語をサポートする: 英語（en）、日本語（ja）、中国語（zh）。任意の時点でちょうど 1 つの言語がアクティブであり、すべてのユーザー可視文言は SHALL 現在の言語で表示される。

#### Scenario: English active

- **WHEN** 現在の言語が英語である
- **THEN** ヘッダー、コントロールのラベル、ヒント文がいずれも英語で表示される

#### Scenario: Japanese active

- **WHEN** 現在の言語が日本語である
- **THEN** ヘッダー、コントロールのラベル、ヒント文がいずれも日本語で表示される

#### Scenario: Chinese active

- **WHEN** 現在の言語が中国語である
- **THEN** ヘッダー、コントロールのラベル、ヒント文がいずれも中国語で表示される

### Requirement: Default language is English

ブラウザのローカルに言語選択が保存されていない場合、アプリケーションは SHALL 英語を初期言語とし、ブラウザや OS の言語設定に基づいて自動選択しない。

#### Scenario: First visit on a Japanese browser

- **WHEN** ユーザーが初回アクセスし、ブラウザの言語設定が日本語である
- **THEN** ページは英語で表示される

### Requirement: User can switch language

アプリケーションは SHALL ヘッダーに常時表示される言語切替コントロールを提供し、サポートするすべての言語を列挙する。ユーザーが選択すると、UI 文言は SHALL 選択した言語に即時に切り替わり、ページのリロードは不要である。

#### Scenario: Switch to Chinese

- **WHEN** 現在の言語が英語で、ユーザーが言語切替コントロールで中国語を選択する
- **THEN** すべてのユーザー可視文言が即時に中国語になり、コントロールは現在が中国語であることを表示する

#### Scenario: Switcher shows native language names

- **WHEN** ユーザーが言語切替コントロールを開く
- **THEN** 各選択肢はその言語自身の名称（English、日本語、中文）で表示され、現在の言語によって変化しない

#### Scenario: Switcher is accessible

- **WHEN** ユーザーがキーボードのみで言語切替コントロールを操作する
- **THEN** 開く、閲覧する、任意の言語を選択することができ、コントロールはアクセシブルな名前を持つ

### Requirement: Language choice persists

ユーザーが選択した言語は SHALL そのブラウザのローカルに保存される。ユーザーが再度開くかページをリロードした際、SHALL 前回選択した言語を復元する。

#### Scenario: Choice survives reload

- **WHEN** ユーザーが言語を日本語に切り替え、その後ページをリロードする
- **THEN** ページは日本語で表示される

### Requirement: Document language reflects active language

ページドキュメントの言語マークは SHALL 常に現在アクティブな UI 言語と一致し、スクリーンリーダーとブラウザが正しい言語でページを処理できるようにする。

#### Scenario: Language switch updates document language

- **WHEN** ユーザーが言語を英語から中国語に切り替える
- **THEN** ドキュメントの言語マークが中国語に対応する値になる

### Requirement: All copy comes from language files

すべてのユーザー可視文言は SHALL 言語ごとに 1 つずつの集約された言語ファイルから取得し、コンポーネント内に MUST NOT ハードコードされた UI 文言が現れてはならない。3 つの言語ファイルは SHALL 完全に同一のキー集合を持つ。

#### Scenario: Missing translation is detectable

- **WHEN** あるキーが英語の言語ファイルには存在するが、日本語の言語ファイルには欠落している
- **THEN** 自動チェックがその欠落を報告する。UI 上でキー名や英語を黙って表示することはない

#### Scenario: Adding copy requires all languages

- **WHEN** 開発者がある UI に文言を 1 件追加する
- **THEN** その文言は 3 言語のファイルすべてに対応するエントリを持つ
