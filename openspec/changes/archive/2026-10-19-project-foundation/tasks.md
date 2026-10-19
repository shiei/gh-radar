# Tasks

## 1. 工程骨架

- [x] 1.1 用 `npm create vite@latest` 的 react-ts 模板在仓库根目录生成项目，升级 tsconfig 为 `strict` + `noUncheckedIndexedAccess`，并验证 `npm run build` 成功
- [x] 1.2 按 design.md D2 创建 `src/app`、`src/components/{atoms,molecules,organisms,templates}`、`src/pages`、`src/lib/{theme,i18n}`、`src/locales`、`src/styles`、`src/test`、`e2e` 目录（空目录放 `.gitkeep`），并验证 `tree src e2e` 与设计一致
- [x] 1.3 扩展 `.gitignore`（node_modules、dist、coverage、playwright-report、test-results、.env*），保留已有条目，并验证 `git status` 不出现构建产物
- [x] 1.4 删除模板自带的示例组件、样式和资源，保留一个渲染空 `App` 的 `main.tsx`，并验证 `npm run dev` 启动后页面无报错

## 2. 代码质量工具

- [x] 2.1 安装并配置 ESLint 10 flat config（design.md D9 列出的插件），添加 `lint:js` 脚本，并验证对当前代码运行无错误
- [x] 2.2 安装 Prettier 与 `prettier-plugin-tailwindcss`，添加 `.prettierrc` 和 `format` / `format:check` 脚本，并验证 `format:check` 通过
- [x] 2.3 安装 Stylelint 17 与 `stylelint-config-standard`，配置 Tailwind v4 at-rules 忽略列表，添加 `lint:css` 脚本，并验证对 `src/styles` 运行无错误
- [x] 2.4 添加 `typecheck`（`tsc -b --noEmit`）、`lint`（js + css）和 `check`（typecheck + lint + format:check + test）脚本，并验证 `npm run check` 在当前状态下通过（test 阶段允许暂时无用例）

## 3. Tailwind 与 Design Tokens

- [x] 3.1 安装 `tailwindcss` 与 `@tailwindcss/vite`，在 `vite.config.ts` 注册插件，创建 `src/styles/globals.css` 引入 Tailwind，并验证构建产物含 Tailwind 基础样式
- [x] 3.2 创建 `src/styles/tokens.css`：`:root` 定义日间语义 token（surface、surface-muted、text、text-muted、border、accent、accent-text 等），`[data-theme="dark"]` 覆盖夜间值，并验证 `npm run lint:css` 通过
- [x] 3.3 在 `globals.css` 用 `@theme inline` 把 token 映射为 Tailwind 工具类，并把间距、圆角、字号 token 也声明在 `@theme` 中，验证 `bg-surface text-text` 等类在构建产物中生成
- [x] 3.4 在 `src/components/atoms/` 写一个使用语义类的 `Text` atom 和一个 `Button` atom，用 Vitest + Testing Library 验证它们渲染并带有预期的 class

## 4. 主题（对应 specs/ui-theme）

- [x] 4.1 创建 `src/lib/theme/constants.ts`（存储键 `osr.theme`、取值 `light` / `dark`、属性名）和 `resolveInitialTheme(stored, prefersDark)` 纯函数，用 Vitest 覆盖"已存储优先 / 无存储跟随系统 / 系统未知默认 light"三条
- [x] 4.2 在 `index.html` 的 `<head>` 加入内联脚本，在首次绘制前按同样规则设置 `<html data-theme>`，并验证构建后的 HTML 包含该脚本且位于样式表之前
- [x] 4.3 实现 `ThemeProvider` 与 `useTheme()`（读取当前值、`toggle()`、`setTheme()`，写入属性与 localStorage），用 Vitest 验证切换后属性和 localStorage 同步更新
- [x] 4.4 安装 `@base-ui-components/react`（锁定精确版本并在 design.md 的 Context 中记录），创建 `SunIcon` / `MoonIcon` SVG atoms，实现 `ThemeToggle` molecule（含可访问名称，支持键盘 Enter / Space），用 Vitest 验证点击与键盘操作都会切换主题
- [x] 4.5 写 Playwright 用例 `e2e/theme.spec.ts`：首次访问按系统偏好（用 `emulateMedia`）、切换为 dark 后刷新仍为 dark、刷新时 `domcontentloaded` 时刻 `data-theme` 已正确，并验证 `npm run test:e2e` 通过（本任务同时完成 Playwright 安装与 `playwright.config.ts`，webServer 使用 build + preview）

## 5. 多语言（对应 specs/localization）

- [x] 5.1 创建 `src/locales/en.json`、`ja.json`、`zh.json`，初始键包含 `app.name`、`app.tagline`、`theme.toggle.*`、`language.label`、`language.names.*`、`home.welcome`，并写 Vitest 用例断言三份文件扁平化键集合完全相等
- [x] 5.2 安装 `i18next` 与 `react-i18next`，创建 `src/lib/i18n/index.ts`（静态加载三份资源、无检测插件、初始语言 = localStorage `osr.lang` 或 `en`、切换时写回 localStorage 并更新 `document.documentElement.lang`），并用 Vitest 验证默认 en、持久化读取、切换后 `lang` 属性更新
- [x] 5.3 添加 i18next 类型扩展，以 `en.json` 为键类型来源，并验证在组件中引用不存在的键时 `npm run typecheck` 报错（验证后删除该错误引用）
- [x] 5.4 实现 `LanguageSwitcher` molecule（基于 Base UI Select，选项显示各语言的本地名称 English / 日本語 / 中文，带可访问名称，支持键盘操作），用 Vitest 验证选择后界面文案变化
- [x] 5.5 写 Playwright 用例 `e2e/language.spec.ts`：首次访问为英文（浏览器 locale 设为 ja 时仍为英文）、切换为中文后页头文案为中文且 `<html lang>` 为 zh、刷新后仍为中文，并验证通过

## 6. 应用外壳

- [x] 6.1 实现 `Header` organism（品牌名来自 `app.name`、`ThemeToggle`、`LanguageSwitcher`）和 `AppShell` template，用 Vitest 验证 Header 渲染三部分
- [x] 6.2 实现 `HomePage`（仅显示 `app.tagline` 与 `home.welcome`），在 `src/app/App.tsx` 中组合 `ThemeProvider` + i18n + `AppShell` + `HomePage`，并验证 `npm run dev` 打开后页头与首页文案显示正确
- [x] 6.3 在 `e2e/smoke.spec.ts` 写冒烟用例：页面加载、页头三个元素可见、无 console error，并验证通过

## 7. 集成验证与文档

- [x] 7.1 运行 `npm run check` 与 `npm run test:e2e`，确认全部通过；如实施过程中版本与 design.md Context 不符，更新 design.md 记录实际版本
- [x] 7.2 编写 `README.md`：项目简介、目录结构说明、全部 npm scripts 的用途、新增文案与新增 token 的约定，并验证 README 中列出的每条命令都能按原样运行

## Workflow follow-up

- 全部任务完成后执行一次 git commit（本 change 的约定是每个 change 单独提交）。
- 按项目评审要求满足后归档本 change。
