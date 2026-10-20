# OpenSource Radar

一个帮助开发者发现、评估、比较开源项目的纯前端站点。数据直接来自 GitHub REST API，没有后端。

当前状态：工程地基（主题、多语言、测试与代码质量工具）和仓库检索已完成。后续功能按 `openspec/changes/` 中的 change 逐个推进，整体待办见 `ROADMAP.md`。

## 技术栈

- React 19 + Vite 8 + TypeScript 6
- Tailwind CSS 4，视觉规范由 `src/styles/tokens.css` 中的 Design Tokens 统一定义
- Base UI 作为无样式组件基础，按 Atomic Design 分层
- i18next：英文（默认）、日文、中文
- Vitest + Testing Library 做单元测试，Playwright 做端到端测试
- ESLint、Prettier、Stylelint、`tsc` 做静态检查

## 快速开始

```bash
npm install
npx playwright install chromium   # 只在第一次或升级 Playwright 后需要
npm run dev
```

## npm scripts

| 命令                   | 作用                                                    |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | 启动开发服务器                                          |
| `npm run build`        | 类型检查并构建到 `dist/`                                |
| `npm run preview`      | 本地预览构建产物                                        |
| `npm run typecheck`    | `tsc -b --noEmit`                                       |
| `npm run lint`         | 依次运行 `lint:js`（ESLint）和 `lint:css`（Stylelint）  |
| `npm run format`       | Prettier 格式化全部文件                                 |
| `npm run format:check` | 只检查不修改                                            |
| `npm run test`         | Vitest 单元测试（单次运行）                             |
| `npm run test:e2e`     | Playwright 端到端测试，会先构建再用 `vite preview` 启动 |
| `npm run check`        | typecheck + lint + format:check + test，提交前跑这个    |

`check` 不包含 e2e，e2e 请单独运行。

## 目录结构

```
src/
  app/            应用入口与 Provider 组合
  components/
    atoms/        最小 UI 单元（Button、Text、icons/）
    molecules/    atoms 组合（ThemeToggle、LanguageSwitcher）
    organisms/    页面区块（Header）
    templates/    页面布局骨架（AppShell）
  pages/          页面（HomePage）
  features/
    search/       检索状态机：searchReducer（纯函数）与 useRepositorySearch（hook）
  lib/
    github/       GitHub REST 访问层：请求头、错误分类、配额解析、search 端点（不依赖 React）
    format/       Intl 封装：紧凑数字、相对时间、时刻
    theme/        主题解析、持久化、ThemeProvider / useTheme
    i18n/         i18next 初始化、语言持久化、键类型扩展
    cx.ts         class 名拼接
  locales/        en.json / ja.json / zh.json
  styles/         tokens.css（Design Tokens）、globals.css（Tailwind 映射与基础样式）
  test/           Vitest setup
e2e/              Playwright 测试
  fixtures/       mock 的 GitHub 响应
  helpers/        共享 test（含 GitHub 请求兜底拦截）与 mock 工具
openspec/         规划文件（proposal / specs / design / tasks）
```

分层约定：`components/` 只放 UI（Atomic Design）；不依赖 React 的代码放 `lib/`；某个功能的 React 状态逻辑放 `features/<name>/`。

## GitHub API 与配额

检索直接从浏览器调用 `https://api.github.com/search/repositories`。未认证配额为每分钟 10 次 search 请求、每小时每个出口 IP 60 次请求；配额用尽时界面会显示恢复时刻。

页头的 "Connect GitHub" 可以配置个人 token：只保存在本浏览器的 `localStorage['osr.token']`，只发往 `api.github.com`，保存前用 `GET /rate_limit` 校验（不计配额）。配置后 search 配额提到每分钟 30 次，页头显示剩余次数。建议创建只读的 fine-grained token。

相同的查询、排序、页码在会话内缓存 5 分钟，命中不发请求，刷新页面即失效。

### e2e 的 mock 约定

所有 Playwright 用例都从 `e2e/helpers/test.ts` 导入 `test`。它为每个页面自动挂一条 abort 所有 `api.github.com` 请求的兜底 route，任何用例都不会打到真实 API。需要响应时用 `e2e/helpers/mockGitHub.ts` 的 `mockSearch` / `mockSearchByPage` 返回 `e2e/fixtures/` 里的 JSON；用例自己注册的 route 优先于兜底。

`e2e/fixtures/search-react.json` 来自一次真实响应，只保留了界面用到的字段。

## 约定

### 新增界面文案

1. 在 `src/locales/en.json`、`ja.json`、`zh.json` 三个文件中都加上同一个键。
2. 组件中用 `useTranslation()` 的 `t('your.key')` 引用。键名由 `en.json` 推导出类型，写错会在 `typecheck` 阶段报错。
3. `src/locales/locales.test.ts` 会断言三份文件的键集合完全一致，少一份就会失败。
4. 组件里不允许出现硬编码的用户可见文案。

### 新增 Design Token

1. 在 `src/styles/tokens.css` 的 `:root` 中加日间值，在 `[data-theme='dark']` 中加夜间值。
2. 在 `src/styles/globals.css` 的 `@theme inline` 中把它映射成 Tailwind 工具类，例如 `--color-foo: var(--foo)` 生成 `bg-foo` / `text-foo`。
3. 组件只使用语义类（`bg-surface`、`text-text-muted`、`border-border` 等），不写原始颜色。

### 主题与语言的持久化键

| 键                          | 取值               |
| --------------------------- | ------------------ |
| `localStorage['osr.theme']` | `light` / `dark`   |
| `localStorage['osr.lang']`  | `en` / `ja` / `zh` |

主题在 `index.html` 的内联脚本中于首次绘制前应用，修改 `src/lib/theme/constants.ts` 时需同步该脚本。
