import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const mode = process.argv[2]
const tarball = path.resolve(process.argv[3] ?? '')

if (
  !['vue-3.0.1', 'vue-3.5.41', 'nuxt-4.5.2'].includes(mode) ||
  !fs.existsSync(tarball)
) {
  throw new Error(
    'Usage: node scripts/release-compat.mjs <vue-3.0.1|vue-3.5.41|nuxt-4.5.2> <tarball>',
  )
}

const fixtureDir = fs.mkdtempSync(
  path.join('/private/tmp', `vue3-next-qrcode-${mode}-`),
)
const npmCache = path.join(fixtureDir, '.npm-cache')

const write = (file, content) => {
  const absolute = path.join(fixtureDir, file)

  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  fs.writeFileSync(absolute, content)
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: fixtureDir,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`)
  }
}

const install = (...packages) =>
  run('npm', [
    'install',
    '--save-exact',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--cache',
    npmCache,
    ...packages,
  ])

const verifyNuxtSSR = async () => {
  const port = 49321
  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: fixtureDir,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
    },
    stdio: 'pipe',
  })
  let serverError = ''

  server.stderr.on('data', (chunk) => {
    serverError += String(chunk)
  })

  try {
    let html = ''

    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`)

        if (response.ok) {
          html = await response.text()
          break
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    if (!html.includes('id="ssr-fallback"')) {
      throw new Error(`Nuxt SSR fallback missing. ${serverError}`)
    }

    if (html.includes('data-component="VUE3_NEXT_QRCODE"')) {
      throw new Error('Client-only QR image should not be rendered by SSR')
    }

    console.log('ok Nuxt SSR fallback and client-only boundary')
  } finally {
    server.kill('SIGTERM')
  }
}

write(
  'package.json',
  `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`,
)

if (mode === 'vue-3.0.1' || mode === 'vue-3.5.41') {
  const vueVersion = mode === 'vue-3.0.1' ? '3.0.1' : '3.5.41'
  const typescriptVersion = mode === 'vue-3.0.1' ? '4.1.6' : '6.0.3'
  const modernTypeScript = mode === 'vue-3.5.41'

  install(
    tarball,
    `vue@${vueVersion}`,
    'vite@8.0.14',
    `typescript@${typescriptVersion}`,
  )
  write(
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          skipLibCheck: false,
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: modernTypeScript ? 'Bundler' : 'Node',
          lib: ['ES2020', 'DOM'],
          noEmit: true,
          ...(modernTypeScript
            ? { noUncheckedSideEffectImports: true }
            : undefined),
        },
        include: ['src/**/*.ts'],
      },
      null,
      2,
    )}\n`,
  )
  write(
    'index.html',
    '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
  )
  write(
    'src/main.ts',
    `import { createApp, h } from 'vue'
import {
  QRErrorCorrectLevel,
  QRCodeGenerationCancelledError,
  Vue3NextQrcode,
  useQRCode,
} from 'vue3-next-qrcode'
import type { DefineProvider, QRCodeProps } from 'vue3-next-qrcode'
import 'vue3-next-qrcode/style.css'

const props: QRCodeProps = { text: 'Vue ${vueVersion} component' }
const highCorrectionLevel = QRErrorCorrectLevel.H
const theme: DefineProvider = {
  '--r-qrcode-background-color': '#101828',
  '--r-qrcode-border-color': '#7f56d9',
  '--r-qrcode-border-width': '3px',
  '--r-qrcode-border-radius': '20px',
  '--r-qrcode-action-color': '#fdb022',
}

createApp({
  setup() {
    const hook = useQRCode({
      concurrency: 'latest',
      defaultOptions: {
        text: 'Vue ${vueVersion} hook',
        size: 180,
        correctLevel: highCorrectionLevel,
      },
    })

    void hook.generate().catch((error: unknown) => {
      if (!(error instanceof QRCodeGenerationCancelledError)) throw error
    })

    return () =>
      h('main', [
        h('section', { id: 'default-theme' }, [h(Vue3NextQrcode, props)]),
        h('section', { id: 'custom-theme' }, [
          h(Vue3NextQrcode, { text: 'Vue ${vueVersion} themed', defineProvider: theme }),
        ]),
        h('section', { id: 'hook-result' }, [
          h('output', { id: 'hook-status' }, hook.status.value),
          typeof hook.qrcodeURL.value === 'string'
            ? h('img', { id: 'hook-image', src: hook.qrcodeURL.value })
            : null,
        ]),
      ])
  },
}).mount('#app')
`,
  )

  run('npx', ['--no-install', 'tsc', '--project', 'tsconfig.json'])
  run('npx', ['--no-install', 'vite', 'build'])
  console.log(
    `ok Vue ${vueVersion} strict declarations, CSS import, and Vite build`,
  )
} else {
  install(tarball, 'nuxt@4.5.2')
  write(
    'nuxt.config.ts',
    `export default defineNuxtConfig({
  compatibilityDate: '2026-08-12',
  css: ['vue3-next-qrcode/style.css'],
})
`,
  )
  write(
    'app/app.vue',
    `<script setup lang="ts">
import { QRCodeClient } from 'vue3-next-qrcode/client'
</script>

<template>
  <main>
    <ClientOnly>
      <QRCodeClient
        text="Nuxt 4.5.2 client"
        :define-provider="{
          '--r-qrcode-background-color': '#101828',
          '--r-qrcode-border-color': '#7f56d9',
          '--r-qrcode-border-width': '3px',
          '--r-qrcode-border-radius': '20px',
        }"
      />
      <template #fallback>
        <div id="ssr-fallback" style="width: 160px; height: 160px">
          Loading QR code
        </div>
      </template>
    </ClientOnly>
  </main>
</template>
`,
  )

  run('npx', ['--no-install', 'nuxt', 'build'])
  await verifyNuxtSSR()
}

console.log(`fixture=${fixtureDir}`)
console.log(`package=${path.relative(rootDir, tarball)}`)
