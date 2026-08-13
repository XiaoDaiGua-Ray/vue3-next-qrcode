import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const awesomeQRSource = fs.readFileSync(
  path.join(rootDir, 'components/qrcode/core/awesome-qr.js'),
  'utf8',
)

describe('AwesomeQR source guards', () => {
  it('propagates draw failures to callers', () => {
    expect(awesomeQRSource).toContain('return this._draw()')
    expect(awesomeQRSource).not.toContain(
      'new Promise((resolve) => this._draw().then(resolve))',
    )
  })

  it('initializes canvas from merged defaults', () => {
    expect(awesomeQRSource).toContain(
      'new Canvas(_options.size, _options.size)',
    )
  })

  it('clones nested component defaults for every instance', () => {
    expect(awesomeQRSource).toContain(
      'Object.entries(AwesomeQR.defaultComponentOptions)',
    )
    expect(awesomeQRSource).toContain(
      'Object.assign({}, defaultValue, componentOptions[key])',
    )
    expect(awesomeQRSource).not.toContain(
      '_options.components = AwesomeQR.defaultComponentOptions',
    )
  })

  it('keeps frame delay and disposal integration in the render loop', () => {
    expect(awesomeQRSource).toContain('_normalizeGIFFrameDelay(frame.delay)')
    expect(awesomeQRSource).toContain('_restoreGIFBackground')
    expect(awesomeQRSource).toContain('previousFrame.disposalType === 3')
  })
})
