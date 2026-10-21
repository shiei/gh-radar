# Spec Delta

## MODIFIED Requirements

### Requirement: Initial appearance follows system preference
ブラウザのローカルに外観の選択が保存されていないとき、アプリケーション SHALL ダークを初期外観とし、OS の配色設定は参照しない。これは 2026-10-21 の決定である：サイトはダークをブランドのデフォルトとし、システム設定はもはや根拠としない。

#### Scenario: First visit on a dark-preferring system
- **WHEN** ユーザーが初回訪問し、OS の設定がダークである
- **THEN** ページはダーク外観でロードされる

#### Scenario: First visit on a light-preferring system
- **WHEN** ユーザーが初回訪問し、OS の設定がライトまたは不明である
- **THEN** ページはそれでもダーク外観でロードされる

#### Scenario: Stored choice overrides system preference
- **WHEN** ブラウザのローカルに「ライト」が保存されている
- **THEN** ページはライト外観でロードされる
