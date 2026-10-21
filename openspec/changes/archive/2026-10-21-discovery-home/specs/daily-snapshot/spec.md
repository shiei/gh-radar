# Spec Delta

## MODIFIED Requirements

### Requirement: Per-repository fields
各レコード SHALL 以下を含む：`owner/name`、star 数、fork 数、オープン issue 数、最終 push 日時、作成日時、主言語、topics、アーカイブ済みか否か、ソース一覧、および owner の数値 id（アバターのアドレスを直接組み立ててリダイレクトを 1 回省くために使う。API が提供しない場合は省略してよい）。

#### Scenario: Record shape
- **WHEN** `latest.json` の任意のリポジトリを読む
- **THEN** 上記フィールドがすべて揃っており、欠けている言語や topics は null または空配列で表され、owner id が欠けている場合はそのフィールドが存在しない
