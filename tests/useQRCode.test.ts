import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import {
  QRCodeGenerationCancelledError,
  useQRCode,
} from '../components/qrcode/src/useQRCode'
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
    expect(qrcode.status.value).toBe('success')
    expect(qrcode.isLoading.value).toBe(false)
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
    expect(qrcode.status.value).toBe('error')
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

  it('merges default options and allows no-argument generation with default text', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,defaults')
    const qrcode = useQRCode({
      defaultOptions: {
        text: 'default text',
        size: 180,
        colorDark: '#111111',
      },
    })

    await qrcode.generate({ size: 240 })
    await qrcode.generate()

    expect(mockedRenderQRCode).toHaveBeenNthCalledWith(1, {
      text: 'default text',
      size: 240,
      colorDark: '#111111',
    })
    expect(mockedRenderQRCode).toHaveBeenNthCalledWith(2, {
      text: 'default text',
      size: 180,
      colorDark: '#111111',
    })
  })

  it('keeps only the latest generation owner and rejects replaced promises', async () => {
    const firstRender = deferred<string>()
    const latestRender = deferred<string>()
    mockedRenderQRCode
      .mockReturnValueOnce(firstRender.promise)
      .mockReturnValueOnce(latestRender.promise)
    const qrcode = useQRCode({ concurrency: 'latest' })

    const first = qrcode.generate({ text: 'first' })
    const latest = qrcode.generate({ text: 'latest' })

    await expect(first).rejects.toBeInstanceOf(QRCodeGenerationCancelledError)
    expect(qrcode.status.value).toBe('loading')

    firstRender.resolve('data:image/png;base64,old')
    await vi.waitFor(() => expect(mockedRenderQRCode).toHaveBeenCalledTimes(2))
    latestRender.resolve('data:image/png;base64,latest')

    await expect(latest).resolves.toBe('data:image/png;base64,latest')
    expect(qrcode.qrcodeURL.value).toBe('data:image/png;base64,latest')
    expect(qrcode.status.value).toBe('success')
  })

  it('cancels logical ownership without clearing the last successful result', async () => {
    mockedRenderQRCode.mockResolvedValueOnce('data:image/png;base64,kept')
    const pending = deferred<string>()
    mockedRenderQRCode.mockReturnValueOnce(pending.promise)
    const qrcode = useQRCode()

    await qrcode.generate({ text: 'kept' })
    const active = qrcode.generate({ text: 'pending' })
    const cancelled = expect(active).rejects.toBeInstanceOf(
      QRCodeGenerationCancelledError,
    )

    qrcode.cancel()
    await cancelled

    expect(qrcode.qrcodeURL.value).toBe('data:image/png;base64,kept')
    expect(qrcode.status.value).toBe('cancelled')
    expect(qrcode.isLoading.value).toBe(false)

    pending.resolve('data:image/png;base64,late')
    await vi.waitFor(() => expect(qrcode.isLoading.value).toBe(false))
    expect(qrcode.qrcodeURL.value).toBe('data:image/png;base64,kept')
  })

  it('resets all public state and keeps clear as a compatibility alias', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,ok')
    const qrcode = useQRCode()

    await qrcode.generate({ text: 'hello' })
    qrcode.reset()

    expect(qrcode.qrcodeURL.value).toBeUndefined()
    expect(qrcode.error.value).toBeNull()
    expect(qrcode.status.value).toBe('idle')
    expect(qrcode.canDownload.value).toBe(false)

    await qrcode.generate({ text: 'again' })
    qrcode.clear()
    expect(qrcode.qrcodeURL.value).toBeUndefined()
    expect(qrcode.status.value).toBe('idle')
  })

  it('disposes automatically with a Vue effect scope and rejects future work', async () => {
    const scope = effectScope()
    const qrcode = scope.run(() => useQRCode())!

    scope.stop()

    await expect(qrcode.generate({ text: 'disposed' })).rejects.toBeInstanceOf(
      QRCodeGenerationCancelledError,
    )
    expect(qrcode.status.value).toBe('cancelled')
  })

  it('rejects missing text and exposes the validation error state', async () => {
    const qrcode = useQRCode({ defaultOptions: { size: 200 } })

    await expect(qrcode.generate({} as { text: string })).rejects.toThrow(
      'Text is required',
    )

    expect(qrcode.status.value).toBe('error')
    expect(qrcode.error.value?.message).toContain('Text is required')
  })

  it('clears generated value, error, and download state', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,ok')
    const qrcode = useQRCode()

    await qrcode.generate({ text: 'hello' })
    qrcode.clear()

    expect(qrcode.qrcodeURL.value).toBeUndefined()
    expect(qrcode.error.value).toBeNull()
    expect(qrcode.canDownload.value).toBe(false)
    expect(qrcode.status.value).toBe('idle')
  })
})
