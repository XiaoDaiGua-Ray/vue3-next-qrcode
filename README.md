<p align="center">
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode">
    <img width="160" src="https://avatars.githubusercontent.com/u/51957438?v=4" alt="vue3-next-qrcode">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue3-next-qrcode?activeTab=readme"><img src="https://img.shields.io/npm/v/vue3-next-qrcode.svg" alt="npm package"></a>
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XiaoDaiGua-Ray/vue3-next-qrcode" alt="license"></a>
</p>

<div align="center">

# vue3-next-qrcode

English | [简体中文](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/README.zh-CN.md)

Vue 3 QR code component with logo, image/GIF background, status UI, `useQRCode`, and SSR-safe package imports.

</div>

## Preview

<p align="center">
  <img width="220" src="https://raw.githubusercontent.com/XiaoDaiGua-Ray/vue3-next-qrcode/main/assets/q1.gif" alt="QR code with GIF background">
  <img width="220" src="https://raw.githubusercontent.com/XiaoDaiGua-Ray/vue3-next-qrcode/main/assets/q2.png" alt="Styled QR code">
</p>

## Why This Package

- Works as a Vue component or a programmatic composable.
- Supports logo, image background, GIF background, custom dots, error/loading states, and download.
- Root imports are SSR-safe for Nuxt and other SSR frameworks.
- Heavy rendering code is lazy-loaded. GIF parser/encoder only load when GIF rendering is used.
- GIF rendering tries a Worker first and falls back to the main thread automatically.
- Written in TypeScript with component, composable, and instance types.

## Install

```bash
pnpm add vue3-next-qrcode
```

```bash
npm install vue3-next-qrcode
```

For the current beta release:

```bash
pnpm add vue3-next-qrcode@beta
```

## Quick Start

```vue
<script setup lang="ts">
import { Vue3NextQrcode } from 'vue3-next-qrcode'
import 'vue3-next-qrcode/style.css'
</script>

<template>
  <Vue3NextQrcode text="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode" />
</template>
```

Use global registration if you prefer plugin style:

```ts
import { createApp } from 'vue'
import Vue3NextQrcode from 'vue3-next-qrcode'
import 'vue3-next-qrcode/style.css'
import App from './App.vue'

createApp(App).use(Vue3NextQrcode).mount('#app')
```

## Common Recipes

### Custom Size And Colors

```vue
<Vue3NextQrcode
  text="Hello QR"
  :size="240"
  :margin="16"
  colorDark="#111827"
  colorLight="#ffffff"
  :correctLevel="3"
/>
```

### Logo In The Center

```vue
<Vue3NextQrcode
  text="https://example.com"
  logoImage="https://example.com/logo.png"
  :logoScale="0.28"
  :logoMargin="8"
  :logoCornerRadius="6"
/>
```

### GIF Background

```vue
<script setup lang="ts">
const gifUrl = 'https://example.com/background.gif'
</script>

<template>
  <Vue3NextQrcode
    text="Animated QR"
    :gifBackgroundURL="gifUrl"
    :dotScale="0.5"
    colorDark="#64d9d6"
  />
</template>
```

GIF parser, encoder, and Worker code are not loaded by normal QR codes. They are pulled in only when `gifBackgroundURL` or `gifBackground` is used.

### Loading And Error States

```vue
<template>
  <Vue3NextQrcode text="loading" status="loading" />

  <Vue3NextQrcode
    text="expired"
    status="error"
    errorDescription="QR code expired"
    errorActionDescription="Reload"
    :onReload="refreshQRCode"
  />
</template>
```

Slots are available when the default UI is not enough:

```vue
<Vue3NextQrcode text="loading" status="loading">
  <template #loading>
    <span>Generating...</span>
  </template>
</Vue3NextQrcode>
```

### Download

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { QRCodeInst } from 'vue3-next-qrcode'

const qrcodeRef = ref<QRCodeInst>()

const download = () => {
  qrcodeRef.value?.downloadQRCode('qrcode.png')
}
</script>

<template>
  <Vue3NextQrcode ref="qrcodeRef" text="Download me" />
  <button @click="download">Download</button>
</template>
```

## Nuxt And SSR

The package entry is safe to import during SSR. Rendering still requires browser canvas APIs, so render QR codes inside `<ClientOnly>` or another client-only boundary.

```vue
<template>
  <ClientOnly>
    <QRCodeClient text="Hello Nuxt" />
    <template #fallback>
      <span>Loading QR code...</span>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { QRCodeClient } from 'vue3-next-qrcode/client'
import 'vue3-next-qrcode/style.css'
</script>
```

Nuxt route-level client rendering also works:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/qrcode': { ssr: false },
  },
})
```

Most Nuxt projects do not need special `optimizeDeps` or alias configuration. If your project has a strict transpile policy, you can still add:

```ts
export default defineNuxtConfig({
  build: {
    transpile: ['vue3-next-qrcode'],
  },
})
```

## Programmatic Usage

Use `useQRCode` when you need to generate a QR image without rendering the packaged component UI.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQRCode } from 'vue3-next-qrcode'

const text = ref('Hello from useQRCode')
const { qrcodeURL, isLoading, error, generate, clear } = useQRCode()

const create = () =>
  generate({
    text: text.value,
    size: 300,
    margin: 20,
    colorDark: '#111827',
    colorLight: '#ffffff',
  })
</script>

<template>
  <input v-model="text" />
  <button :disabled="isLoading" @click="create">
    {{ isLoading ? 'Generating...' : 'Generate' }}
  </button>
  <button @click="clear">Clear</button>

  <p v-if="error">{{ error.message }}</p>
  <img v-if="typeof qrcodeURL === 'string'" :src="qrcodeURL" alt="QR code" />
