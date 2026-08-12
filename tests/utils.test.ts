import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearQRCodeGIFCache,
  downloadBase64File,
  readGIFAsArrayBuffer,
} from '../components/qrcode/src/utils'
import { arrayBuffer, deferred } from './helpers'

const response = (buffer: ArrayBuffer, ok = true, status = 200): Response =>
  ({
    ok,
    status,
    arrayBuffer: vi.fn().mockResolvedValue(buffer),
  }) as unknown as Response

describe('utils', () => {
  beforeEach(() => {
    clearQRCodeGIFCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clearQRCodeGIFCache()
    document.body.innerHTML = ''
  })

  it('downloads a data url through a temporary link', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    downloadBase64File('data:image/png;base64,abc', 'code.png')

    expect(click).toHaveBeenCalledTimes(1)
    expect(document.querySelector('a')).toBeNull()
  })

  it('dedupes cached GIF fetches by URL', async () => {
    const buffer = arrayBuffer(1, 2, 3)
    const fetch = vi
      .fn<(url: string) => Promise<Response>>()
      .mockResolvedValue(response(buffer))
    vi.stubGlobal('fetch', fetch)

    await expect(readGIFAsArrayBuffer('/a.gif')).resolves.toBe(buffer)
    await expect(readGIFAsArrayBuffer('/a.gif')).resolves.toBe(buffer)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('dedupes in-flight GIF fetches', async () => {
    const pending = deferred<Response>()
    const fetch = vi.fn<(url: string) => Promise<Response>>(
      () => pending.promise,
    )
    vi.stubGlobal('fetch', fetch)

    const first = readGIFAsArrayBuffer('/same.gif')
    const second = readGIFAsArrayBuffer('/same.gif')
    const buffer = arrayBuffer(4, 5, 6)

    pending.resolve(response(buffer))

    await expect(first).resolves.toBe(buffer)
    await expect(second).resolves.toBe(buffer)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not repopulate cache from a stale request after clearing cache', async () => {
    const firstResponse = deferred<Response>()
    const secondBuffer = arrayBuffer(8)
    const fetch = vi
      .fn<(url: string) => Promise<Response>>()
      .mockReturnValueOnce(firstResponse.promise)
      .mockResolvedValueOnce(response(secondBuffer))
    vi.stubGlobal('fetch', fetch)

    const first = readGIFAsArrayBuffer('/stale.gif')

    clearQRCodeGIFCache()
    firstResponse.resolve(response(arrayBuffer(7)))
    await first

    await expect(readGIFAsArrayBuffer('/stale.gif')).resolves.toBe(secondBuffer)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not let an old finally remove a newer request for the same URL', async () => {
    const firstResponse = deferred<Response>()
    const secondResponse = deferred<Response>()
    const fetch = vi
      .fn<(url: string) => Promise<Response>>()
      .mockReturnValueOnce(firstResponse.promise)
      .mockReturnValueOnce(secondResponse.promise)
    vi.stubGlobal('fetch', fetch)

    const first = readGIFAsArrayBuffer('/race.gif')
    clearQRCodeGIFCache()
    const second = readGIFAsArrayBuffer('/race.gif')

    firstResponse.resolve(response(arrayBuffer(1)))
    await first

    const dedupedSecond = readGIFAsArrayBuffer('/race.gif')
    const latestBuffer = arrayBuffer(2)
    secondResponse.resolve(response(latestBuffer))

    await expect(second).resolves.toBe(latestBuffer)
    await expect(dedupedSecond).resolves.toBe(latestBuffer)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws a clear error when GIF fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(url: string) => Promise<Response>>()
        .mockResolvedValue(response(arrayBuffer(), false, 404)),
    )

    await expect(readGIFAsArrayBuffer('/missing.gif')).rejects.toThrow(
      'Failed to fetch GIF',
    )
  })
})
