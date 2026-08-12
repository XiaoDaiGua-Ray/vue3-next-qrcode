## v4.1.0

### Feat

- `useQRCode({ defaultOptions, concurrency })` 新增 `status`、`latest` 并发策略、`cancel()`、`reset()`、`dispose()`，并保留默认 `reject` 策略和 `clear()` 兼容别名。
- 新增 `QRCodeGenerationCancelledError`，被替代、取消或销毁的生成任务会明确拒绝。
- `defineProvider` 新增容器、图片、Loading、Error、Action 全量语义 CSS variables，旧 primary/spin 变量继续作为 fallback。

### Compatibility

- Vue peer 最低版本恢复并保持为 `^3.0.1`；开发与完整验证版本更新到 Vue `3.5.41`。
- 公开声明改用 Vue 3.0.1 支持的 `ExtractPropTypes`、单泛型 `Ref<T>` / `ComputedRef<T>` 和本地 `CompatibleMaybeRef<T>`，组件声明收敛为 `DefineComponent<QRCodeProps>`。
- Nuxt 示例更新到 Nuxt 4 `app/` 目录、显式样式入口和 `<ClientOnly>` fallback。

### Fix

- 修复旧 GIF 请求的 `finally` 误删同 URL 新请求，导致请求去重失效的竞态。
- 修复 `AwesomeQR.defaultComponentOptions` 嵌套对象在实例间共享，`dotScale` 污染后续实例默认样式的问题。
- 修复 Vue 3.0.1 尚无 `setupContext.expose()` 时组件 setup 抛错的问题，通过 setup 返回值保持实例下载方法兼容。
- CI 改为 Node 24 + packageManager 声明的 pnpm，执行完整 `pnpm run test`；删除无凭据且会与人工发布重复的旧 Release 发布工作流。

### Breaking Changes

- 浏览器二进制结果类型从 Node `Buffer` 改为 `Uint8Array`。
- `downloadQRCode()` 返回 `Promise<void>`。
- 非法 `version`、`maskPattern`、`dotScale` 会被严格校验。
- 未列入 `exports` 的内部深层导入不再保证可用。

Vue 最低版本仍为 `3.0.1`，不是本次破坏性变更。

## v4.1.0-beta.1

### Feat

- 新增 `useQRCodeDownload(sourceRef)`，为组件外部二维码结果提供可复用下载能力。
- 新增 `clearQRCodeGIFCache()` 公共 API，可手动清理共享 GIF URL 缓存。
- 新增 `vitest` 单元测试体系，覆盖 hooks、组件异步渲染、GIF 缓存、render queue、prop validators、renderer 路径和核心源码保护断言。

### Improvements

- `QRCode` 组件和 `useQRCode` 共享内部 `useQRCodeRenderQueue` 与 `useGifBackground`，统一 latest-only 渲染、卸载保护、GIF stale URL 处理和错误回传。
- GIF URL 读取增加 in-flight 去重、有界缓存和清理版本保护，避免长期页面缓存无限增长或清理后被旧请求回填。
- `AwesomeQR` GIF 输出支持逐帧 delay、disposal type 2/3，并复用帧处理 canvas 以降低重复分配。
- 发布 smoke 扩展到声明文件消费、发布文件完整性、worker 禁用、obsolete deps 引用和核心修复静态检查。
- 发布流程改为 npmjs registry，增加 `prepack` / `prepublishOnly` 保护，并将 Vue peer baseline 对齐到 `^3.5.0`。

### Fix

- 修复 `AwesomeQR.draw()` 在 `_draw()` reject 时永久 pending，组件 `onError` 和 `finally` 无法触达的问题。
- 修复 `AwesomeQR` 初始化 canvas 时使用原始 `options.size` 而非合并默认值的问题。
- 修复公开 `.d.ts` 依赖缺失 `core/awesome-qr` 类型的问题。
- 修复 `QRCodeInst.downloadQRCode` 类型与实现不一致的问题，现在返回 `Promise<void>`。
- 新增 `version`、`maskPattern`、`dotScale` 运行时 validators，提前拦截无效输入。
- 当前包构建禁用未验证的 worker path，并更新 README / release 文档避免误导。

