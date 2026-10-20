# Tasks

## 1. 访问层

- [x] 1.1 新增 `src/lib/github/token.ts`（get / set / clear / subscribe，键 `osr.token`，变更时重置配额状态），单元测试覆盖持久化与订阅
- [x] 1.2 `buildHeaders()` 在有 token 时加 `Authorization: Bearer`，`RateLimit` 增加 `limit` 并解析 `X-RateLimit-Limit`，更新对应单元测试
- [x] 1.3 新增 `validateToken()`：`GET /rate_limit` 带候选 token，200 更新配额并返回 ok，401 返回 `invalid_token`，单元测试覆盖三种响应

## 2. 缓存

- [x] 2.1 新增 `src/features/search/searchCache.ts`（TTL 5 分钟、上限 50、键 `query|sort|page`），单元测试覆盖命中、过期、淘汰
- [x] 2.2 `useRepositorySearch` 命中缓存时直接 `succeeded`，成功后写入，`retry` 前删除该键；单元测试验证第二次相同参数不调用 fetch

## 3. UI

- [x] 3.1 三份语言文件新增 `token.*` 键（入口文案、说明、链接、输入占位、保存、移除、无效提示、校验中）
- [x] 3.2 实现 `TokenMenu` molecule（Base UI Popover、密码输入、保存校验、错误、移除、配额显示）并接入 `Header`，单元测试覆盖保存有效 / 无效、移除、空输入
- [x] 3.3 e2e `e2e/token.spec.ts`：mock `/rate_limit`，保存有效 token 后检索带 Authorization、无效 token 不保存、刷新后仍配置、移除后无 Authorization、相同参数二次检索不发请求

## 4. 安全加固（2026-10-20 追加）

- [x] 4.1 token 默认只存内存，弹层加"在此设备记住"勾选与风险提示；单元测试与 e2e 覆盖默认不落盘与记住两种路径
- [x] 4.2 Vite 构建注入 CSP meta（脚本 self + 内联哈希、连接仅 api.github.com）；e2e 验证生产页面带策略且主题脚本仍执行
- [x] 4.3 文案改为要求只读、仅公开仓库、短期过期的 fine-grained token

## 5. 收尾

- [x] 5.1 `npm run check` 与 `npm run test:e2e` 全部通过；README 补充 token 说明；ROADMAP 勾选 A
