/**
 * Client-only wrapper for QRCode component
 * Use this in Nuxt or other SSR frameworks
 *
 * @example Nuxt 4 (`app/pages/qrcode.vue`)
 * ```vue
 * <template>
 *   <ClientOnly>
 *     <QRCodeClient text="Hello World" />
 *   </ClientOnly>
 * </template>
 *
 * <script setup>
 * import { QRCodeClient } from 'vue3-next-qrcode/client'
 * </script>
 * ```
 */

import { defineAsyncComponent } from 'vue'

import type { DefineComponent } from 'vue'
import type { QRCodeProps } from './QRCode'

export const QRCodeClient = defineAsyncComponent(() =>
  import('./QRCode').then((m) => m.default),
) as unknown as DefineComponent<QRCodeProps>

export default QRCodeClient
