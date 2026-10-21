# Tasks

## 1. データ定義

- [x] 1.1 `src/lib/categories.ts`（daily-snapshot 由来）に 3 言語の `category.*` キーとアイコン参照を補い、単体テストで 3 言語の名称が揃っていることを検証する
- [x] 1.2 `src/lib/snapshot/`（`loadSnapshot`、`loadSeries`、`decodeRecord`）と `src/lib/rankings.ts`（`rankPopular`、`rankRising`。30 日増分と 7 日未満の退化を含む）を新設し、単体テストでデコード、並び替え、境界、退化をカバーする
- [x] 1.3 `src/features/rankings/useSnapshot.ts`（1 回ロード、メモリキャッシュ、欠落 / 期限切れ判定）を新設し、stub fetch を使う単体テストで 3 つの状態をカバーする
- [x] 1.4 fixture スナップショットは `e2e/fixtures/snapshot/`（30 リポジトリ、14 日分の系列）に置くことに変更し、e2e ではルートインターセプトで `/data/**` を提供する。`public/data/` には daily-snapshot により実データが入っているため、プレースホルダーは不要になった

## 2. コンポーネント

- [x] 2.1 `BrainIcon` atom を抽出し、`MonitorIcon`、`ServerIcon`、`CloudIcon`、`DatabaseIcon`、`PaletteIcon` を新設する
- [x] 2.2 `CategoryNav` molecule（list / chips の 2 形態、選択状態、キーボード操作可）を実装し、単体テストで 6 項目の描画、選択状態の一致、クリックコールバックをカバーする
- [x] 2.3 `RankingList` molecule（順位、アバター、名称リンク、star、Rising の 30 日増分、データ日付と期限切れの注意、「すべて表示」の展開・折りたたみ、退化モードの注記）を実装し、3 言語の `ranking.*` キーを追加し、単体テストで正常 / 退化 / 欠落 / 期限切れと展開をカバーする

## 3. レイアウトと配線

- [x] 3.1 `DiscoveryLayout` template（lg で 3 カラムグリッド、未満は単一カラム）を実装し、`AppShell` と `Header` の最大幅を `max-w-7xl` に変更する
- [x] 3.2 `HomePage` を改造する：分類クリックで `submit` を呼び、`activeQuery` を `CategoryNav` に渡し、ランキングは選択中の分類でフィルタし、狭い画面では idle 時のみランキングを表示する。単体テストで分類クリック後に対応するクエリが発行されランキングがフィルタされることを検証する
- [x] 3.3 e2e `e2e/discovery.spec.ts`：1280px で 3 カラム、ランキングが各 5 件で Rising に増分付き。分類クリック後の入力欄とリクエストの q、ランキングが分類でフィルタされる。「すべて表示」で 30 件に展開。600px で分類が chip になり、検索後にランキングが隠れる。`/data/latest.json` をインターセプトして 404 を返すと「データなし」が表示され、検索は正常に動く

## 4. 仕上げ

- [x] 4.1 `npm run check` と `npm run test:e2e` を通す。README にランキングの定義（30 日増分、退化ルール）を補足する。ROADMAP の B にチェックを入れる
