# Design

## Context

現状：`HomePage` はキャッチコピー、検索ボックス、サンプル、結果を縦に積んでいる。`AppShell` のコンテンツ領域の最大幅は `max-w-5xl`（1024px）。検索の送信は一律に `useRepositorySearch().submit` を通り、topic タグとサンプル chip もこれを再利用している。`searchCache` は `query|sort|page` ごとに 5 分キャッシュする。振る舞いの契約は本 change の 3 つの delta spec を参照。

## Goals / Non-Goals

**Goals:**
- 分類とランキングはどちらも「プリセットクエリ + submit 呼び出し」に留め、第 2 の検索状態を導入しない。
- ランキングは静的スナップショットのみを読み、クォータを消費せず、メイン検索の状態にも依存しない。
- レイアウトは CSS Grid で 1 か所にブレークポイントを定義し、コンポーネントはレイアウトを意識しない。

**Non-Goals:**
- 種別切替、フィルタは行わない（change C）。
- 分類の 2 階層構造は行わない。
- ランキングの期間切替は行わない。

## Decisions

### D1. 分類マッピング `src/lib/categories.ts`
```ts
interface Category { id: 'frontend'|'backend'|'ai-ml'|'devops'|'database'|'design'; query: string; icon: IconComponent }
```
名称は言語ファイルの `category.<id>` にある。クエリは単一のアンブレラ topic に star 下限を加えたものとし、複数 topic の AND 意味論で結果が狭まりすぎるのを避ける：
| id | query |
|----|-------|
| frontend | `topic:frontend stars:>200` |
| backend | `topic:backend stars:>200` |
| ai-ml | `topic:machine-learning stars:>200` |
| devops | `topic:devops stars:>200` |
| database | `topic:database stars:>200` |
| design | `topic:design-system stars:>100` |
代替案は分類ごとに複数の topic を列挙することだったが、GitHub のリポジトリ検索では複数の `topic:` は AND であり OR がないため、採用しなかった。アンブレラ topic はいずれも GitHub 上で人気のタグであり、結果の量は十分である。

### D2. 選択状態
`CategoryNav` は `activeQuery`（`state.query` 由来）を受け取り、各分類の `query` と厳密に等しいときに選択状態とする。あいまい一致は行わない。

### D3. スナップショットの読み込みとランキング `src/lib/snapshot/` と `src/lib/rankings.ts`
`loadSnapshot()` は `/data/meta.json` と `/data/latest.json` を取得し、`loadSeries(category)` は必要に応じて `/data/series/<id>.json` を取得する。いずれもメモリに 1 回だけキャッシュする。`decodeRecord` は 1 文字キーを展開する。`rankPopular(repos, category?)` と `rankRising(repos, series, today, category?)` は純関数である：rising の増分 = 当日の star から `today-30d` 以前の最も近い点の star を引いたもの。系列の期間が 7 日に満たない場合は `{ mode: 'fallback' }` を返し、作成日で近似する。`useSnapshot()` hook は status / meta / repos / series と `stale`（3 日超）を公開する。ランキングは GitHub リクエストを一切発行しない。

### D4. レイアウト `DiscoveryLayout` template
```
lg 以上:  grid-cols-[14rem_minmax(0,1fr)_18rem] gap-8   max-w-7xl
lg 未満:  単一カラム flex-col
```
`HomePage` は hero、`CategoryNav`、検索領域、`SearchResults`、2 つの `RankingList` を slot としてテンプレートに渡す。テンプレートは、どのブレークポイントで `CategoryNav` を縦のリストとして描画するか chip 行として描画するか（`variant` prop による）、ランキングを右カラムに置くか結果の下に置くか（狭い画面では `state.status === 'idle'` のときだけ表示）を決める。`AppShell` の `max-w-5xl` を `max-w-7xl` に変更し、ページヘッダーも同期させる。

### D5. コンポーネント
- atoms/icons：`MonitorIcon`、`ServerIcon`、`CloudIcon`、`DatabaseIcon`、`PaletteIcon`（AI / ML は既存の `BrainIcon` を再利用する。先にレーダー SVG 内の脳のパスを atom として抽出する必要がある）。
- molecules：`CategoryNav`（props: `variant: 'list' | 'chips'`, `activeQuery`, `onSelect`）、`RankingList`（props: `title`, `hint?`, `items`, `status`, `error`, `onRetry`, `onViewAll`）。
- organisms：新設なし。`SearchResults` は変更しない。

### D6. テスト
単体：`decodeRecord`、`rankPopular`、`rankRising`（30 日境界と 7 日未満の退化を含む）、`useSnapshot` の欠落と期限切れの判定、`CategoryNav` の選択状態とクリックコールバック、`RankingList` の 3 状態と展開・折りたたみ。e2e：`public/data/` に小さな fixture スナップショットを置く（リポジトリと一緒にコミットし、実データがないときのプレースホルダーとする）。ワイド画面で 3 カラムが見える、ランキングが各 5 件で Rising に増分が表示される、分類クリック後の入力欄とリクエストパラメータ、ランキングが分類でフィルタされる、「すべて表示」で 30 件に展開される、狭い画面で分類が chip になり検索後にランキングが隠れる、fixture を削除すると「データなし」が表示される。

## Risks / Trade-offs

- [スナップショット稼働直後は系列が非常に短く、Rising Stars に意味がない] → 7 日未満では自動的に作成日近似に退化して注記を付け、7 日を満たしたら自動で切り替わる。
- [アンブレラ topic のカバー範囲には偏りがある。たとえば多くのフロントエンドライブラリは `frontend` タグを付けていない] → マッピングファイルで集中管理し、調整は 1 行の変更で済む。後続の change C のフィルタで補える。
- [データ commit とサイトデプロイの順序] → ランキングにデータ日付を表示し、3 日を超えて古ければ注意を出す。デプロイワークフローはデータ変更によるトリガーを許可する。
