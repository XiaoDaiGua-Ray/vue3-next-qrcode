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
