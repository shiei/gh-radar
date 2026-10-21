# Spec Delta

## Purpose

ユーザーがホームページで GitHub リポジトリを検索する振る舞いを定義する: 入力と送信、ソート、結果リストの表示フィールド、ページネーション、および読み込み中、結果なし、失敗の 3 種類の状態の表示。

## ADDED Requirements

### Requirement: Search is submitted explicitly
ホームページは SHALL 検索入力ボックスを提供し、独立した検索ボタンは設けない。入力ボックス内の右側には SHALL 「Enter で送信」の視覚的ヒントとして送信アイコンがあり、それをクリックすることは Enter と同等である。検索は SHALL ユーザーが Enter を押すかそのアイコンをクリックしたときにのみ発起され、入力中に MUST NOT 自動的にリクエストを発行してはならない。前後の空白を除去した後に空になる入力は MUST NOT リクエストを発行してはならない。

#### Scenario: Submit with Enter
- **WHEN** ユーザーが入力ボックスに `react` と入力して Enter を押す
- **THEN** `react` をクエリとする検索を 1 回発起する

#### Scenario: Submit with the inline icon
- **WHEN** ユーザーが入力ボックスに `react` と入力し、入力ボックス内の送信アイコンをクリックする
- **THEN** `react` をクエリとする検索を 1 回発起する

#### Scenario: Soft keyboard offers a search key
- **WHEN** ユーザーがモバイルデバイスで入力ボックスにフォーカスする
- **THEN** ソフトキーボードの確定キーが「検索」として表示され、押すと送信される

#### Scenario: Typing does not search
- **WHEN** ユーザーが `react` を 1 文字ずつ入力するが送信しない
- **THEN** いかなる検索リクエストも発起しない

#### Scenario: Blank input is ignored
- **WHEN** ユーザーがスペースのみを含む入力を送信する
- **THEN** リクエストを発行せず、入力ボックスは編集可能なままで、エラーを表示しない

### Requirement: Example queries are offered
検索ボックスの下部には SHALL いくつかのサンプルクエリを表示し、ユーザーが qualifier 構文を発見できるようにする。サンプルのクリックは SHALL そのクエリを入力ボックスに入れて即時に検索する。SHALL 同時に GitHub の検索構文ドキュメントへのリンクを提供する。

#### Scenario: Click an example
- **WHEN** ユーザーがサンプル `language:rust` をクリックする
- **THEN** 入力ボックスの内容が `language:rust` になり、それで検索を発起する

#### Scenario: Syntax help link
- **WHEN** ユーザーが構文ヘルプリンクをクリックする
- **THEN** 新しいタブで GitHub のリポジトリ検索構文ドキュメントを開く

### Requirement: Query text is passed through unchanged
ユーザーが送信したテキスト（前後の空白を除去した後）は SHALL そのままクエリとして送信され、書き換え、分割、エスケープ以外の処理を行わない。したがって GitHub の qualifier 構文を直接使える。

#### Scenario: Qualifier syntax works
- **WHEN** ユーザーが `language:rust cli stars:>500` を送信する
- **THEN** 送信されるクエリはまさに `language:rust cli stars:>500` である

### Requirement: Results can be sorted
検索領域は SHALL ソート選択を提供し、選択肢は best match（デフォルト）、most stars、recently updated とする。すでに検索結果があるときにソートを変更すると SHALL 新しいソートで 1 ページ目から再検索する。まだ検索していないときにソートを変更すると SHALL 選択を記憶するだけである。

#### Scenario: Default sort is best match
- **WHEN** ユーザーが初めてページに入る
- **THEN** ソート選択は best match と表示される

#### Scenario: Changing sort re-runs the search
- **WHEN** ユーザーが `react` を検索済みで 3 ページ目にいて、ソートを most stars に変更する
- **THEN** `react` と most stars で 1 ページ目から再検索する

#### Scenario: Changing sort before any search
- **WHEN** ユーザーがまだ検索を送信しておらず、ソートを recently updated に変更する
- **THEN** リクエストを発行しない。その後の初回検索は recently updated を使う

