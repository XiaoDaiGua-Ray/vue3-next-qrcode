import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      // @ts-ignore
      outputDir: ['es', 'lib'],
      include: ['components/**/*.ts', 'components/**/*.tsx'],
    }),
  ],
  build: {
    minify: false,
    rollupOptions: {
      external: ['@v-c/utils', '@vueuse/core', 'vue', 'awesome-qr', 'naive-ui'],
      output: [
        {
          format: 'es',
          dir: 'es',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'components',
        },
        {
          format: 'cjs',
          dir: 'lib',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'components',
          exports: 'named',
        },
      ],
    },
    lib: {
      entry: 'components/index.ts',
      formats: ['es', 'cjs'],
    },
  },
})
