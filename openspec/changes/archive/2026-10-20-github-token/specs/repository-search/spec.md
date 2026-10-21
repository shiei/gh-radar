# Spec Delta

## ADDED Requirements

### Requirement: Results are cached within the session
同一の「クエリ、ソート、ページ番号」の組の検索結果は SHALL セッション内で 5 分間キャッシュされる。キャッシュヒット時は SHALL リクエストを発起せず直接結果を表示する。5 分を超えるかページをリロードするとキャッシュは失効する。失敗したレスポンスは MUST NOT キャッシュされてはならない。

#### Scenario: Cache hit
- **WHEN** ユーザーが `react` の 1 ページ目を検索し、2 ページ目に進み、再び 1 ページ目に戻る。すべて 5 分以内である
- **THEN** 1 ページ目に戻ったときリクエストを発起せず、以前の結果を即時に表示する

#### Scenario: Cache expiry
- **WHEN** ユーザーが 6 分後に同じパラメータで再度検索する
- **THEN** リクエストを再度発起する

#### Scenario: Errors are not cached
- **WHEN** ある検索が失敗した後にユーザーが再試行をクリックする
- **THEN** 再試行は実際のリクエストを発起する