### Requirement: Result items show repository facts
各結果項目は SHALL 次を表示する: owner のアバター、`owner/name`、説明、star 数、topics、活動度ラベル、最終プッシュ時刻、メタデータ更新時刻、主要言語、license、fork 数、未クローズ issue 数（PR を含む）、コードサイズ、owner の種類（組織または個人）、公式サイトリンク。リポジトリが Archived、Fork、Template の場合は SHALL 対応するラベルを表示し、Archived の項目は SHALL 全体を淡色化する。2 つの時刻は SHALL 区別できるラベルを使い、ホバーのヒントで意味を説明する。アバターは GitHub の公開アバター URL から取得し、API クォータを消費しない。欠落したフィールドは SHALL プレースホルダーテキストを表示するのではなく省略する。名前のクリックは SHALL 新しいタブでそのリポジトリの GitHub ページを開く。

#### Scenario: Full item
- **WHEN** 結果に、アバター、説明、言語、topics、license がすべて存在するリポジトリがある
- **THEN** 結果項目は上記のすべてのフィールドを表示し、アバターは小さな円形画像、star 数はコンパクト形式（例: 12.8k）、30 日以内のプッシュ時刻は相対時間（例: 3 days ago）で表示され、ホバーで分単位まで正確な完全な時刻が見える

#### Scenario: Activity label follows the last push
- **WHEN** リポジトリの最終プッシュが 30 日以内である
- **THEN** 活動度は Active と表示される。31 から 180 日は Quiet、180 日超は Inactive と表示し、3 者は異なる色の丸で区別する。ラベルにホバーすると SHALL この判定規則の簡潔な説明が見え、GitHub の値ではなく本サイト独自の参考値であることが注記される

#### Scenario: Repository flags
- **WHEN** リポジトリがアーカイブ済み、fork、またはテンプレートリポジトリである
- **THEN** 名前の横にそれぞれ Archived、Fork、Template ラベルを表示する。アーカイブ済みの項目は全体の不透明度を下げる

#### Scenario: Older timestamps are absolute dates
- **WHEN** あるリポジトリの最終プッシュ時刻が 30 日より前である
- **THEN** ローカライズされた絶対日付で表示し（英語 Mar 4, 2025、中国語と日本語 2025年3月4日）、ホバーでは引き続き完全な時刻が見える。メタデータ更新時刻も同じ表示規則に従う

#### Scenario: Partial item
- **WHEN** 結果に、説明がなく、license がなく、topics が空のリポジトリがある
- **THEN** 結果項目は説明、license、topics の領域を表示せず、その他のフィールドは通常どおり表示する

#### Scenario: Item links to GitHub
- **WHEN** ユーザーが結果項目の名前をクリックする
- **THEN** 新しいタブで `https://github.com/{owner}/{name}` を開く

#### Scenario: Facts follow the active language
- **WHEN** 現在の UI 言語が中国語である
- **THEN** 相対時間と数値の形式は中国語の慣習に従って表示される

### Requirement: Topic tags are search shortcuts
結果項目内の各 topic タグは SHALL クリック可能である。クリック後は SHALL `topic:<名称>` をクエリとし、現在のソートを引き継ぎ、1 ページ目から新しい検索を発起する。入力ボックスは SHALL そのクエリを表示し、ユーザーが続けて修正できるようにする。

#### Scenario: Click a topic
- **WHEN** ユーザーがある結果項目の topic タグ `react` をクリックする
- **THEN** クエリが `topic:react` の検索を発起し、ページ番号は 1 ページ目に戻り、入力ボックスの内容は `topic:react` になる

#### Scenario: Topic tags are keyboard accessible
- **WHEN** ユーザーが Tab である topic タグにフォーカスして Enter を押す
- **THEN** 効果はクリックと同じである

### Requirement: Result count is shown
検索成功後は SHALL 一致した総数を表示する。総数がアクセス可能な上限（1000 件）を超える場合は SHALL 先頭 1000 件のみ閲覧できることを説明する。

#### Scenario: Small result set
- **WHEN** 検索が総数 42 を返す
- **THEN** 42 件一致と表示する

#### Scenario: Large result set
- **WHEN** 検索が総数 120000 を返す
- **THEN** 120,000 件一致と表示し、先頭 1000 件のみ閲覧できることを説明する

