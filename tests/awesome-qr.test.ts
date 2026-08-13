import { describe, expect, it, vi } from 'vitest'
import { AwesomeQR } from '../components/qrcode/core/awesome-qr'
import GIFEncoder from '../components/qrcode/core/gif.js/GIFEncoder.js'
import {
  decompressFrames,
  parseGIF,
} from '../components/qrcode/core/gifuct-js/index.js'
import { GIF_RESOURCE_LIMITS } from '../components/qrcode/src/gifLimits'

type AwesomeQRTestAPI = {
  _assertGIFBuffer: (buffer: ArrayBuffer) => void
  _assertParsedGIF: (parsedGIF: unknown) => {
    width: number
    height: number
    totalPixels: number
    frameCount: number
  }
  _decodeGIF: (
    buffer: ArrayBuffer,
    gifModule: {
      parseGIF: (buffer: ArrayBuffer) => unknown
      decompressFrames: (parsedGIF: unknown, buildPatches: boolean) => unknown[]
    },
  ) => unknown
  _getGIFBackgroundColor: (parsedGIF: unknown) => string | null
  _restoreGIFBackground: (
    context: {
      fillStyle: string
      clearRect: (...args: number[]) => void
      fillRect: (...args: number[]) => void
    },
    color: string | null,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void
  _resolveOptions: (options: Record<string, unknown>) => {
    components: Record<string, { scale?: number }>
  }
}

const awesomeQR = AwesomeQR as unknown as AwesomeQRTestAPI

const rgbaFrame = (red: number, green: number, blue: number): Uint8Array =>
  new Uint8Array([
    red,
    green,
    blue,
    255,
    red,
    green,
    blue,
    255,
    red,
    green,
    blue,
    255,
    red,
    green,
    blue,
    255,
  ])

const createDisposalGIF = (): ArrayBuffer => {
  const encoder = new GIFEncoder(2, 2)

  encoder.setRepeat(0)
  encoder.setDispose(2)
  encoder.addFrame(rgbaFrame(32, 96, 160))
  encoder.setDispose(3)
  encoder.addFrame(rgbaFrame(160, 48, 96))
  encoder.finish()

  return encoder.stream().toFlattenUint8Array().buffer as ArrayBuffer
}

describe('AwesomeQR GIF behavior', () => {
  it('rejects oversized encoded GIF data', () => {
    const oversized = new ArrayBuffer(GIF_RESOURCE_LIMITS.maxBytes + 1)

    expect(() => awesomeQR._assertGIFBuffer(oversized)).toThrow('encoded size')
  })

  it('rejects parsed resource limits before frame decompression', () => {
    const frames = Array.from(
      { length: GIF_RESOURCE_LIMITS.maxFrames + 1 },
      () => ({
        image: {
          descriptor: { left: 0, top: 0, width: 1, height: 1 },
        },
      }),
    )
    const decompress = vi.fn(() => [])

    expect(() =>
      awesomeQR._decodeGIF(new Uint8Array([1]).buffer, {
        parseGIF: () => ({
          lsd: { width: 1, height: 1 },
          frames,
        }),
        decompressFrames: decompress,
      }),
    ).toThrow('frame count')
    expect(decompress).not.toHaveBeenCalled()
  })

  it('limits estimated decoded pixels before allocating patches', () => {
    const frames = Array.from({ length: 5 }, () => ({
      image: {
        descriptor: {
          left: 0,
          top: 0,
          width: GIF_RESOURCE_LIMITS.maxDimension,
          height: GIF_RESOURCE_LIMITS.maxDimension,
        },
      },
    }))

    expect(() =>
      awesomeQR._assertParsedGIF({
        lsd: {
          width: GIF_RESOURCE_LIMITS.maxDimension,
          height: GIF_RESOURCE_LIMITS.maxDimension,
        },
        frames,
      }),
    ).toThrow('total frame pixels')
  })

  it('parses real disposal 2 and 3 frames and restores logical background', () => {
    const gif = createDisposalGIF()
    const parsedGIF = parseGIF(gif)
    const metadata = awesomeQR._assertParsedGIF(parsedGIF)
    const frames = decompressFrames(parsedGIF, true)
    const backgroundColor = awesomeQR._getGIFBackgroundColor(parsedGIF)
    const context = {
      fillStyle: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
    }

    expect(metadata).toMatchObject({ width: 2, height: 2, frameCount: 2 })
    expect(frames.map((frame) => frame.disposalType)).toEqual([2, 3])
    expect(backgroundColor).toMatch(/^rgb\(/)
    expect(backgroundColor).not.toBe('rgb(255,255,255)')

    awesomeQR._restoreGIFBackground(context, backgroundColor, 0, 0, 2, 2)

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 2, 2)
    expect(context.fillStyle).toBe(backgroundColor)
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 2, 2)
  })

  it('keeps component scales unless dotScale is explicitly supplied', () => {
    const components = {
      data: { scale: 0.7 },
      timing: { scale: 0.8 },
      alignment: { scale: 0.9 },
      cornerAlignment: { scale: 0.6 },
    }
    const preserved = awesomeQR._resolveOptions({ components })
    const overridden = awesomeQR._resolveOptions({
      components,
      dotScale: 0.5,
    })

    expect(preserved.components.data.scale).toBe(0.7)
    expect(preserved.components.timing.scale).toBe(0.8)
    expect(preserved.components.alignment.scale).toBe(0.9)
    expect(overridden.components.data.scale).toBe(0.5)
    expect(overridden.components.timing.scale).toBe(0.5)
    expect(overridden.components.alignment.scale).toBe(0.5)
    expect(overridden.components.cornerAlignment.scale).toBe(0.6)
  })
})
