# Spec Delta

## Purpose

トップページの各ブレークポイントでの領域分割を定義する：どの内容が左カラム、中央カラム、右カラムにあるか、狭い画面でどう折りたたむか。後続の種別切替とフィルタのための場所を確保する。

## ADDED Requirements

### Requirement: Three columns on wide screens
ウィンドウ幅が 1024px 以上のとき、キャッチコピーとイラストの下 SHALL 3 カラムに分かれる：左カラムは固定幅で分類ナビゲーションを置き、中央カラムは可変幅で検索ボックス、サンプル、結果を置き、右カラムは固定幅で 2 つのランキングを置く。3 カラムは上端で揃える。

#### Scenario: Wide layout
- **WHEN** ウィンドウ幅が 1280px である
- **THEN** 分類が左、検索と結果が中央、ランキングが右に並ぶ

### Requirement: Single column on narrow screens
ウィンドウ幅が 1024px 未満のとき SHALL 単一カラムとする：順序はキャッチコピーとイラスト（イラストは既存ルールにより 998px 未満で非表示）、分類 chip 行、検索ボックスとサンプル、結果またはランキング。検索を発行していないときはランキングを表示し、検索結果があるときはランキング SHALL 非表示にして結果に場所を譲る。

#### Scenario: Narrow before searching
- **WHEN** ウィンドウ幅が 600px でユーザーが検索していない
- **THEN** 上から順にキャッチコピー、分類 chip、検索ボックス、2 つのランキングが並ぶ

#### Scenario: Narrow after searching
- **WHEN** ウィンドウ幅が 600px でユーザーが検索済みである
- **THEN** 結果が検索ボックスの下に表示され、ランキングは表示されない

### Requirement: Right column stays when searching
ワイド画面で検索を発行した後も、右カラムのランキング SHALL 表示を維持し、結果に押し出されない。

#### Scenario: Wide after searching
- **WHEN** ウィンドウ幅が 1280px でユーザーが検索済みである
- **THEN** 中央カラムに結果が表示され、右カラムには引き続きランキングが表示される

### Requirement: Content width
3 カラムの合計幅 SHALL 1280px を超えず、水平中央に配置する。既存のページヘッダーの幅 SHALL これに合わせて同じ最大幅に調整し、揃いを保つ。

#### Scenario: Very wide window
- **WHEN** ウィンドウ幅が 1920px である
- **THEN** コンテンツ領域は幅 1280px で中央に配置され、ページヘッダーのコンテンツ領域も同じ幅である

### Requirement: Narrow screens get corner decorations
ウィンドウ幅が 998px 未満（レーダーイラストが非表示）のとき、ページ上部の左右両隅 SHALL それぞれ「スキャン対象物」の装飾一式を表示する：左側は AI、TS、GO のアイコン、右側は Fn、脳、ブランチのアイコンで、それぞれに小さなスキャン枠 2 つとグラデーションの円点 2 つを添え、左右のレイアウトは非対称とする。装飾 SHALL コンテンツ領域の外側の絶対配置レイヤーに置き、レイアウト上の領域を占有したりマウスに反応したりすることを MUST NOT 行い、ダーク / ライトのテーマ切替に応じて対応する配色に切り替わる。

#### Scenario: Narrow screen decorations
- **WHEN** ウィンドウ幅が 600px である
- **THEN** 左右両隅に装飾が表示され、すべての要素が完全に見え、キャッチコピーと検索ボックスの位置は影響を受けない

#### Scenario: Wide screen
- **WHEN** ウィンドウ幅が 1280px である
- **THEN** 装飾は表示されず、レーダーイラストが通常どおり表示される

### Requirement: Footer offers deeper-research tools and provenance
フッター SHALL 本サイトが意図的に手を出さない領域をカバーする外部ツール（GitHub Search、GitHub Trending、grep.app、Sourcegraph、OSS Insight、Libraries.io）を列挙し、各項目に一文の説明と外部リンクアイコンを付け、見出しは「より深く調査したいときに」という意図を表す。フッターの最下部 SHALL 控えめな説明を 1 行置き、本サイトが個人で保守するオープンソースツールであり、日次スナップショットでオープンソースの動向を観察するものであることを述べ、テキストリンクでソースコードリポジトリを指す。

#### Scenario: Footer content
- **WHEN** ユーザーがページ最下部までスクロールする
- **THEN** 説明と外部リンク付きの 6 つのツールと、ソースコードリンクを含む説明行が見える。ブランド宣言のような文言はない
