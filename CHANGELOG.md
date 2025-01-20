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
