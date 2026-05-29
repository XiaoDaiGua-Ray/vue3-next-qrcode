import fs from 'node:fs'
import path from 'node:path'
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

for (const subpath of [
  'vue3-next-qrcode/style.css',
  'vue3-next-qrcode/es/style.css',
  'vue3-next-qrcode/lib/style.css',
]) {
  assert(require.resolve(subpath), `${subpath} should resolve`)
}
console.log('ok style exports resolve')

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

const { QRCodeModel, QRErrorCorrectLevel } =
  await import('../es/qrcode/core/qrcode.mjs')
const qr = new QRCodeModel(-1, QRErrorCorrectLevel.M)

qr.addData('hello 👋 二维码')
qr.make()
assert(qr.getModuleCount() > 0, 'emoji QR should render modules')
console.log('ok emoji text encoding')
