# Design

## Context

绿地项目，实施前目录中只有 OpenSpec 规划文件和需求备忘，没有任何代码。动机见 proposal.md 的 Why。本机工具链：Node 24、npm 11、macOS 12，没有安装 pnpm。

实施时实际锁定的版本（与规划时的差异已标注）：

| 依赖 | 版本 | 备注 |
|------|------|------|
| vite / @vitejs/plugin-react | 8.3.4 / 6.1.2 | 与规划一致 |
| react / react-dom | 19.3.1 | |
| typescript | 6.0.3 | create-vite 9.2 模板默认 TS 6 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | |
| @base-ui-components/react | 1.0.0-rc.0 | `latest` 标签，精确锁定 |
| i18next / react-i18next | 26.5.2 / 17.1.0 | |
| vitest / jsdom | 5.0.5 / 30.1.3 | |
| @playwright/test | **1.56.1** | 规划为 1.64，但 1.64 拒绝在 macOS 12 上安装 Chromium；1.56.1 是能在本机安装并运行的最新版本 |
| eslint / typescript-eslint | 10.13.0 / 8.71.2 | create-vite 9 模板默认 oxlint，已移除并按 D9 改用 ESLint |
| stylelint / stylelint-config-standard | 17.16.0 / 40.0.0 | |
| prettier / prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 | |

行为契约见 `specs/ui-theme/spec.md` 和 `specs/localization/spec.md`，本文不重复。

## Goals / Non-Goals

**Goals:**

- 一处定义视觉规范（tokens），组件只消费语义化的 token，不碰原始颜色值。
- 主题和语言的"选择、持久化、初始化"逻辑与 UI 组件解耦，后续 change 可以直接复用。
- 所有质量门禁（typecheck、lint、format、unit、e2e）都能用一条命令跑通，并在脚手架阶段就是绿的。
- 目录结构在第一天就定下来，后续 change 不需要再搬文件。

**Non-Goals:**

- 不做路由。首页是唯一页面，路由在需要第二个页面的 change 再引入。
- 不做响应式断点以外的移动端适配细节。
- 不引入状态管理库。
- 不配置 CI。本 change 只保证本地命令可用。

## Decisions

### D1. 包管理器用 npm

本机只有 npm。提交 `package-lock.json`。不引入 pnpm 以免多一个环境前提。

### D2. 目录结构

```
src/
  app/            应用入口与 Provider 组合 (App.tsx, providers.tsx)
  components/
    atoms/        最小 UI 单元: Button, Icon(SVG), Text ...
    molecules/    atoms 组合: ThemeToggle, LanguageSwitcher
    organisms/    页面区块: Header
    templates/    页面布局骨架: AppShell
  pages/          HomePage
  lib/
    theme/        主题读取/写入/初始化逻辑 + useTheme
    i18n/         i18next 初始化 + 语言持久化
  locales/        en.json ja.json zh.json
  styles/         tokens.css, globals.css
  test/           Vitest setup
e2e/              Playwright 测试
```

Atomic Design 只管 `components/` 和 `pages/`；非 UI 逻辑放 `lib/`，避免把 hook 塞进组件层。备选是 feature-based 目录（`features/theme/` 同时放逻辑和组件），放弃原因是需求明确要求 Atomic Design 分层，两套并存会让人不知道组件该放哪。

### D3. Tailwind v4 + CSS 变量 tokens，不用 `dark:` 变体

- `src/styles/tokens.css` 用 `:root` 定义日间 token，用 `[data-theme="dark"]` 覆盖夜间 token。token 名是语义化的（`--color-surface`、`--color-text`、`--color-border`、`--color-accent` 等），不是颜色名。
- 通过 Tailwind v4 的 `@theme inline` 把这些变量映射成工具类（`bg-surface`、`text-text`），组件只用这些语义类。
- 间距、圆角、字号同样在 `@theme` 中声明为 token。
- 集成方式用官方 `@tailwindcss/vite` 插件，不走 PostCSS。

备选是 Tailwind 的 `dark:` class 变体，每个组件写两遍颜色。放弃原因：颜色散落在组件里，和"tokens 是唯一视觉规范来源"冲突，也无法支持未来第三套主题。

### D4. 主题状态：`<html data-theme>` + localStorage + 首屏内联脚本

- 激活主题由 `<html>` 的 `data-theme` 属性表示，值为 `light` 或 `dark`。CSS 只依赖这个属性。
- 持久化键 `osr.theme`，值同上。未保存时按 `prefers-color-scheme` 决定，无法判断时 `light`。
- `index.html` 的 `<head>` 中放一段不依赖任何模块的内联脚本，在首次绘制前完成上述解析并设置属性，满足"不闪烁"要求。
- React 侧 `lib/theme` 提供 `ThemeProvider` 和 `useTheme()`，切换时同时更新属性和 localStorage。内联脚本和 React 侧共用同一套解析规则，规则抽成纯函数并有单元测试；内联脚本因为不能 import，保持极短并由 e2e 覆盖。

