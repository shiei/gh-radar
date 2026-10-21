# Design

## Context

现状：`searchReducer` 的 state 是 `query / sort / page / status / result / error / requestId`；`useRepositorySearch` 每个 requestId 发一次 `searchRepositories`；缓存键 `query|sort|page`；`SearchResults` 只会渲染 `RepositoryCard`。左栏目前只有 `CategoryNav`。行为契约见本 change 的三份 delta spec。

## Goals / Non-Goals

**Goals:**
- 一个 reducer 管三种类型，不复制状态机。
- 筛选条件是数据（对象），qualifier 字符串只在构造 URL 时生成一次。
- 类型计数是附属请求：失败静默，不进主状态机。

**Non-Goals:**
- 不做 code / issues / commits 检索。
- 不做筛选条件的 URL 同步。
- 不做语言列表的动态获取；用固定的 20 种常用语言。

## Decisions

### D1. 类型与筛选进入 state
```ts
type SearchType = 'repositories' | 'users' | 'topics'
interface SearchFilters { language: string | null; minStars: 0 | 100 | 1000 | 10000; excludeForks: boolean; excludeArchived: boolean }
state += { type: SearchType; filters: SearchFilters }
actions += setType(type) | setFilters(partial)
```
`setType` / `setFilters` 的规则与 `setSort` 相同：无 query 只改状态，有 query 则 page=1 并发请求。`result` 改为按类型的判别联合：`{ type: 'repositories', ... } | { type: 'users', ... } | { type: 'topics', ... }`，`SearchResults` 按 `result.type` 选卡片。

### D2. 查询合成 `composeQuery(query, filters)`
`[query, language && \`language:${language}\`, minStars > 0 && \`stars:>=${minStars}\`, excludeForks && 'fork:false', excludeArchived && 'archived:false'].filter(Boolean).join(' ')`。语言值用 GitHub 的 `language:` 可识别写法（含空格的加引号，如 `"c++"` 不需要、`"jupyter notebook"` 需要）。筛选只对 repositories 生效；users / topics 的 q 就是原查询。

### D3. API 层
`searchUsers` → `GET /search/users`，裁剪为 `{ login, avatarUrl, htmlUrl, kind: 'User' | 'Organization' }`；`searchTopics` → `GET /search/topics`，裁剪为 `{ name, displayName, description, featured, curated }`。两者复用 `request()` 与配额处理。`per_page=10`，上限 1000 条同仓库。缓存键 `${type}|${composedQuery}|${sort}|${page}`，由 `cacheKey` 统一生成。

### D4. 类型计数
`useTypeCounts(query, token)`：仅当 `getToken()` 非空且 query 非空时，对另外两种类型各发 `per_page=1` 的请求读 `total_count`，结果存 hook 内 state，键为 query；失败或无 token 返回 null。独立于主 reducer，不影响 loading 状态。

### D5. 组件
- `SearchTypeTabs`（molecule）：三段切换，按钮文案 + 可选计数，`aria-pressed`。放在 `SearchBar` 上方一行。
- `SearchFilters`（molecule）：语言 `SelectField`、最低 star `SelectField`、两个开关（Base UI Switch 复用 ThemeToggle 的样式基础）、"清除"按钮；props 为 `filters / onChange / variant: 'panel' | 'collapsible'`。
- `UserCard`、`TopicCard`（molecule）。
- `SearchResults` 接收 `onLanguageClick` 与 `onTopicClick`（后者已有）。
- `RepositoryCard` 的语言 span 变为 `TagButton`，有回调时可点击。
- 布局：`DiscoveryLayout` 的 `sidebar` slot 变为 `CategoryNav` + `SearchFilters(panel)`；`chips` slot 下方加 `SearchFilters(collapsible)`。

### D6. 语言列表
JavaScript, TypeScript, Python, Go, Rust, Java, Kotlin, Swift, C, C++, C#, Ruby, PHP, Dart, Scala, Elixir, Haskell, Lua, Shell, Jupyter Notebook。值与 GitHub 语言名一致；显示名不翻译。

### D7. 测试
单元：`composeQuery`（含引号）、reducer 的 setType / setFilters 规则、`searchUsers` / `searchTopics` 的 URL 与裁剪、`useTypeCounts` 有无 token、`SearchFilters` 交互、`UserCard` / `TopicCard`、`RepositoryCard` 语言点击。e2e：切换到 Users 显示用户卡片且 URL 为 `/search/users`；Topics 卡片点击回到仓库并带 `topic:`；设置筛选后请求 q 含 qualifier 且输入框不变；有 token 时按钮显示计数、无 token 时只发一次请求；600px 下筛选折叠且显示生效数。

## Risks / Trade-offs

- [有 token 时每次检索 3 次请求，30 次/分钟的额度下约 10 次检索/分钟] → 计数只在 token 存在时发；缓存覆盖重复查询；页头仍显示剩余配额。
- [`/search/topics` 的 `total_count` 不受 1000 条限制影响但分页上限同样是 1000] → 沿用 `maxPage`。
- [语言筛选与用户自己写的 `language:` 冲突] → 两者都发给 GitHub，GitHub 按 AND 处理返回空结果；筛选面板显示生效条件，用户能看出来。不做去重。
