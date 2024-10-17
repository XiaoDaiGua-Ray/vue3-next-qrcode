import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import viteSvgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      // @ts-ignore
      outputDir: ['es', 'lib'],
      include: ['components/**/*.ts', 'components/**/*.tsx'],
    }),
    viteSvgLoader({
      defaultImport: 'component',
    }),
  ],
  build: {
    minify: false,
    rollupOptions: {
      external: ['@v-c/utils', 'vue', 'awesome-qr'],
      output: [
        {
          format: 'es',
          dir: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: true,
          preserveModulesRoot: 'components',
          globals: {
            vue: 'Vue',
          },
        },
        {
          format: 'cjs',
          dir: 'lib',
          entryFileNames: '[name].cjs',
          preserveModules: true,
          preserveModulesRoot: 'components',
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
        },
      ],
    },
    lib: {
      entry: 'components/index.ts',
      formats: ['es', 'cjs'],
    },
  },
  ssr: {
    external: ['@v-c/utils', 'vue', 'awesome-qr'],
  },
})
