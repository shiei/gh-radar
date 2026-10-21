# repository-search Specification

## Purpose

ユーザーがトップページで GitHub リポジトリを検索するときの挙動を定義する：入力と送信、ソート、結果リストの表示フィールド、ページネーション、およびローディング中、結果なし、失敗の 3 つの状態の表示。

## Requirements

### Requirement: Search is submitted explicitly
トップページ SHALL 検索入力欄を 1 つ提供し、独立した検索ボタンは設けない。入力欄内の右側 SHALL 「Enter で送信」の視覚的ヒントとして送信アイコンを 1 つ置き、そのクリックは Enter と同等とする。検索 SHALL ユーザーが Enter を押すかそのアイコンをクリックしたときにのみ開始し、入力中は MUST NOT 自動でリクエストを発行しない。前後の空白を除去して空になる入力は MUST NOT リクエストを発行しない。

#### Scenario: Submit with Enter
- **WHEN** ユーザーが入力欄に `react` と入力して Enter を押す
- **THEN** `react` をクエリとする検索が 1 回開始される

#### Scenario: Submit with the inline icon
- **WHEN** ユーザーが入力欄に `react` と入力して入力欄内の送信アイコンをクリックする
- **THEN** `react` をクエリとする検索が 1 回開始される

#### Scenario: Soft keyboard offers a search key
- **WHEN** ユーザーがモバイル端末で入力欄にフォーカスする
- **THEN** ソフトキーボードの確定キーが「検索」として表示され、押すと送信される

#### Scenario: Typing does not search
- **WHEN** ユーザーが `react` を 1 文字ずつ入力するが送信しない
- **THEN** 検索リクエストは一切発行されない

#### Scenario: Blank input is ignored
- **WHEN** ユーザーが空白のみの入力を送信する
- **THEN** リクエストは発行されず、入力欄は編集可能なままで、エラーは表示されない

### Requirement: Example queries are offered
検索ボックスの下 SHALL いくつかの例クエリを表示し、ユーザーが qualifier 構文を発見できるようにする。例のクリック SHALL そのクエリを入力欄に入れて即時に検索する。SHALL 同時に GitHub の検索構文ドキュメントへのリンクを提供する。

#### Scenario: Click an example
- **WHEN** ユーザーが例 `language:rust` をクリックする
- **THEN** 入力欄の内容が `language:rust` になり、それで検索が開始される

#### Scenario: Syntax help link
- **WHEN** ユーザーが構文ヘルプリンクをクリックする
- **THEN** 新しいタブで GitHub のリポジトリ検索構文ドキュメントが開く

### Requirement: Query text is passed through unchanged
ユーザーが送信したテキスト（前後の空白を除去したもの）SHALL そのままクエリとして送信し、書き換え、分割、エスケープ以外の処理を行わない。したがって GitHub の qualifier 構文をそのまま使える。

#### Scenario: Qualifier syntax works
- **WHEN** ユーザーが `language:rust cli stars:>500` を送信する
- **THEN** 送信されるクエリはまさに `language:rust cli stars:>500` である

### Requirement: Results can be sorted
検索領域 SHALL ソート選択を提供し、選択肢は best match（デフォルト）、most stars、recently updated とする。検索結果がある状態でソートを変更したとき SHALL 新しいソートで 1 ページ目から再検索する。まだ検索していない状態でソートを変更したとき SHALL 選択を記憶するだけとする。

#### Scenario: Default sort is best match
- **WHEN** ユーザーが初めてページに入る
- **THEN** ソート選択は best match と表示される

#### Scenario: Changing sort re-runs the search
- **WHEN** ユーザーが `react` を検索して 3 ページ目にいる状態で、ソートを most stars に変更する
- **THEN** `react` と most stars で 1 ページ目から再検索される

#### Scenario: Changing sort before any search
- **WHEN** ユーザーがまだ検索を送信しておらず、ソートを recently updated に変更する
- **THEN** リクエストは発行されない。以降の最初の検索は recently updated を使う

### Requirement: Result items show repository facts
各結果項目 SHALL 次を表示する：owner のアバター、`owner/name`、説明、star 数、topics、アクティビティラベル、最終プッシュ時刻、メタデータ更新時刻、主要言語、license、fork 数、未クローズ issue 数（PR を含む）、コードサイズ、owner 種別（組織または個人）、公式サイトリンク。リポジトリが Archived、Fork、Template のとき SHALL 対応するラベルを表示し、Archived の項目 SHALL 全体を淡く表示する。2 つの時刻 SHALL 区別できるラベルを使い、ホバーのツールチップで意味を説明する。アバターは GitHub の公開アバター URL から取得し、API クォータを消費しない。欠けているフィールド SHALL プレースホルダーテキストを表示せず省略する。名称のクリック SHALL 新しいタブでそのリポジトリの GitHub ページを開く。

