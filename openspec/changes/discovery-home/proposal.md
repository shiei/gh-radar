# Proposal

## Why

项目定位为开源的技术雷达：观察技术市场、辅助选型。首页目前只有一个搜索框，既没有探索入口，也没有展示 `daily-snapshot` 积累的数据。这个 change 给首页一个三栏骨架，把六大分类做成一键探索入口，并用快照数据做出两个榜单：Most Popular 和基于真实 30 天增量的 Rising Stars。榜单读静态 JSON，不消耗 API 配额。

## What Changes

- 首页改为三栏布局：左栏导航（分类，后续放类型切换与筛选），中栏搜索与结果，右栏榜单。窄屏退化为单栏：分类变成横向 chip 行，榜单移到结果下方。标语与雷达插图保留在顶部。
- 新增分类映射文件：六个分类（Frontend、Backend、AI / ML、DevOps、Database、Design）各对应一条 GitHub 查询（以 topic 为主）、一个图标和三语名称。点击分类等同于提交该查询。
- 新增两个榜单，数据来自 `public/data/`：Most Popular 按快照中的 star 数排序；Rising Stars 按最近 30 天的 star 增量排序（序列不足 7 天时退化为近 90 天创建的仓库按 star 排序，并标注）。各取前 5 条，随当前分类过滤，带"查看全部"展开为前 30 条。榜单不发 API 请求。
- 榜单区显示数据日期；快照数据缺失或过期超过 3 天时显示提示，主检索不受影响。
- 当前分类高亮；在分类之外的检索不高亮任何分类。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `category-browse`: 分类的集合、每个分类对应的查询、导航的展示与点击行为。
- `rankings`: Most Popular 与 Rising Stars 两个榜单的定义、数据来源（快照）、增量计算、展示与"查看全部"。
- `discovery-layout`: 首页三栏布局在各断点下的结构，以及各区域放什么。

### Modified Capabilities

- `daily-snapshot`: 记录增加 owner 数字 id，用于直接拼头像 CDN 地址（2026-10-21 追加）。
- `ui-theme`: 首访默认改为夜间，不再跟随系统偏好（2026-10-21 布局与显示调整阶段追加）。

## Impact

- 依赖 `daily-snapshot` 提供的 `src/lib/categories.ts` 与 `public/data/`；新增 `src/lib/snapshot/`（读取与解码 JSON、计算增量）与 `src/lib/rankings.ts`（排序规则）。
- 新增 `CategoryNav`、`RankingList` 组件与六个分类图标，`HomePage` 改为三栏模板 `DiscoveryLayout`。
- 新增 `useSnapshot` hook（加载一次 `latest.json` 与所需 series，内存缓存）。
- 三份语言文件新增 `category.*`、`ranking.*` 键。
- 首页冷加载增加两个静态 JSON 请求，不消耗 GitHub API 配额。
