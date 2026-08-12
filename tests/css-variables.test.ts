import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const cssSource = fs.readFileSync(
  path.join(rootDir, 'components/qrcode/src/index.scss'),
  'utf8',
)

describe('CSS variable compatibility', () => {
  it('keeps legacy variables as semantic fallbacks', () => {
    expect(cssSource).toContain('var(--r-qrcode-spin-size, 3px)')
    expect(cssSource).toContain('var(--r-qrcode-primary-color, #1677ff)')
    expect(cssSource).toContain('var(--r-qrcode-primary-color-2, #69b1ff)')
  })

  it('exposes container, image, loading, error, and action variables', () => {
    for (const variable of [
      '--r-qrcode-background-color',
      '--r-qrcode-border-width',
      '--r-qrcode-border-style',
      '--r-qrcode-border-color',
      '--r-qrcode-overflow',
      '--r-qrcode-font-family',
      '--r-qrcode-image-object-fit',
      '--r-qrcode-loading-spinner-size',
      '--r-qrcode-loading-spinner-border-width',
      '--r-qrcode-loading-spinner-color',
      '--r-qrcode-loading-animation-duration',
      '--r-qrcode-error-z-index',
      '--r-qrcode-error-gap',
      '--r-qrcode-error-color',
      '--r-qrcode-error-content-padding',
      '--r-qrcode-action-color',
      '--r-qrcode-action-hover-color',
      '--r-qrcode-action-active-color',
      '--r-qrcode-action-transition-duration',
    ]) {
      expect(cssSource).toContain(variable)
    }
  })
})