#### Scenario: Full item
- **WHEN** 結果の中にアバター、説明、言語、topics、license がすべて存在するリポジトリがある
- **THEN** 結果項目に上記のすべてのフィールドが表示され、アバターは小さな円形画像、star 数はコンパクト形式（例：12.8k）、30 日以内のプッシュ時刻は相対時間（例：3 days ago）で表示され、ホバーすると分単位までの完全な時刻が見える

#### Scenario: Activity label follows the last push
- **WHEN** リポジトリの最終プッシュが 30 日以内である
- **THEN** アクティビティは Active と表示される。31 日から 180 日は Quiet、180 日超は Inactive と表示され、3 つは異なる色の円点で区別される。ラベルにホバーすると SHALL この判定ルールの簡潔な説明が見え、GitHub の値ではなく本サイト独自の参考指標である旨が記されている

#### Scenario: Repository flags
- **WHEN** リポジトリがアーカイブ済み、fork、またはテンプレートリポジトリである
- **THEN** 名称の横にそれぞれ Archived、Fork、Template ラベルが表示され、アーカイブ済みの項目は全体の不透明度が下がる

#### Scenario: Older timestamps are absolute dates
- **WHEN** あるリポジトリの最終プッシュ時刻が 30 日より前である
- **THEN** ローカライズされた絶対日付（英語は Mar 4, 2025、中国語と日本語は 2025年3月4日）で表示され、ホバーすると引き続き完全な時刻が見える。メタデータ更新時刻も同じ表示ルールに従う

#### Scenario: Partial item
- **WHEN** 結果の中に説明がなく、license がなく、topics が空のリポジトリがある
- **THEN** 結果項目に説明、license、topics の領域は表示されず、その他のフィールドは通常どおり表示される

#### Scenario: Item links to GitHub
- **WHEN** ユーザーが結果項目の名称をクリックする
- **THEN** 新しいタブで `https://github.com/{owner}/{name}` が開く

#### Scenario: Facts follow the active language
- **WHEN** 現在の UI 言語が中国語である
- **THEN** 相対時間と数値の形式が中国語の慣習に従って表示される

### Requirement: Topic tags are search shortcuts
結果項目内の各 topic タグ SHALL クリック可能とする。クリック後 SHALL `topic:<名称>` をクエリとし、現在のソートを引き継ぎ、1 ページ目から新しい検索を開始する。入力欄 SHALL そのクエリを表示し、ユーザーが続けて編集できるようにする。

#### Scenario: Click a topic
- **WHEN** ユーザーがある結果項目の topic タグ `react` をクリックする
- **THEN** クエリ `topic:react` の検索が開始され、ページ番号は 1 ページ目に戻り、入力欄の内容が `topic:react` になる

#### Scenario: Topic tags are keyboard accessible
- **WHEN** ユーザーが Tab である topic タグにフォーカスして Enter を押す
- **THEN** クリックと同じ効果になる

### Requirement: Result count is shown
検索成功後 SHALL 一致総数を表示する。総数がアクセス可能な上限（1000 件）を超えるとき SHALL 先頭の 1000 件のみ閲覧できる旨を説明する。

#### Scenario: Small result set
- **WHEN** 検索が総数 42 を返す
- **THEN** 42 件の一致と表示される

#### Scenario: Large result set
- **WHEN** 検索が総数 120000 を返す
- **THEN** 120,000 件の一致と表示され、先頭の 1000 件のみ閲覧できる旨が説明される

### Requirement: Results are paginated
結果 SHALL ページ分割して表示し、1 ページあたり固定で 10 件とする。SHALL 前のページ、次のページのコントロールと、直接クリックできるページ番号リンクを提供する。ページ数が多すぎるとき SHALL 先頭ページ、末尾ページ、現在のページ付近のページ番号のみを表示し、残りは省略記号に折りたたむ。現在のページ SHALL 強調表示し、クリック不可とする。1 ページ目の前のページ SHALL 無効とする。最後のページまたはアクセス可能な上限（100 ページ目）に到達したとき、次のページ SHALL 無効とする。ページ移動後 SHALL 結果領域の先頭までスクロールする。

#### Scenario: Next page
- **WHEN** ユーザーが 1 ページ目で次のページをクリックする
- **THEN** 同じクエリとソートで 2 ページ目を検索し、ページ表示が 2 ページ目になる

