// Nuxt 3 配置示例
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },

  // 如果整个应用不需要 SSR，可以全局禁用
  // ssr: false,

  // 或者针对特定页面禁用 SSR
  routeRules: {
    '/qrcode': { ssr: false },
  },

  // 构建配置
  build: {
    transpile: ['vue3-next-qrcode'],
  },

  // Vite 配置
  vite: {
    optimizeDeps: {
      include: ['vue3-next-qrcode'],
    },
  },
})
