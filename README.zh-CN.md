<p align="center">
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode">
    <img width="216" src="https://avatars.githubusercontent.com/u/51957438?v=4">
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vue3-next-qrcode?activeTab=readme"><img src="https://img.shields.io/npm/v/vue3-next-qrcode.svg" alt="npm package"></a>
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XiaoDaiGua-Ray/vue3-next-qrcode" alt="LICENSE"></a>
</p>

<div align="center">

# vue3-next-qrcode

[English](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/README.md) | 简体中文

一个功能强大的 Vue 3 二维码组件，支持 LOGO、GIF 背景和 SSR-safe 导入！

</div>

## 🏄‍♀️ 示例

<div style="display: flex;gap: 8px 12px;">
  <img src="./assets/q1.gif" />
  <img src="./assets/q2.png" />
</div>

## ✨ 特性

- 🏄🏼‍♂️ 基于 Vue 3 Composition API，易于使用
- 🛸 丰富的配置属性
- 🏟️ 覆盖大多数业务场景
- 🎯 使用 TypeScript 构建，提供完整的类型定义
- 🚀 Nuxt 等 SSR 框架可安全导入
- 🎨 Composable API（`useQRCode`）
- ♿ 无障碍支持（ARIA 标签、键盘导航）
- 🎭 GIF 背景自动缓存和懒加载
- 📦 SSR-safe、懒加载渲染器和更轻的入口包体积
- 🎨 支持 CSS 变量自定义样式
- 🔄 文本和渲染配置变化自动刷新
- 💾 内置下载功能

## 📦 安装

```bash
# npm
npm install vue3-next-qrcode

# yarn
yarn add vue3-next-qrcode

# pnpm
pnpm add vue3-next-qrcode
```

## 🚀 快速开始

### 基础用法

```vue
<script setup lang="ts">
import { Vue3NextQrcode } from 'vue3-next-qrcode'
import 'vue3-next-qrcode/style.css'
</script>

<template>
  <Vue3NextQrcode text="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode" />
</template>
```

### 自定义样式

```vue
<template>
  <Vue3NextQrcode
    text="你好世界"
    :size="300"
    :margin="20"
    colorDark="#000000"
    colorLight="#ffffff"
    :correctLevel="3"
  />
</template>
```

### 添加 Logo

```vue
<template>
  <Vue3NextQrcode
    text="https://example.com"
    logoImage="https://example.com/logo.png"
    :logoScale="0.3"
    :logoMargin="10"
    :logoCornerRadius="8"
  />
</template>
```

### 使用 GIF 背景

```vue
<template>
  <Vue3NextQrcode
    text="动态二维码"
    :gifBackgroundURL="gifUrl"
    :dotScale="0.5"
    colorDark="#64d9d6"
  />
</template>

<script setup>
const gifUrl = 'https://example.com/background.gif'
</script>
```

### 状态管理（加载中/错误）

```vue
<template>
  <div>
    <!-- 加载状态 -->
    <Vue3NextQrcode text="加载中..." status="loading" />

    <!-- 错误状态 -->
    <Vue3NextQrcode
      text="错误"
      status="error"
      errorDescription="二维码已过期"
      errorActionDescription="重新加载"
      :onReload="handleReload"
    />

    <!-- 自定义加载插槽 -->
    <Vue3NextQrcode text="自定义加载" status="loading">
      <template #loading>
        <div class="custom-spinner">加载中...</div>
      </template>
    </Vue3NextQrcode>

    <!-- 自定义错误操作插槽 -->
    <Vue3NextQrcode text="自定义错误" status="error">
      <template #errorAction>
        <button @click="handleReload">重试</button>
      </template>
    </Vue3NextQrcode>
  </div>
</template>

<script setup>
const handleReload = () => {
  console.log('重新加载...')
}
</script>
```

### 下载二维码

```vue
<template>
  <div>
    <Vue3NextQrcode ref="qrcodeRef" text="下载我！" />
    <button @click="handleDownload">下载二维码</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const qrcodeRef = ref()

const handleDownload = async () => {
  try {
    await qrcodeRef.value?.downloadQRCode('my-qrcode.png')
    console.log('下载成功！')
  } catch (error) {
    console.error('下载失败：', error)
  }
}
</script>
```

### 使用回调函数