#### Scenario: Numbered link jumps directly
- **WHEN** ユーザーが 1 ページ目にいて全 100 ページのとき、ページ番号 100 をクリックする
- **THEN** 同じクエリとソートで 100 ページ目を検索し、ページ番号 100 が強調表示される

#### Scenario: Long ranges are collapsed
- **WHEN** ユーザーが 50 ページ目にいて全 100 ページである
- **THEN** 1、省略記号、48 から 52、省略記号、100 が表示される

#### Scenario: First page has no previous
- **WHEN** ユーザーが 1 ページ目にいる
- **THEN** 前のページのコントロールは無効である

#### Scenario: Last reachable page
- **WHEN** 総数が 5000 でユーザーが 100 ページ目にいる
- **THEN** 次のページのコントロールは無効である

#### Scenario: Fewer results than one page
- **WHEN** 総数が 7 である
- **THEN** 前のページと次のページのコントロールはいずれも無効である

### Requirement: Loading state
リクエスト進行中 SHALL ローディング中の表示を行う：入力欄内の送信アイコン SHALL ローディングアイコンに変わり、結果領域 SHALL ローディング中を表示する。ローディング中は MUST NOT 入力欄や送信を無効化しない。リクエスト進行中にユーザーが新しい検索を送信したとき、古いリクエスト SHALL キャンセルし、その結果は MUST NOT 新しいリクエストの結果を上書きしない。

#### Scenario: Loading indicator
- **WHEN** 検索リクエストが送信済みでまだ返っていない
- **THEN** 入力欄内の送信アイコンがローディング中として表示され、結果領域にローディング中が表示され、入力欄は引き続き編集と送信ができる

#### Scenario: Stale response is discarded
- **WHEN** ユーザーが先に `react` を検索し、その返却前にさらに `vue` を検索する
- **THEN** 最終的に `vue` の結果のみが表示され、`react` のレスポンスが後から届いても同様である

### Requirement: Empty state
検索は成功したが一致が 1 件もないとき SHALL 結果なしの案内を表示し、ユーザーが編集できるようにクエリテキストを保持する。

#### Scenario: No matches
- **WHEN** 検索が総数 0 を返す
- **THEN** 結果なしの案内が表示され、入力欄には元のクエリが引き続き表示される

### Requirement: Failure state
検索が失敗したとき SHALL 失敗理由に応じた案内を表示する：クォータ枯渇はリトライ可能な時刻を表示し、クエリ構文が無効な場合はクエリの修正を促し、ネットワークやその他のエラーは汎用の失敗案内を表示する。失敗案内 SHALL リトライ操作を提供し、リトライ SHALL 同じパラメータで再検索する。

#### Scenario: Rate limited
- **WHEN** 検索がクォータ枯渇で失敗し、回復時刻が 14:32 である
- **THEN** クォータ枯渇の案内が表示され、14:32 以降にリトライできる旨が説明される

#### Scenario: Invalid query
- **WHEN** 検索がクエリ構文の無効で失敗する
- **THEN** クエリ無効の案内が表示され、クォータ情報は表示されない

#### Scenario: Network failure
- **WHEN** リクエストがサーバーに到達できない
- **THEN** 汎用の失敗案内とリトライ操作が表示される

#### Scenario: Retry
- **WHEN** ユーザーが失敗案内上でリトライをクリックする
- **THEN** 同じクエリ、ソート、ページ番号で再検索される

### Requirement: Results are cached within the session
同一の「種別、クエリ、ソート、フィルター条件、ページ番号」の組の検索結果 SHALL セッション内で 5 分間キャッシュする。キャッシュにヒットしたとき SHALL リクエストを発行せず結果を直接表示する。5 分を超えるかページを再読み込みするとキャッシュは無効になる。失敗したレスポンスは MUST NOT キャッシュしない。

#### Scenario: Cache hit
- **WHEN** ユーザーが `react` の 1 ページ目を検索し、2 ページ目に移動し、再び 1 ページ目に戻り、全体が 5 分以内である
- **THEN** 1 ページ目に戻るときリクエストは発行されず、以前の結果が即時に表示される

#### Scenario: Cache expiry
- **WHEN** ユーザーが 6 分後に同じパラメータで再び検索する
- **THEN** リクエストが再度発行される

#### Scenario: Errors are not cached
- **WHEN** ある検索が失敗した後にユーザーがリトライをクリックする
- **THEN** リトライは実際のリクエストを発行する
