# localization Specification

## Purpose

アプリケーションの UI 言語として利用可能な集合、デフォルト言語、ユーザーが言語を切り替えるときの挙動、および UI 文言は集約された言語ファイルに由来しなければならないという制約を定義する。

## Requirements

### Requirement: Supported languages

アプリケーション SHALL 3 つの UI 言語をサポートする：英語（en）、日本語（ja）、中国語（zh）。任意の時点でちょうど 1 つの言語がアクティブであり、ユーザーに見えるすべての文言 SHALL 現在の言語で表示する。

#### Scenario: English active

- **WHEN** 現在の言語が英語である
- **THEN** ヘッダー、コントロールのラベル、ヒントテキストがすべて英語で表示される

#### Scenario: Japanese active

- **WHEN** 現在の言語が日本語である
- **THEN** ヘッダー、コントロールのラベル、ヒントテキストがすべて日本語で表示される

#### Scenario: Chinese active

- **WHEN** 現在の言語が中国語である
- **THEN** ヘッダー、コントロールのラベル、ヒントテキストがすべて中国語で表示される

### Requirement: Default language is English

ブラウザのローカルに言語選択が保存されていないとき、アプリケーション SHALL 英語を初期言語とし、ブラウザや OS の言語設定に基づいて自動選択しない。

#### Scenario: First visit on a Japanese browser

- **WHEN** ユーザーが初めて訪問し、ブラウザの言語設定が日本語である
- **THEN** ページは英語で表示される

### Requirement: User can switch language

アプリケーション SHALL ヘッダーに常に表示される言語切り替えコントロールを提供し、サポートするすべての言語を列挙する。ユーザーが選択すると、UI 文言 SHALL 選択した言語に即時に切り替わり、ページの再読み込みを必要としない。

#### Scenario: Switch to Chinese

- **WHEN** 現在の言語が英語で、ユーザーが言語切り替えコントロールで中国語を選択する
- **THEN** ユーザーに見えるすべての文言が即時に中国語になり、コントロールは現在が中国語であることを示す

#### Scenario: Switcher shows native language names

- **WHEN** ユーザーが言語切り替えコントロールを開く
- **THEN** 各選択肢はその言語自身の名称（English、日本語、中文）で表示され、現在の言語によって変わらない

#### Scenario: Switcher is accessible

- **WHEN** ユーザーがキーボードのみで言語切り替えコントロールを操作する
- **THEN** 開く、閲覧する、任意の言語を選択することができ、コントロールにはアクセシブルな名前が付いている

### Requirement: Language choice persists

ユーザーが選択した言語 SHALL そのブラウザのローカルに保存する。ユーザーが再びページを開くか再読み込みしたとき、SHALL 前回選択した言語を復元する。

#### Scenario: Choice survives reload

- **WHEN** ユーザーが言語を日本語に切り替え、その後ページを再読み込みする
- **THEN** ページは日本語で表示される

### Requirement: Document language reflects active language

ページ文書の言語属性 SHALL 常に現在アクティブな UI 言語と一致させ、スクリーンリーダーやブラウザが正しい言語でページを処理できるようにする。

#### Scenario: Language switch updates document language

- **WHEN** ユーザーが言語を英語から中国語に切り替える
- **THEN** 文書の言語属性が中国語に対応する値になる

### Requirement: All copy comes from language files

ユーザーに見えるすべての文言 SHALL 言語ごとに 1 つずつ用意した集約言語ファイルに由来し、コンポーネント内に MUST NOT ハードコードされた UI 文言を置かない。3 つの言語ファイル SHALL 完全に同一のキー集合を持つ。

#### Scenario: Missing translation is detectable

- **WHEN** あるキーが英語の言語ファイルに存在するが日本語の言語ファイルに欠けている
- **THEN** 自動チェックがその欠落を報告し、UI 上でキー名や英語を黙って表示することはない

#### Scenario: Adding copy requires all languages

- **WHEN** 開発者がある画面に文言を 1 つ追加する
- **THEN** その文言は 3 言語のファイルすべてに対応する項目を持つ
