# OpenSource Radar

一个帮助开发者发现、评估、比较开源项目的纯前端站点。数据直接来自 GitHub REST API，没有后端。

当前状态：工程地基已完成（主题、多语言、测试与代码质量工具）。检索等业务功能按 `openspec/changes/` 中的 change 逐个推进。

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
  lib/
    theme/        主题解析、持久化、ThemeProvider / useTheme
    i18n/         i18next 初始化、语言持久化、键类型扩展
    cx.ts         class 名拼接
  locales/        en.json / ja.json / zh.json
  styles/         tokens.css（Design Tokens）、globals.css（Tailwind 映射与基础样式）
  test/           Vitest setup
e2e/              Playwright 测试
openspec/         规划文件（proposal / specs / design / tasks）
```

新组件必须落在 Atomic Design 的某一层；非 UI 逻辑放 `src/lib/`。

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
