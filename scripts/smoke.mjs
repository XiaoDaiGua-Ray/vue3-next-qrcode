import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')

async function assertImport(label, importer) {
  try {
    await importer()
    console.log(`ok ${label}`)
  } catch (error) {
    console.error(`not ok ${label}`)
    throw error
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name)

    if (entry.isDirectory()) return walk(absolute)

    return absolute
  })
}

function readProjectFile(file) {
  return fs.readFileSync(path.join(rootDir, file), 'utf8')
}

const requiredPackageFiles = [
  'es/index.mjs',
  'lib/index.cjs',
  'es/client.mjs',
  'lib/client.cjs',
  'es/style.css',
  'lib/style.css',
  'es/style.d.ts',
  'lib/style.d.ts',
  'es/index.d.ts',
  'lib/index.d.ts',
]

for (const file of requiredPackageFiles) {
  assert(fs.existsSync(path.join(rootDir, file)), `${file} should exist`)
}
console.log('ok package files exist')

await assertImport(
  'esm root import is ssr-safe',
  () => import('vue3-next-qrcode'),
)
await assertImport(
  'esm client import is ssr-safe',
  () => import('vue3-next-qrcode/client'),
)
await assertImport('cjs root require is ssr-safe', () =>
  Promise.resolve(require('vue3-next-qrcode')),
)
await assertImport('cjs client require is ssr-safe', () =>
  Promise.resolve(require('vue3-next-qrcode/client')),
)

const esmRoot = await import('vue3-next-qrcode')
const cjsRoot = require('vue3-next-qrcode')
const expectedCorrectionLevels = { L: 1, M: 0, Q: 3, H: 2 }

assert(
  JSON.stringify(esmRoot.QRErrorCorrectLevel) ===
    JSON.stringify(expectedCorrectionLevels),
  'ESM root should export the documented correction-level mapping',
)
assert(
  JSON.stringify(cjsRoot.QRErrorCorrectLevel) ===
    JSON.stringify(expectedCorrectionLevels),
  'CJS root should export the documented correction-level mapping',
)
console.log('ok correction-level mapping exports')

for (const subpath of [
  'vue3-next-qrcode/style.css',
  'vue3-next-qrcode/es/style.css',
  'vue3-next-qrcode/lib/style.css',
]) {
  assert(require.resolve(subpath), `${subpath} should resolve`)
}
console.log('ok style exports resolve')

const packageManifest = JSON.parse(readProjectFile('package.json'))

for (const subpath of ['./style.css', './es/style.css', './lib/style.css']) {
  const styleExport = packageManifest.exports[subpath]

  assert(
    typeof styleExport?.types === 'string' &&
      fs.existsSync(path.join(rootDir, styleExport.types)),
    `${subpath} should publish a declaration entry`,
  )
}
console.log('ok style exports publish declaration entries')

const builtFiles = walk(path.join(rootDir, 'es')).concat(
  walk(path.join(rootDir, 'lib')),
)
const privatePathPattern = /(?:^|[/\\])(?:\.pnpm|node_modules)(?:[/\\]|$)/
const badFiles = builtFiles.filter((file) => privatePathPattern.test(file))
const badContentFiles = builtFiles.filter((file) => {
  const content = fs.readFileSync(file, 'utf8')

  return content.includes('.pnpm') || content.includes('node_modules')
})

assert(
  badFiles.length === 0 && badContentFiles.length === 0,
  [
    'build output should not contain package-manager private paths:',
    ...badFiles,
    ...badContentFiles,
  ].join('\n'),
)
console.log('ok build output has no private node_modules paths')

const forbiddenPackageReferences = [
  'components/qrcode/deps',
  'skia-canvas-lib',
  'path-browserify',
]
const badReferenceFiles = builtFiles.filter((file) => {
  const content = fs.readFileSync(file, 'utf8')

  return forbiddenPackageReferences.some((reference) =>
    content.includes(reference),
  )
})

assert(
  badReferenceFiles.length === 0,
  [
    'build output should not reference obsolete qrcode deps:',
    ...badReferenceFiles,
  ].join('\n'),
)
console.log('ok build output has no obsolete deps references')

const publicDeclarations = [
  'es/index.d.ts',
  'es/client.d.ts',
  'es/qrcode/src/QRCode.d.ts',
  'es/qrcode/src/QRCodeClient.d.ts',
  'es/qrcode/src/useQRCode.d.ts',
  'es/qrcode/src/useQRCodeDownload.d.ts',
].map(readProjectFile)
const incompatibleVueDeclarationPatterns = [
  /ExtractPublicPropTypes/,
  /ShallowRef</,
  /Ref<[^>]+,[^>]+>/,
  /\bMaybeRef</,
]

for (const pattern of incompatibleVueDeclarationPatterns) {
  assert(
    !publicDeclarations.some((declaration) => pattern.test(declaration)),
    `public declarations should not contain Vue 3.5-only shape ${pattern}`,
  )
}
console.log('ok public declarations avoid Vue 3.5-only shapes')