```vue
<template>
  <Vue3NextQrcode
    text="回调示例"
    :onSuccess="handleSuccess"
    :onError="handleError"
  />
</template>

<script setup>
const handleSuccess = (dataURL) => {
  console.log('二维码生成成功：', dataURL)
}

const handleError = (error) => {
  console.error('生成失败：', error)
}
</script>
```

## 🎨 使用 Composable API（v4.0.0+）

`useQRCode` composable 提供了一种灵活的方式来以编程方式生成二维码。

### 基础示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQRCode } from 'vue3-next-qrcode'

const { qrcodeURL, isLoading, error, generate, clear } = useQRCode()

const text = ref('你好世界')

const handleGenerate = async () => {
  await generate({
    text: text.value,
    size: 300,
    margin: 20,
    colorDark: '#000000',
    colorLight: '#ffffff',
  })
}
</script>

<template>
  <div>
    <input v-model="text" placeholder="输入文本" />
    <button @click="handleGenerate" :disabled="isLoading">
      {{ isLoading ? '生成中...' : '生成' }}
    </button>
    <button @click="clear">清除</button>

    <div v-if="error" class="error">{{ error.message }}</div>
    <img v-if="qrcodeURL" :src="qrcodeURL" alt="二维码" />
  </div>
</template>
```

### 使用 GIF 背景

```vue
<script setup lang="ts">
import { useQRCode } from 'vue3-next-qrcode'

const { qrcodeURL, generate } = useQRCode()

await generate({
  text: '动态二维码',
  gifBackgroundURL: 'https://example.com/bg.gif',
  size: 400,
  dotScale: 0.5,
})
</script>

<template>
  <img v-if="qrcodeURL" :src="qrcodeURL" alt="动态二维码" />
</template>
```

### API 参考

```typescript
interface UseQRCodeReturn {
  // 生成的二维码（base64 字符串、ArrayBuffer 或 Uint8Array）
  qrcodeURL: Ref<QRCodeRenderResponse>

  // 加载状态
  isLoading: Ref<boolean>

  // 错误状态
  error: Ref<Error | null>

  // 生成二维码
  generate: (options: UseQRCodeOptions) => Promise<QRCodeRenderResponse>

  // 清除当前二维码
  clear: () => void
}
```

## 🌐 SSR 支持（Nuxt）

包入口现在可以在服务端安全导入，不会在导入阶段访问 `window` / `document`。二维码图片生成仍然需要浏览器 Canvas 环境，因此组件渲染请放在 `<ClientOnly>` 或等价的客户端边界内。

### Nuxt 3

#### 方法 1：使用 `ClientOnly`（推荐）

```vue
<template>
  <ClientOnly>
    <QRCodeClient text="你好 Nuxt 3" />
    <template #fallback>
      <div>加载二维码中...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { QRCodeClient } from 'vue3-next-qrcode/client'
import 'vue3-next-qrcode/style.css'
</script>
```

#### 方法 2：动态导入

```vue
<template>
  <LazyQRCode v-if="mounted" text="你好 Nuxt" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const LazyQRCode = defineAsyncComponent(() =>
  import('vue3-next-qrcode/client').then((m) => m.QRCodeClient),
)

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>
```

#### 方法 3：禁用特定路由的 SSR

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/qrcode': { ssr: false },
  },
})
```

### Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    transpile: ['vue3-next-qrcode'],
  },
})
```

### 包导出

```ts
import { Vue3NextQrcode, useQRCode } from 'vue3-next-qrcode'
import { QRCodeClient } from 'vue3-next-qrcode/client'
import 'vue3-next-qrcode/style.css'
```

## 🎨 使用 CSS 变量自定义样式

```vue
<template>
  <Vue3NextQrcode
    text="样式化二维码"
    :defineProvider="{
      '--r-qrcode-primary-color': '#1677ff',
      '--r-qrcode-primary-color-2': '#69b1ff',
      '--r-qrcode-spin-size': '4px',
    }"
  />
</template>
```

### 可用的 CSS 变量

```css
--r-qrcode-width           /* 二维码宽度 */
--r-qrcode-height          /* 二维码高度 */
--r-qrcode-border-radius   /* 边框圆角 */
--r-qrcode-mask-color      /* 遮罩层颜色 */
--r-qrcode-primary-color   /* 主题色 */
--r-qrcode-primary-color-2 /* 次要主题色 */
--r-qrcode-spin-size       /* 加载动画大小 */
```

## 📝 TypeScript 支持

完整的 TypeScript 支持，包含全面的类型定义：

```typescript
import type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeProps,
  QRCodeOptions,
  UseQRCodeOptions,
  UseQRCodeReturnType,
} from 'vue3-next-qrcode'

