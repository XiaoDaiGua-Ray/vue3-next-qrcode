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