</template>
```

### `useQRCode` Return Type

```ts
function useQRCode(): {
  qrcodeURL: Ref<string | ArrayBuffer | Uint8Array | undefined>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  generate: (options: UseQRCodeOptions) => Promise<string | ArrayBuffer | Uint8Array | undefined>
  clear: () => void
}
```

## Package Exports

```ts
import { Vue3NextQrcode, useQRCode } from 'vue3-next-qrcode'
import { QRCodeClient } from 'vue3-next-qrcode/client'
import 'vue3-next-qrcode/style.css'
```

Compatibility style paths are still available:

```ts
import 'vue3-next-qrcode/es/style.css'
import 'vue3-next-qrcode/lib/style.css'
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | required | Text encoded into the QR code. |
| `size` | `number` | `160` | QR code size in pixels. |
| `margin` | `number` | `12` | Quiet-zone margin around the QR body. |
| `correctLevel` | `0 \| 1 \| 2 \| 3` | `1` | Error correction level: L, M, Q, H. |
| `watchText` | `boolean` | `true` | Re-render when `text` changes. |
| `status` | `'loading' \| 'error' \| 'success'` | `undefined` | Display loading or error UI instead of the normal QR image. |
| `colorDark` | `string` | `'#000000'` | QR module color. |
| `colorLight` | `string` | `'#ffffff'` | QR background color. |
| `autoColor` | `boolean` | `true` | Derive dark color from image/GIF background when possible. |
| `backgroundImage` | `string` | `undefined` | Static background image URL or data URL. |
| `backgroundDimming` | `string` | `'rgba(0, 0, 0, 0)'` | Overlay color above the background image. |
| `gifBackgroundURL` | `string` | `undefined` | GIF background URL. |
| `gifBackground` | `ArrayBuffer` | `undefined` | GIF background binary data. |
| `logoImage` | `string` | `undefined` | Center logo image URL or data URL. |
| `logoScale` | `number` | `0.4` | Logo size ratio relative to QR size. |
| `logoMargin` | `number` | `6` | Logo margin in pixels. |
| `logoCornerRadius` | `number` | `8` | Logo corner radius in pixels. |
| `dotScale` | `number` | `1` | Dot size ratio. Lower values reveal more background. |
| `whiteMargin` | `boolean` | `true` | Use white quiet-zone margin instead of transparent margin. |
| `components` | `ComponentOptions` | built-in defaults | Fine-grained QR component styling. |
| `maskPattern` | `number` | `undefined` | Force a QR mask pattern. Usually leave unset. |
| `version` | `number` | `undefined` | Force QR version from `1` to `40`. Usually leave unset. |
| `defineProvider` | `Partial<DefineProvider>` | `undefined` | CSS variable overrides for this component. |
| `maskColor` | `string` | `'rgba(255, 255, 255, 0.96)'` | Loading/error mask color. |
| `errorDescription` | `string \| VNode` | `'二维码已过期'` | Error-state description. |
| `errorActionDescription` | `string` | `'重新加载'` | Error action text. |
| `onSuccess` | `(result) => void` or array | `null` | Called after successful generation. Result is `string \| ArrayBuffer \| Uint8Array \| undefined`. |
| `onError` | `(error) => void` or array | `null` | Called when generation fails. |
| `onReload` | `() => void` or array | `null` | Called by the built-in error action. |

In SFC templates you can use either camelCase (`gifBackgroundURL`) or kebab-case (`gif-background-url`) depending on your Vue setup.

## Slots And Instance

| Slot | Description |
| --- | --- |
| `loading` | Custom loading UI. |
| `errorAction` | Custom error action UI. |

```ts
interface QRCodeInst {
  downloadQRCode: (fileName?: string) => Promise<void>
}
```

## CSS Variables

```css
--r-qrcode-width           /* QR code width */
--r-qrcode-height          /* QR code height */
--r-qrcode-border-radius   /* Border radius */
--r-qrcode-mask-color      /* Loading/error mask color */
--r-qrcode-primary-color   /* Primary action color */
--r-qrcode-primary-color-2 /* Hover action color */
--r-qrcode-spin-size       /* Loading spinner border width */
```

Use `defineProvider` for per-component overrides:

```vue
<Vue3NextQrcode
  text="Styled QR"
  :defineProvider="{
    '--r-qrcode-primary-color': '#1677ff',
    '--r-qrcode-primary-color-2': '#69b1ff',
    '--r-qrcode-border-radius': '8px',
  }"
/>
```

## TypeScript

```ts
import type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeProps,
  QRCodeOptions,
  UseQRCodeOptions,
  UseQRCodeReturnType,
} from 'vue3-next-qrcode'
```

## Migration Notes

### v4.1 beta

- Prefer `vue3-next-qrcode/style.css` for styles.
- Use `vue3-next-qrcode/client` with Nuxt `<ClientOnly>`.
- Root imports and `useQRCode` imports are SSR-safe, but QR image generation is still client-side.
- Browser-facing binary results use `Uint8Array` instead of Node `Buffer`.

### From v3

- CSS class prefix changed from `ray-qrcode` to `r-qrcode`.
- `img_tag` changed to `data-component`.
- GIF and image rendering behavior is now lazy-loaded.

## FAQ

### Can I import the package in SSR?

Yes. The root entry and `useQRCode` are SSR-safe to import. Render QR images only on the client.

### Why is my Nuxt page blank during SSR?

`<QRCodeClient>` renders on the client. Add a `<ClientOnly>` fallback if you want server-rendered placeholder content.

### Does GIF rendering need configuration?

No. The package tries Worker rendering internally and falls back to main-thread rendering automatically.

### Can I use it in a mini program?

Not directly. Mini programs use platform-specific canvas APIs, so they need a custom adapter.

## License

[MIT](./LICENSE)