备选是只在 React 挂载后设置主题，放弃原因是刷新时必然有一帧错误主题。

### D5. i18n 用 i18next + react-i18next，资源静态打包

- 三份 JSON 在 `src/locales/`，构建时静态 import，不用 http backend。
- 不装语言检测插件。初始语言：localStorage 键 `osr.lang` 有值则用，否则 `en`。这是需求明确要求的"默认英文"，不是遗漏。
- 切换语言时同步 `document.documentElement.lang`。
- 用 i18next 的 TypeScript 模块扩展，以 `en.json` 作为键的类型来源，组件里写错键名在 typecheck 阶段报错。
- 键集合一致性由一个 Vitest 用例保证：读入三份 JSON，断言扁平化后的键集合完全相等。这就是 spec 里"缺失翻译可被自动检测"的实现。

备选是手写一个 Context + 对象查表。放弃原因：后续检索结果页会需要插值和复数，到时再迁移成本更高。

### D6. Base UI 作为无样式组件基础

- 包名 `@base-ui-components/react`，锁定实施当天 `latest` 解析到的精确版本。
- ThemeToggle 基于 Base UI 的 Switch 或 Toggle；LanguageSwitcher 基于 Base UI 的 Select。
- 所有 Base UI 组件都包在我们自己的 atom 或 molecule 里，页面和 organism 不直接 import Base UI。这样 rc 版本的 API 变化只影响几个文件。

### D7. 图标：手写 SVG React 组件

`components/atoms/icons/` 下每个图标一个组件，使用 `currentColor`，默认 `aria-hidden="true"`，可通过 props 指定尺寸和可访问标签。不引入图标库，需求明确说先用 SVG。

### D8. 测试

- 单元：Vitest + jsdom + Testing Library（react、jest-dom、user-event）。`src/test/setup.ts` 注册 jest-dom 匹配器。
- 端到端：Playwright，只安装 Chromium。版本锁定 1.56.1（见 Context 表格，macOS 12 限制）；升级机器系统后可以跟进最新版。`playwright.config.ts` 的 `webServer` 先 `vite build` 再 `vite preview`，测试打的是生产构建，更接近真实行为。
- 两种测试各带至少一个真实用例（主题持久化、语言切换），不是空壳。

### D9. 代码质量工具

- ESLint 10 flat config：`@eslint/js`、`typescript-eslint`（type-checked 规则集）、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`、`eslint-config-prettier` 关掉格式类规则。
- Prettier + `prettier-plugin-tailwindcss` 排序 class。
- Stylelint 17 + `stylelint-config-standard`，`at-rule-no-unknown` 忽略 Tailwind v4 的 `@theme`、`@utility`、`@variant`、`@custom-variant`、`@apply`、`@source`、`@plugin`。
- Typecheck 用 `tsc -b --noEmit`，TS 开 `strict` 和 `noUncheckedIndexedAccess`。
- npm scripts：`dev`、`build`、`preview`、`typecheck`、`lint`（eslint + stylelint）、`format`、`format:check`、`test`、`test:e2e`、`check`（typecheck + lint + format:check + test）。

### D10. 应用外壳

`AppShell` 模板 = `Header` organism + 内容区。`Header` 含品牌名（来自语言文件的 `app.name` 键）、`ThemeToggle`、`LanguageSwitcher`。`HomePage` 只放一段来自语言文件的欢迎文案。

## Risks / Trade-offs

- [Base UI 仍是 rc，API 可能变] → 锁定精确版本；所有用法集中在 atom/molecule 层；升级时只改那几个文件。
- [Vite 8 刚发布，个别插件可能不兼容] → 实施验证：`@vitejs/plugin-react` 6.1 与 `@tailwindcss/vite` 4.3 在 Vite 8.3 下构建、测试均正常，未退回 Vite 7。
- [npm audit 报告 7 个 high] → 全部来自 Stylelint 依赖链中的 `braces` / `micromatch` 正则栈耗尽问题，仅影响本地开发工具，没有不降级 Stylelint 的修复方案，暂不处理。
- [Stylelint 不认识 Tailwind v4 at-rules] → D9 的 ignoreAtRules 列表；如仍报错优先调整配置而不是关规则。
- [内联主题脚本不走模块系统，容易和 React 侧逻辑漂移] → 解析规则极简（三行判断），两边共用的键名和取值写在一个常量文件里，e2e 覆盖"刷新无闪烁"。
- [Playwright 首次安装下载浏览器较慢] → 只装 Chromium；`test:e2e` 不进 `check` 脚本，单独运行。
- [i18next 类型扩展在键很多时会拖慢 tsc] → 当前键很少，暂不处理；若将来变慢改成按命名空间拆分。

## Open Questions

- 产品名尚未在 "GitHub Discovery" 与 "OpenSource Radar" 之间定下。本 change 用 "OpenSource Radar" 作为 `app.name` 的占位值，改名只需改三份语言文件各一行，不影响任何 spec 或任务。
