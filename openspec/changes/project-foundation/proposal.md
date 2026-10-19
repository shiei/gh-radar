# Proposal

## Why

项目目前只有一份需求备忘和三张布局草图，没有任何代码。后续的检索、分类、排行榜等功能都依赖同一套视觉规范（Design Tokens 驱动的日/夜主题）、同一套多语言机制和同一套测试与代码质量工具。先把这层地基单独落地并验证，后面每个业务 change 才能保持小而可审查。

## What Changes

- 新建 React + Vite + TypeScript 单页应用骨架，纯前端，无后端。
- 引入 Tailwind CSS，以 Design Tokens（CSS 变量）作为唯一的视觉规范来源，供样式和组件消费。
- 实现日间 / 夜间两套外观，用户可手动切换，选择持久化在浏览器本地。
- 实现多语言机制，支持英文、日文、中文，默认英文；所有界面文案集中放在语言文件中，用户可随时切换。
- 引入 Base UI 作为无样式组件库，按 Atomic Design（atoms / molecules / organisms / templates / pages）组织 UI 组件目录。
- 配置 Vitest 单元测试与 Playwright 端到端测试，并各带一个最小示例用例验证管线可用。
- 配置 ESLint、Prettier、Stylelint 以及 TypeScript 类型检查，提供统一的 npm scripts。
- 图标统一使用 SVG 组件。
- 提供一个仅包含应用外壳（页头、主题切换、语言切换）的首页，不含任何业务功能。
- 本 change 完成后单独 git commit。

## Capabilities

### New Capabilities

- `ui-theme`: 日间 / 夜间外观的定义、切换与持久化。Design Tokens 是其实现基础，但 spec 只描述用户可观察的行为。
- `localization`: 界面语言的可用集合、默认语言、切换行为与文案来源。

### Modified Capabilities

（无。项目尚无已有 spec。）

## Impact

- 新增整个前端工程：`package.json`、Vite 配置、Tailwind 配置、tokens 文件、i18n 语言文件、组件目录、测试目录、lint 与格式化配置。
- 新增 npm scripts：dev、build、test、test:e2e、lint、format、typecheck。
- 无外部服务依赖，无 API 调用。
- 为后续 change 定下约束：所有颜色、间距、字号必须来自 tokens；所有用户可见文案必须来自语言文件；新组件必须落在 Atomic Design 的某一层。
