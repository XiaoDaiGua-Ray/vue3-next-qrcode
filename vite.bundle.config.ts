import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vueJsx()],
  build: {
    lib: {
      entry: 'components/index.ts',
      name: 'Vue3NextQrcode',
      fileName: () => `vue3-next-qrcode.js`,
      formats: ['umd'],
    },
  },
})
