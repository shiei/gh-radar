# Tasks

## 1. 数据与状态

- [x] 1.1 `src/lib/github/`：新增 `types.ts` 的 `SearchType`、`SearchFilters`、`UserResult`、`TopicResult`；`composeQuery()`；`searchUsers()`、`searchTopics()`；`buildSearchPath` 接受类型与筛选；单元测试覆盖合成（含引号）、三种 URL、两种裁剪
- [x] 1.2 `searchReducer`：state 加 `type` 与 `filters`，action 加 `setType` / `setFilters`，`result` 改为按类型判别；单元测试覆盖两种 action 的"无 query 只记、有 query 重查第 1 页"
- [x] 1.3 `useRepositorySearch`：按类型调用，缓存键含类型与合成查询，暴露 `setType` / `setFilters`；`searchCache` 的 `cacheKey` 扩展；单元测试验证切换类型发对应端点
- [x] 1.4 `src/features/search/useTypeCounts.ts`：有 token 且有 query 时取另外两类的 `total_count`；单元测试覆盖有 / 无 token 与失败静默

## 2. 组件

- [x] 2.1 三份语言文件新增 `search.type.*`、`search.filters.*`、`search.user.*`、`search.topic.*` 键，语言列表常量 `src/lib/languages.ts`
- [x] 2.2 `SearchTypeTabs` molecule（三段、可选计数、aria-pressed），单元测试
- [x] 2.3 `SearchFilters` molecule（panel / collapsible 两种形态、生效条件数、清除），单元测试覆盖每个控件的回调与折叠计数
- [x] 2.4 `UserCard` 与 `TopicCard` molecule，`RepositoryCard` 语言可点击，`SearchResults` 按类型渲染并透传回调；单元测试

## 3. 接线与 e2e

- [x] 3.1 `HomePage`：类型切换放在搜索框上方，筛选器进左栏（panel）与窄屏折叠区（collapsible），语言点击与 topic 点击接到 hook；分类点击时类型切回 repositories
- [x] 3.2 e2e `e2e/facets.spec.ts`：Users / Topics 切换与卡片、Topic 点击回到仓库、筛选 qualifier 与输入框不变、语言点击、有 / 无 token 的计数、600px 折叠；fixture 增加 users 与 topics 响应

## 4. 收尾

- [x] 4.1 `npm run check` 与 `npm run test:e2e` 通过；`docs/development.md` 补充类型与筛选的说明；ROADMAP 勾选 C
