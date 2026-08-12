// Nuxt 4 配置示例。页面默认放在 app/pages/，组件放在 app/components/。
// https://nuxt.com/docs/4.x/getting-started/upgrade

export default defineNuxtConfig({
  compatibilityDate: '2026-08-12',
  devtools: { enabled: true },

  // 也可以在 app/app.vue 或具体页面中显式 import 此样式入口。
  css: ['vue3-next-qrcode/style.css'],

  // 无需关闭 SSR 或添加 transpile/alias；二维码组件放在 <ClientOnly> 内，
  // 并提供 #fallback 作为服务端与 hydration 前的稳定占位。
})
