/**
 * Client-only wrapper for QRCode component
 * Use this in Nuxt or other SSR frameworks
 *
 * @example Nuxt 3
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

export const QRCodeClient = defineAsyncComponent(() =>
  import('./QRCode').then((m) => m.default),
)

export default QRCodeClient