// 组件实例类型
const qrcodeRef = ref<QRCodeInst>()

// 纠错级别：0 (L), 1 (M), 2 (Q), 3 (H)
const correctLevel: QRCodeLevel = 3

// 状态类型
const status: QRCodeStatus = 'loading' | 'error' | 'success'
```

## 📚 API 参考

### 组件属性

| **属性名**             | **类型**                                              | **默认值**       | **说明**                                                                  | **版本** |
| ---------------------- | ----------------------------------------------------- | ---------------- | ------------------------------------------------------------------------- | -------- |
| watchText              | boolean                                               | true             | 自动监听二维码文本，如果文本更新则重新渲染二维码                          | \*       |
| status                 | QRCodeStatus                                          | undefined        | 二维码状态                                                                | \*       |
| errorDescription       | string \| VNode                                       | 二维码已过期     | 错误状态下的描述文本                                                      | \*       |
| errorActionDescription | string                                                | 重新加载         | 错误状态下的操作按钮文本                                                  | \*       |
| text                   | string                                                | `必填`           | 要编码到二维码中的文本                                                    | \*       |
| size                   | number                                                | 160              | 二维码大小（像素）                                                        | \*       |
| margin                 | number                                                | 12               | 二维码周围的边距大小（像素）                                              | \*       |
| correctLevel           | number                                                | 1                | 二维码的纠错级别（0-3），接受 _QRErrorCorrectLevel_ 提供的值              | \*       |
| maskPattern            | number                                                | undefined        | 指定二维码编码中使用的掩码图案，接受 _QRMaskPattern_ 提供的值             | \*       |
| version                | number                                                | undefined        | 指定二维码编码中使用的版本，接受 [1, 40] 范围内的整数                     | \*       |
| components             | ComponentOptions                                      | {}               | 控制二维码中组件的选项                                                    | \*       |
| colorDark              | string                                                | #000000          | 二维码块的颜色                                                            | \*       |
| colorLight             | string                                                | #ffffff          | 二维码空白区域的颜色                                                      | \*       |
| autoColor              | boolean                                               | true             | 自动从二维码背景计算 _colorLight_ 值                                      | \*       |
| backgroundImage        | string                                                | undefined        | 二维码中使用的背景图片                                                    | \*       |
| backgroundDimming      | string                                                | rgba(0, 0, 0, 0) | 背景图片上方的调光遮罩颜色                                                | \*       |
| gifBackgroundURL       | string                                                | undefined        | 二维码中使用的 GIF 背景图片 URL                                           | \*       |
| gifBackground          | ArrayBuffer                                           | undefined        | 二维码中使用的 GIF 背景图片                                               | \*       |
| whiteMargin            | boolean                                               | true             | 使用白色边距而不是透明边距                                                | \*       |
| logoImage              | string                                                | undefined        | 显示在二维码中心的 Logo 图片                                              | \*       |
| logoScale              | number                                                | 0.4              | Logo 大小与二维码大小的比例                                               | \*       |
| logoMargin             | number                                                | 6                | Logo 图片周围的边距大小（像素）                                           | \*       |
| logoCornerRadius       | number                                                | 8                | Logo 图片的圆角半径（像素）                                               | \*       |
| dotScale               | number                                                | 1                | 块的实际大小与完整大小的比例                                              | \*       |
| onSuccess              | (dataURL: ArrayBuffer \| Uint8Array \| string \| undefined) => void | null             | 二维码成功生成时调用此回调                                    | \*       |
| onError                | (e: unknown) => void                                  | null             | 二维码生成失败时调用此回调                                                | \*       |
| onReload               | () => void                                            | null             | 点击重新加载按钮时调用此回调，如果使用了 errorAction 插槽则此方法不会执行 | \*       |

### 插槽

| **名称**    | **参数** | **说明**                   | **版本** |
| ----------- | -------- | -------------------------- | -------- |
| errorAction | ()       | 错误状态下的自定义显示样式 | \*       |
| loading     | ()       | 自定义加载状态插槽         | 2.0.4    |

### 组件实例方法

```typescript
interface QRCodeInst {
  // 下载生成的二维码
  downloadQRCode: (fileName?: string) => Promise<void>
}
```

### useQRCode Composable

```typescript
function useQRCode(): {
  qrcodeURL: Ref<QRCodeRenderResponse>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  generate: (options: UseQRCodeOptions) => Promise<QRCodeRenderResponse>
  clear: () => void
}
```

## 🎯 高级示例

### 动态二维码自动刷新

```vue
<template>
  <div>
    <input v-model="url" placeholder="输入 URL" />
    <Vue3NextQrcode :text="url" :watchText="true" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const url = ref('https://example.com')
