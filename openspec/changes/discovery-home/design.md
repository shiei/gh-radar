# Design

## Context

现状：`HomePage` 纵向堆叠标语、搜索框、示例、结果；`AppShell` 的内容区最大宽 `max-w-5xl`（1024px）；搜索提交统一走 `useRepositorySearch().submit`，topic 标签和示例 chip 都复用它；`searchCache` 按 `query|sort|page` 缓存 5 分钟。行为契约见本 change 的三份 delta spec。

## Goals / Non-Goals

**Goals:**
- 分类与榜单都只是"预设查询 + 调 submit"，不引入第二套检索状态。
- 榜单只读静态快照，不消耗配额，也不依赖主检索的状态。
- 布局用 CSS Grid 一处定义断点，组件不感知布局。

**Non-Goals:**
- 不做类型切换、筛选器（change C）。
- 不做分类的二级结构。
- 不做榜单的时间范围切换。

## Decisions

### D1. 分类映射 `src/lib/categories.ts`
```ts
interface Category { id: 'frontend'|'backend'|'ai-ml'|'devops'|'database'|'design'; query: string; icon: IconComponent }
```
名称在语言文件 `category.<id>`。查询用单个伞形 topic 加 star 下限，避免多 topic 的 AND 语义把结果收得太窄：
| id | query |
|----|-------|
| frontend | `topic:frontend stars:>200` |
| backend | `topic:backend stars:>200` |
| ai-ml | `topic:machine-learning stars:>200` |
| devops | `topic:devops stars:>200` |
| database | `topic:database stars:>200` |
| design | `topic:design-system stars:>100` |
备选是每个分类列多个 topic；GitHub 仓库检索里多个 `topic:` 是 AND，没有 OR，所以放弃。伞形 topic 在 GitHub 上都是热门标签，结果量足够。

### D2. 选中态
`CategoryNav` 接收 `activeQuery`（来自 `state.query`），与各分类 `query` 严格相等即选中。不做模糊匹配。

### D3. 快照读取与榜单 `src/lib/snapshot/` 与 `src/lib/rankings.ts`
`loadSnapshot()` 取 `/data/meta.json` 与 `/data/latest.json`，`loadSeries(category)` 按需取 `/data/series/<id>.json`，全部内存缓存一次。`decodeRecord` 把单字母键展开。`rankPopular(repos, category?)` 与 `rankRising(repos, series, today, category?)` 是纯函数：rising 的增量 = 今日 star 减去 `today-30d` 之前最近一个点的 star；序列跨度不足 7 天时返回 `{ mode: 'fallback' }` 并按创建日期近似。`useSnapshot()` hook 暴露 status / meta / repos / series 与 `stale`（超过 3 天）。榜单不发任何 GitHub 请求。

### D4. 布局 `DiscoveryLayout` template
```
lg 及以上:  grid-cols-[14rem_minmax(0,1fr)_18rem] gap-8   max-w-7xl
lg 以下:    单列 flex-col
```
`HomePage` 把 hero、`CategoryNav`、搜索区、`SearchResults`、两个 `RankingList` 作为 slot 传给模板；模板决定在哪个断点把 `CategoryNav` 渲染成纵向列表还是 chip 行（通过 `variant` prop），把榜单放右栏还是放结果下方（窄屏且 `state.status === 'idle'` 才显示）。`AppShell` 的 `max-w-5xl` 改为 `max-w-7xl`，页头同步。

### D5. 组件
- atoms/icons：`MonitorIcon`、`ServerIcon`、`CloudIcon`、`DatabaseIcon`、`PaletteIcon`（AI / ML 复用现有 `BrainIcon`，需要先把雷达 SVG 里的脑子路径抽成 atom）。
- molecules：`CategoryNav`（props: `variant: 'list' | 'chips'`, `activeQuery`, `onSelect`）、`RankingList`（props: `title`, `hint?`, `items`, `status`, `error`, `onRetry`, `onViewAll`）。
- organisms：无新增；`SearchResults` 不变。

### D6. 测试
单元：`decodeRecord`、`rankPopular`、`rankRising`（含 30 天边界与不足 7 天的退化）、`useSnapshot` 的缺失与过期判定、`CategoryNav` 的选中态与点击回调、`RankingList` 三态与展开收起。e2e：`public/data/` 放一份小型 fixture 快照（随仓库提交，作为无真实数据时的占位）；宽屏三栏可见、榜单各 5 条且 Rising 显示增量、点分类后输入框与请求参数、榜单随分类过滤、"查看全部"展开 30 条、窄屏下分类为 chip 且检索后榜单隐藏、删掉 fixture 时显示"尚无数据"。

## Risks / Trade-offs

- [快照刚上线时序列很短，Rising Stars 没有意义] → 不足 7 天自动退化为创建日期近似并标注；满 7 天后自动切换。
- [伞形 topic 的覆盖有偏差，例如很多前端库不打 `frontend` 标签] → 映射文件集中维护，调整只改一行；后续 change C 的筛选器可以补充。
- [数据 commit 与站点部署的时序] → 榜单显示数据日期，过期超过 3 天提示；部署工作流允许数据变更触发。