### Verification

- `pnpm run test`: passed，包含 `vue-tsc`、ESLint、Vitest、Prettier、完整构建和 smoke。
- `vitest run`: 10 个测试文件，35 条测试通过。
- `npm pack --dry-run --ignore-scripts`: passed，发布文件包含 ESM/CJS/client/style 入口和声明文件。

## v4.1.0-beta.0

### Feat

- 新增 `vue3-next-qrcode/client` 子路径导出，便于 `Nuxt` / `SSR` 场景显式使用客户端组件。
- 新增 `vue3-next-qrcode/style.css` 样式导出，同时保留 `es/style.css` 与 `lib/style.css` 兼容路径。
- 新增发布前 smoke 测试，覆盖 `ESM` / `CJS` / `client` 导入、样式导出解析、产物路径和 emoji 编码。

### Improvements

- 根入口改为 `SSR-safe` 导入，服务端导入不再触发 `window` / `document` 初始化。
- 二维码渲染改为运行时懒加载核心渲染器，普通导入不再立即加载 `Canvas` / `GIF` 渲染实现。
- `GIF` 解析与编码改为按需动态加载，并在支持时优先尝试 `Worker` 渲染，失败后自动回退主线程。
- 用轻量浏览器 `Canvas` adapter 替换旧的 `skia-canvas` 浏览器 shim，避免把 `path-browserify` 和无用 Node shim 打进发布产物。
- 文本编码改为 `TextEncoder`，提升 emoji、代理对和多语言文本的二维码编码稳定性。
- 渲染并发策略调整为保留最新一次请求，避免快速更新时最终结果停留在旧文本或旧配置。
- 工具链升级到 `Node 20+` 基线，更新 `Vite`、`vue-tsc`、`vite-plugin-dts`、`Sass` 等依赖并重建 `pnpm-lock.yaml`。

### Fix

- 修复 `AwesomeQR` 在无可用取色样本时生成 `rgb(NaN,NaN,NaN)` 的问题。
- 修复 `AwesomeQR` 中 `gifFrames.forEach(async ...)` 不等待异步帧处理的隐患。
- 修复浏览器构建中非 DOM 分支引用 `Buffer.from` 的类型与运行时风险。
- 修复 `package.json` 与 `pnpm-lock.yaml` 不一致导致 `eslint` 无法安装/运行的问题。
- 修复发布产物包含 `.pnpm` / `node_modules` 私有路径的问题。

### Documentation

- 更新中英文 README 的 `Nuxt` / `SSR` 说明，明确支持目标为 `SSR-safe` 导入 + `<ClientOnly>` 客户端渲染。
- 新增 `docs/releases/v4.1.0-beta.0.md` 发布文档，记录变更细节、测试方式、包体积和 beta 安装命令。

## v4.0.0

### Breaking Changes

- 重构组件内部实现，使用 Composition API 优化性能
- CSS 类名前缀从 `ray-qrcode` 统一改为 `r-qrcode`
- 移除了部分未使用的内部方法

### Feat

- 🎉 新增 `useQRCode Composable`，提供更灵活的二维码生成能力
- 新增 `QRCodeClient` 组件，专为 `Nuxt SSR` 环境优化
- 新增 GIF 背景缓存机制，避免重复加载相同的 GIF
- 优化网络请求，使用 `fetch` API 替代 `XMLHttpRequest`，更好地支持 `SSR`
- 添加环境检测，在非浏览器环境下优雅降级
- 新增防止并发渲染的锁机制，提升稳定性
- 优化 `TypeScript` 类型定义，提供更好的类型推导
- 新增 `data-component` 属性标记，替代非标准的 `img_tag`
- 添加完整的 `ARIA` 无障碍支持（`role`、`aria-label`、键盘导航）
- 优化 `CSS` 性能，使用 `inset` 简写和 `will-change` 优化动画

### Improvements

