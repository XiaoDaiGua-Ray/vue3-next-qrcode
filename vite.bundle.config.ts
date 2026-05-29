import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  define: {
    __VUE3_NEXT_QRCODE_ENABLE_WORKER__: 'false',
  },
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: 'components/index.ts',
      name: 'Vue3NextQrcode',
      fileName: () => 'vue3-next-qrcode.js',
      cssFileName: 'style',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
