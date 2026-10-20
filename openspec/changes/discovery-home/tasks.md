# Tasks

## 1. 数据定义

- [ ] 1.1 为 `src/lib/categories.ts`（来自 daily-snapshot）补三语 `category.*` 键与图标引用，单元测试验证三语名称齐全
- [ ] 1.2 新增 `src/lib/snapshot/`（`loadSnapshot`、`loadSeries`、`decodeRecord`）与 `src/lib/rankings.ts`（`rankPopular`、`rankRising` 含 30 天增量与不足 7 天退化），单元测试覆盖解码、排序、边界与退化
- [ ] 1.3 新增 `src/features/rankings/useSnapshot.ts`（一次加载、内存缓存、缺失 / 过期判定），单元测试用 stub fetch 覆盖三种状态
- [ ] 1.4 在 `public/data/` 提交一份小型 fixture 快照（约 30 个仓库、14 天序列），作为无真实数据时的占位与 e2e 数据

## 2. 组件

- [ ] 2.1 抽出 `BrainIcon` atom 并新增 `MonitorIcon`、`ServerIcon`、`CloudIcon`、`DatabaseIcon`、`PaletteIcon`
- [ ] 2.2 实现 `CategoryNav` molecule（list / chips 两种形态、选中态、键盘可达），单元测试覆盖渲染六项、选中态匹配、点击回调
- [ ] 2.3 实现 `RankingList` molecule（名次、头像、名称链接、star、Rising 的 30 天增量、数据日期与过期提示、"查看全部"展开收起、退化模式标注），三语 `ranking.*` 键，单元测试覆盖正常 / 退化 / 缺失 / 过期与展开

## 3. 布局与接线

- [ ] 3.1 实现 `DiscoveryLayout` template（lg 三栏网格、以下单列），`AppShell` 与 `Header` 最大宽改为 `max-w-7xl`
- [ ] 3.2 改造 `HomePage`：分类点击调用 `submit`，`activeQuery` 传给 `CategoryNav`，榜单随选中分类过滤，窄屏仅在 idle 时显示榜单；单元测试验证点击分类后发起对应查询且榜单过滤
- [ ] 3.3 e2e `e2e/discovery.spec.ts`：1280px 三栏、榜单各 5 条且 Rising 带增量；点分类后输入框与请求 q、榜单随分类过滤；"查看全部"展开 30 条；600px 下分类为 chip、检索后榜单隐藏；拦截 `/data/latest.json` 返回 404 时显示"尚无数据"且检索正常

## 4. 收尾

- [ ] 4.1 `npm run check` 与 `npm run test:e2e` 通过；README 补充榜单定义（30 天增量、退化规则）；ROADMAP 勾选 B
