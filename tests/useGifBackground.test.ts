import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGifBackground } from '../components/qrcode/src/useGifBackground'
import { readGIFAsArrayBuffer } from '../components/qrcode/src/utils'
import { arrayBuffer, deferred } from './helpers'

vi.mock('../components/qrcode/src/utils', () => ({
  readGIFAsArrayBuffer: vi.fn(),
}))

const mockedReadGIF = vi.mocked(readGIFAsArrayBuffer)

describe('useGifBackground', () => {
  beforeEach(() => {
    mockedReadGIF.mockReset()
  })

  it('loads and stores a URL-bound GIF buffer', async () => {
    const buffer = arrayBuffer(1)
    mockedReadGIF.mockResolvedValue(buffer)
    const gif = useGifBackground()

    await expect(gif.load('/a.gif')).resolves.toBe(buffer)

    expect(gif.getBuffer('/a.gif')).toBe(buffer)
    expect(gif.getBuffer('/b.gif')).toBeNull()
    expect(gif.gifBackground.value).toEqual({ url: '/a.gif', buffer })
  })

  it('ignores stale URL load results', async () => {
    const first = deferred<ArrayBuffer>()
    const second = deferred<ArrayBuffer>()
    mockedReadGIF
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const gif = useGifBackground()

    const firstLoad = gif.load('/first.gif')
    const secondLoad = gif.load('/second.gif')
    const secondBuffer = arrayBuffer(2)
    const firstBuffer = arrayBuffer(1)

    second.resolve(secondBuffer)
    await secondLoad
    first.resolve(firstBuffer)
    await firstLoad

    expect(gif.getBuffer('/second.gif')).toBe(secondBuffer)
    expect(gif.getBuffer('/first.gif')).toBeNull()
  })

  it('does not store pending results after clear or dispose', async () => {
    const first = deferred<ArrayBuffer>()
    const second = deferred<ArrayBuffer>()
    mockedReadGIF
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const gif = useGifBackground()

    const firstLoad = gif.load('/first.gif')
    gif.clear()
    first.resolve(arrayBuffer(1))
    await firstLoad
    expect(gif.gifBackground.value).toBeNull()

    const secondLoad = gif.load('/second.gif')
    gif.dispose()
    second.resolve(arrayBuffer(2))
    await secondLoad

    expect(gif.gifBackground.value).toBeNull()
  })
})
