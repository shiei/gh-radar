# Proposal

## Why

检索目前只能找仓库，而 GitHub 的 Search API 还有 users 和 topics 两类对"发现技术"有用的对象；同时普通用户不会写 `language:rust stars:>500` 这样的 qualifier，分类导航只覆盖了六个入口。这个 change 把检索扩展到三种类型，并提供结构化筛选器由程序拼出 qualifier，让手写语法退化为高级用法。这是第二阶段的最后一个 change。

## What Changes

- 搜索框旁新增类型切换：Repositories（默认）、Users、Topics。切换类型会以当前查询重新检索第 1 页；三种类型各有自己的结果卡片。
- 已配置 token 时，类型切换上显示另外两种类型的匹配数（各多一次请求）；未配置时不显示，不额外消耗配额。
- 仓库检索新增筛选器：主语言（固定列表）、最低 star（任意 / 100 / 1k / 10k）、排除 fork、排除归档。筛选器由程序拼成 qualifier 追加到用户的查询之后，输入框内容不变；宽屏放左栏分类下方，窄屏放搜索框下方可折叠。
- 结果卡片上的语言文字变为可点击，点击等同于设置语言筛选。
- Topics 结果卡片的名称可点击，等同于在仓库类型下检索 `topic:<name>`。
- 会话缓存的键加入类型与筛选条件。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `search-types`: 三种检索类型的切换、各自的请求与结果呈现、匹配数的显示规则。
- `search-filters`: 仓库筛选器的项目、取值、与查询的合成规则、在布局中的位置。

### Modified Capabilities

- `repository-search`: 语言文字可点击；缓存键包含类型与筛选条件。

## Impact

- `src/lib/github/`：新增 `searchUsers`、`searchTopics` 与对应类型；`search.ts` 的 URL 构造接受筛选条件。
- `src/features/search/`：reducer 增加 `type` 与 `filters`；hook 按类型调用；缓存键扩展。
- 新增 `SearchTypeTabs`、`SearchFilters`、`UserCard`、`TopicCard` 组件；`SearchResults` 按类型渲染。
- 三份语言文件新增 `search.type.*`、`search.filters.*` 键。
- 外部依赖仍是 GitHub REST API；有 token 时每次检索最多 3 次请求。