- 重构核心渲染逻辑，使用 `shallowRef` 优化大对象性能
- 优化 watcher 管理，避免内存泄漏
- 简化 `call` 工具函数，提供更好的类型安全
- 优化错误处理，提供更清晰的错误信息
- 改进 `CSS` 类名计算，使用 `computed` 提升性能
- 优化下载方法，使用 `async/await` 简化 `Promise` 逻辑

### Fix

- 修复 `gifBackgroundURL` 在 `TSX` 组件中无法正确传递的问题（需使用 `camelCase`）
- 修复 `GIF` 加载时序问题，确保 `GIF` 在渲染前加载完成
- 修复 `CSS` 变量名不一致导致的样式问题
- 修复 `defineProvider` 类型定义，所有属性改为可选

### Dev Experience

- 添加 `ESLint` 配置，统一代码风格
- 添加 `.editorconfig` 统一编辑器配置
- 添加 `.prettierignore` 和 `.eslintignore`
- 优化 `VSCode` 工作区设置和推荐扩展
- 添加 `GitHub Actions CI` 工作流
- 优化 `package.json` 的 `exports` 字段，支持现代模块解析
- 添加 `sideEffects` 配置，优化 `tree-shaking`

### Documentation

- 新增 `Nuxt 3` 使用示例（`examples/nuxt-example.vue`）
- 新增 `useQRCode` `Hook` 使用示例
- 添加 `Nuxt` 配置示例（`examples/nuxt.config.ts`）

## v3.1.0

### Feat

- 优化二维码生成的核心依赖
- 导出 `QRCodeProps` 类型

## v3.0.2

### Fix

- 修复在 `nuxt` 中一些边界错误

## v3.0.1

### Fix

- 修复在 `nuxt` 中构建报错的问题

## v3.0.0

### Feat

- 现在二维码的样式支持使用 `defineProvider` 属性配置 `css var` 样式。
- 升级底层依赖
- 减少了打包体积
- 稳定了对于 `SSR` 的支持

## v2.0.10

### Feat

- 现在将 `awesome-qr.js` 内置于组件内，不再以 `package.json` 方式管理。
- 新增了 `QRCodeComponentProps`, `QRCodeOptions` 类型导出

## v2.0.9

### Fix

- 修复导入类型可能会丢失的问题

## v2.0.8

构建输出版本手动显式指定了 `es`, `lib` 两种拓展名，并且在导出配置中也做了相应的配置。

### Feat

- 优化输出配置，显式指定 `es`, `lib` 两种拓展名

## v2.0.7

### Feat

- 暴露 `QRCodeInst, QRCodeLevel, QRCodeStatus` 三个类型

## v2.0.6

### Feat

- 重写 `downloadBase64File` 方法
- 新增 `ssr` 支持

### Fix

- 修复 `onSuccess` 类型错误

## v2.0.5

### Feat

- 更新 `vue` 版本至 `3.3.13`
- 新增 `maskColor` 配置项，支持配置 `mask` 的颜色
- `downloadQRCode` 方法，现在会返回一个 `Promise` 对象
- 对于 `img` 添加 `img_tag` 标记

### Fix

- 修复 `downloadBase64File` 方法，未能及时释放 `a` 标签的问题

## v2.0.3

### Feat

- 新增 loading 状态插槽

```vue
<template>
  <Vue3NextQrcode>
    <template #loading> your custom loading style </template>
  </Vue3NextQrcode>
</template>
<script setup lang="ts">
import { Vue3NextQrcode } from 'vue3-next-qrcode'
import 'vue3-next-qrcode/es/style.css'
</script>
```

### Fix

- 修复 watchText 不能被取消问题

## v2.0.3

### Fix

- 修复 `text` 更新不能正确刷新二维码问题

## v2.0.2

### Feat

- 移除 `naive-ui` 包的依赖
- 优化了一点样式细节

## v2.0.1

### Feat

一些杂项改动。

## v2.0.0

### Feat

一个基于 `vue3.x` 并且使用 `typescript` 开发的二维码组件。支持常见的所有特性，并且有丰富的拓展。
