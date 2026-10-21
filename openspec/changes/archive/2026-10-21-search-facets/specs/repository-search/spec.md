# Spec Delta

## MODIFIED Requirements

### Requirement: Results are cached within the session
同じ「タイプ、クエリ、ソート、フィルター条件、ページ番号」の組の検索結果 SHALL セッション内で 5 分間キャッシュする。キャッシュヒット時 SHALL リクエストを発行せずに結果を直接表示する。5 分を超えるかページをリロードするとキャッシュは無効になる。失敗したレスポンス MUST NOT キャッシュする。

#### Scenario: Cache hit
- **WHEN** ユーザーが `react` の第 1 ページを検索し、第 2 ページへ進み、再び第 1 ページに戻る。全体が 5 分以内である
- **THEN** 第 1 ページに戻るときにリクエストを発行せず、以前の結果を即座に表示する

#### Scenario: Cache expiry
- **WHEN** ユーザーが 6 分後に同じパラメータで再度検索する
- **THEN** リクエストを再発行する

#### Scenario: Errors are not cached
- **WHEN** ある検索が失敗した後にユーザーが再試行をクリックする
- **THEN** 再試行は実際のリクエストを発行する
