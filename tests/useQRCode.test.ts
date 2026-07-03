import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQRCode } from '../components/qrcode/src/useQRCode'
import { renderQRCode } from '../components/qrcode/src/renderer'
import { clearQRCodeGIFCache } from '../components/qrcode/src/utils'
import { arrayBuffer, deferred } from './helpers'

vi.mock('../components/qrcode/src/renderer', () => ({
  renderQRCode: vi.fn(),
}))

const mockedRenderQRCode = vi.mocked(renderQRCode)

const response = (buffer: ArrayBuffer): Response =>
  ({
    ok: true,
    status: 200,
    arrayBuffer: vi.fn().mockResolvedValue(buffer),
  }) as unknown as Response

describe('useQRCode', () => {
  beforeEach(() => {
    clearQRCodeGIFCache()
    mockedRenderQRCode.mockReset()
  })

  it('generates a QR code and exposes download state', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,ok')
    const qrcode = useQRCode()

    await expect(qrcode.generate({ text: 'hello', size: 200 })).resolves.toBe(
      'data:image/png;base64,ok',
    )

    expect(mockedRenderQRCode).toHaveBeenCalledWith({
      text: 'hello',
      size: 200,
    })
    expect(qrcode.qrcodeURL.value).toBe('data:image/png;base64,ok')
    expect(qrcode.canDownload.value).toBe(true)
  })

  it('loads a GIF URL and removes undefined options before rendering', async () => {
    const gif = arrayBuffer(9)
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(url: string) => Promise<Response>>()
        .mockResolvedValue(response(gif)),
    )
    mockedRenderQRCode.mockResolvedValue('data:image/gif;base64,ok')
    const qrcode = useQRCode()

    await qrcode.generate({
      text: 'gif',
      gifBackgroundURL: '/gif.gif',
      colorDark: undefined,
      margin: 12,
    })

    expect(mockedRenderQRCode).toHaveBeenCalledWith({
      text: 'gif',
      margin: 12,
      gifBackground: gif,
    })
  })

  it('sets error and rethrows render failures', async () => {
    const error = new Error('render failed')
    mockedRenderQRCode.mockRejectedValue(error)
    const qrcode = useQRCode()

    await expect(qrcode.generate({ text: 'bad' })).rejects.toThrow(
      'render failed',
    )

    expect(qrcode.error.value).toBe(error)
  })

  it('rejects concurrent generation and keeps the active render alive', async () => {
    const pending = deferred<string>()
    mockedRenderQRCode.mockReturnValue(pending.promise)
    const qrcode = useQRCode()
    const first = qrcode.generate({ text: 'first' })

    await expect(qrcode.generate({ text: 'second' })).rejects.toThrow(
      'already in progress',
    )

    pending.resolve('data:image/png;base64,first')

    await expect(first).resolves.toBe('data:image/png;base64,first')
  })

  it('clears generated value, error, and download state', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,ok')
    const qrcode = useQRCode()

    await qrcode.generate({ text: 'hello' })
    qrcode.clear()

    expect(qrcode.qrcodeURL.value).toBeUndefined()
    expect(qrcode.error.value).toBeNull()
    expect(qrcode.canDownload.value).toBe(false)
  })
})