for (const entry of [
  'es/qrcode/src/renderer.mjs',
  'lib/qrcode/src/renderer.cjs',
]) {
  const content = readProjectFile(entry)

  assert(!content.includes('qrcode.worker'), `${entry} should not load worker`)
  assert(
    !content.includes('renderQRCodeInWorker'),
    `${entry} should not load worker renderer`,
  )
}
console.log('ok packaged renderer uses main-thread path')

for (const entry of [
  'es/index.mjs',
  'es/qrcode/src/QRCode.mjs',
  'es/qrcode/src/useQRCode.mjs',
]) {
  const content = fs.readFileSync(path.join(rootDir, entry), 'utf8')

  assert(!content.includes('awesome-qr'), `${entry} should lazy-load AwesomeQR`)
  assert(
    !content.includes('gifuct-js'),
    `${entry} should not import GIF parser`,
  )
  assert(
    !content.includes('GIFEncoder'),
    `${entry} should not import GIF encoder`,
  )
}
console.log('ok public entries lazy-load rendering core')

const awesomeQRSource = readProjectFile('components/qrcode/core/awesome-qr.js')

assert(
  awesomeQRSource.includes('return this._draw()'),
  'AwesomeQR.draw should return _draw directly',
)
assert(
  !awesomeQRSource.includes(
    'new Promise((resolve) => this._draw().then(resolve))',
  ),
  'AwesomeQR.draw should not swallow _draw rejections',
)
assert(
  awesomeQRSource.includes('_normalizeGIFFrameDelay(frame.delay)'),
  'GIF output should set delay per frame',
)
assert(
  awesomeQRSource.includes('previousFrame.disposalType === 2') &&
    awesomeQRSource.includes('previousFrame.disposalType === 3'),
  'GIF output should handle disposal types 2 and 3',
)
assert(
  awesomeQRSource.includes('_assertParsedGIF') &&
    awesomeQRSource.includes('_decodeGIF') &&
    awesomeQRSource.includes('GIF_RESOURCE_LIMITS'),
  'GIF output should preflight resource usage before decompression',
)
console.log('ok core render guards are present')

const propsSource = readProjectFile('components/qrcode/src/props.ts')

assert(
  propsSource.includes('validator: isQRCodeMaskPattern'),
  'maskPattern prop should validate 0..7',
)
assert(
  propsSource.includes('validator: isQRCodeVersion'),
  'version prop should validate 1..40',
)
assert(
  propsSource.includes('validator: isQRCodeDotScale'),
  'dotScale prop should validate (0, 1]',
)
console.log('ok prop validators are present')

const consumerDir = fs.mkdtempSync(path.join(rootDir, '.smoke-dts-'))
const consumerFile = path.join(consumerDir, 'consumer.ts')

process.on('exit', () => {
  fs.rmSync(consumerDir, { recursive: true, force: true })
})

fs.writeFileSync(
  consumerFile,
  [
    "import { QRCodeGenerationCancelledError, clearQRCodeGIFCache, useQRCode, useQRCodeDownload } from 'vue3-next-qrcode'",
    "import type { ComponentOptions, DefineProvider, QRCodeGenerationStatus, QRCodeInst, QRCodeOptions, QRCodeProps } from 'vue3-next-qrcode'",
    '',
    'const components: ComponentOptions = { data: { scale: 1 } }',
    "const options: QRCodeOptions = { text: 'hello', components }",
    'const instance: QRCodeInst = { downloadQRCode: async () => {} }',
    'const hook = useQRCode()',
    "const configuredHook = useQRCode({ defaultOptions: { text: 'default' }, concurrency: 'latest' })",
    'const download = useQRCodeDownload(hook.qrcodeURL)',
    "const props: QRCodeProps = { text: 'component' }",
    "const theme: DefineProvider = { '--r-qrcode-action-color': '#7f56d9' }",
    "const status: QRCodeGenerationStatus = 'cancelled'",
    'download.canDownload.value',
    'hook.canDownload.value',
    'hook.download()',
    "hook.generate({ text: 'hook' })",
    'configuredHook.generate()',
    'configuredHook.cancel()',
    'configuredHook.reset()',
    'configuredHook.dispose()',
    'new QRCodeGenerationCancelledError()',
    'instance.downloadQRCode()',
    'clearQRCodeGIFCache()',
    'options.text',
    'props.text',
    'theme',
    'status',
    '',
  ].join('\n'),
)

const tscBin = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc',
)
const tscResult = spawnSync(
  tscBin,
  [
    '--ignoreConfig',
    '--noEmit',
    '--strict',
    '--moduleResolution',
    'bundler',
    '--module',
    'ESNext',
    '--target',
    'ESNext',
    '--lib',
    'DOM,ESNext',
    consumerFile,
  ],
  {
    cwd: rootDir,
    encoding: 'utf8',
  },
)

assert(
  tscResult.status === 0,
  [
    'declaration consumer smoke failed:',
    tscResult.stdout,
    tscResult.stderr,
  ].join('\n'),
)
console.log('ok declaration consumer smoke')

const { QRCodeModel } = await import('../es/qrcode/core/qrcode.mjs')
const qr = new QRCodeModel(-1, esmRoot.QRErrorCorrectLevel.M)

qr.addData('hello 👋 二维码')
qr.make()
assert(qr.getModuleCount() > 0, 'emoji QR should render modules')
console.log('ok emoji text encoding')
