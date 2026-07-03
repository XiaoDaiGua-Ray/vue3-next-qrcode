import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vueJsx()],
  define: {
    __VUE3_NEXT_QRCODE_ENABLE_WORKER__: 'false',
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    restoreMocks: true,
    clearMocks: true,
    testTimeout: 10000,
  },
})
