import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

const external = (id: string): boolean =>
  id === 'vue' || id.startsWith('js-binary-schema-parser/')

export default defineConfig({
  define: {
    __VUE3_NEXT_QRCODE_ENABLE_WORKER__: 'false',
  },
  plugins: [
    vue(),
    vueJsx(),
    dts({
      outDirs: ['es', 'lib'],
      entryRoot: 'components',
      include: ['components/**/*.ts', 'components/**/*.tsx'],
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    }),
  ],
  worker: {
    format: 'es',
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      external,
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
      entry: {
        index: 'components/index.ts',
        client: 'components/client.ts',
      },
      cssFileName: 'style',
    },
  },
  ssr: {
    external: ['vue'],
  },
})