### Requirement: Results are paginated
結果は SHALL ページ分割して表示し、1 ページ固定 10 件とする。SHALL 前のページ、次のページのコントロール、および直接クリックできるページ番号リンクを提供する。ページ数が多すぎる場合は SHALL 先頭ページ、末尾ページ、現在ページ付近のページ番号のみを表示し、残りは省略記号に折りたたむ。現在ページは SHALL ハイライトされ、クリック不可である。1 ページ目の前のページは SHALL 使用不可である。最終ページまたはアクセス可能な上限（100 ページ目）に到達したとき、次のページは SHALL 使用不可である。ページ送り後は SHALL 結果領域の先頭にスクロールする。

#### Scenario: Next page
- **WHEN** ユーザーが 1 ページ目で次のページをクリックする
- **THEN** 同じクエリとソートで 2 ページ目を検索し、ページ表示が 2 ページ目になる

#### Scenario: Numbered link jumps directly
- **WHEN** ユーザーが 1 ページ目にいて全 100 ページあり、ページ番号 100 をクリックする
- **THEN** 同じクエリとソートで 100 ページ目を検索し、ページ番号 100 がハイライトされる

#### Scenario: Long ranges are collapsed
- **WHEN** ユーザーが 50 ページ目にいて全 100 ページある
- **THEN** 1、省略記号、48 から 52、省略記号、100 を表示する

#### Scenario: First page has no previous
- **WHEN** ユーザーが 1 ページ目にいる
- **THEN** 前のページのコントロールは使用不可である

#### Scenario: Last reachable page
- **WHEN** 総数が 5000 でユーザーが 100 ページ目にいる
- **THEN** 次のページのコントロールは使用不可である

#### Scenario: Fewer results than one page
- **WHEN** 総数が 7 である
- **THEN** 前のページと次のページのコントロールはいずれも使用不可である

### Requirement: Loading state
リクエスト進行中は SHALL 読み込み中インジケーターを表示する: 入力ボックス内の送信アイコンは SHALL 読み込み中アイコンに変わり、結果領域は SHALL 読み込み中を表示する。読み込み中に MUST NOT 入力ボックスや送信を無効化してはならない。ユーザーがリクエスト進行中に新しい検索を送信した場合、古いリクエストは SHALL キャンセルされ、その結果は MUST NOT 新しいリクエストの結果を上書きしてはならない。

#### Scenario: Loading indicator
- **WHEN** 検索リクエストが送信済みでまだ返ってきていない
- **THEN** 入力ボックス内の送信アイコンは読み込み中として表示され、結果領域は読み込み中を表示し、入力ボックスは引き続き編集と送信ができる

#### Scenario: Stale response is discarded
- **WHEN** ユーザーが先に `react` を検索し、それが返る前に `vue` を検索する
- **THEN** 最終的に `vue` の結果のみが表示される。`react` のレスポンスが後に到達しても同様である

### Requirement: Empty state
検索は成功したが一致が 1 件もない場合は SHALL 結果なしの通知を表示し、ユーザーが修正できるようにクエリテキストを保持する。

#### Scenario: No matches
- **WHEN** 検索が総数 0 を返す
- **THEN** 結果なしの通知を表示し、入力ボックスは元のクエリを引き続き表示する

### Requirement: Failure state
検索が失敗したときは SHALL 失敗の原因に応じて対応するメッセージを表示する: クォータ枯渇は再試行可能な時刻を表示し、クエリ構文無効はユーザーにクエリの修正を促し、ネットワークやその他のエラーは汎用の失敗メッセージを表示する。失敗メッセージは SHALL 再試行操作を提供し、再試行は SHALL 同じパラメータで再度検索する。

#### Scenario: Rate limited
- **WHEN** 検索がクォータ枯渇により失敗し、回復時刻が 14:32 である
- **THEN** クォータ枯渇の通知を表示し、14:32 以降に再試行できることを説明する

#### Scenario: Invalid query
- **WHEN** 検索がクエリ構文無効により失敗する
- **THEN** クエリ無効の通知を表示し、クォータ情報は表示しない

#### Scenario: Network failure
- **WHEN** リクエストがサーバーに到達できない
- **THEN** 汎用の失敗メッセージと再試行操作を表示する

#### Scenario: Retry
- **WHEN** ユーザーが失敗メッセージ上で再試行をクリックする
- **THEN** 同じクエリ、ソート、ページ番号で再度検索する