// 当 url 改变时，二维码会自动更新
</script>
```

### 多个不同样式的二维码

```vue
<template>
  <div class="qrcode-grid">
    <Vue3NextQrcode
      v-for="item in qrcodes"
      :key="item.id"
      :text="item.text"
      :colorDark="item.color"
      :size="200"
    />
  </div>
</template>

<script setup>
const qrcodes = [
  { id: 1, text: '红色二维码', color: '#ff0000' },
  { id: 2, text: '绿色二维码', color: '#00ff00' },
  { id: 3, text: '蓝色二维码', color: '#0000ff' },
]
</script>
```

### 基于状态的条件渲染

```vue
<template>
  <Vue3NextQrcode
    :text="qrText"
    :status="qrStatus"
    :onSuccess="handleSuccess"
    :onError="handleError"
  />
</template>

<script setup>
import { ref } from 'vue'

const qrText = ref('加载中...')
const qrStatus = ref('loading')

setTimeout(() => {
  qrText.value = 'https://example.com'
  qrStatus.value = undefined
}, 2000)

const handleSuccess = (dataURL) => {
  console.log('生成成功：', dataURL)
}

const handleError = (error) => {
  qrStatus.value = 'error'
  console.error(error)
}
</script>
```

## 🔧 迁移指南

### 从 v3.x 到 v4.0.0

**破坏性变更：**

1. CSS 类名前缀从 `ray-qrcode` 改为 `r-qrcode`
2. `img_tag` 属性改为 `data-component`

**新功能：**

1. `useQRCode` composable
2. 用于 SSR 的 `QRCodeClient`
3. GIF 缓存机制
4. 更好的 TypeScript 支持

**迁移步骤：**

```vue
<!-- 之前（v3.x） -->
<template>
  <Vue3NextQrcode text="你好" gif-background-url="..." />
</template>

<!-- 之后（v4.0.0） -->
<template>
  <Vue3NextQrcode text="你好" :gifBackgroundURL="..." />
</template>
```

```css
/* 之前（v3.x） */
.ray-qrcode {
}

/* 之后（v4.0.0） */
.r-qrcode {
}
```

## ❓ 常见问题

### 问：如何在 Nuxt 中使用？

答：使用 `<ClientOnly>` 包裹从 `vue3-next-qrcode/client` 导入的 `QRCodeClient`。根包可在 SSR 阶段安全导入，但二维码渲染仍在浏览器端完成。

### 问：如何下载二维码？

答：使用组件 ref 的 `downloadQRCode` 方法。参见 [下载二维码](#下载二维码) 示例。

### 问：可以使用 GIF 作为背景吗？

答：可以！使用 `gifBackgroundURL` 属性。GIF 解析与编码只会在需要时懒加载，并会自动缓存。

### 问：如何自定义颜色？

答：使用 `colorDark` 和 `colorLight` 属性，或使用 CSS 变量进行高级样式定制。

### 问：支持 TypeScript 吗？

答：是的！提供完整的 TypeScript 支持和全面的类型定义。

### 问：可以在微信小程序中使用吗？

答：不能直接使用。小程序需要平台特定的 Canvas API。考虑创建自定义适配器。

## 🤝 贡献

欢迎贡献！请先阅读我们的 [贡献指南](CONTRIBUTING.md)。

## 📝 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)。

## 🪴 项目活跃度

![Alt](https://repobeats.axiom.co/api/embed/7802e3c093747ad0cf1dbda3937e7a34500428ad.svg 'Repobeats analytics image')

### 贡献者

感谢所有贡献者 🐝 ！

<a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XiaoDaiGua-Ray/vue3-next-qrcode" />
</a>

## 🌸 致谢

本项目基于 [awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md) 开发

## 📄 许可证

[MIT License](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE) © 2023-PRESENT [Ray](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode)
