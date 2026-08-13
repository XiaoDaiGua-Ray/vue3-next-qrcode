import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearQRCodeGIFCache,
  downloadBase64File,
  readGIFAsArrayBuffer,
} from '../components/qrcode/src/utils'
import { GIF_RESOURCE_LIMITS } from '../components/qrcode/src/gifLimits'
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

  it('uses the data URL MIME type for the default download extension', () => {
    let downloadedFileName = ''

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloadedFileName = this.download
    })

    downloadBase64File('data:image/gif;base64,abc')

    expect(downloadedFileName).toMatch(/^qrcode-\d+\.gif$/)
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
    const firstRejected = expect(first).rejects.toMatchObject({
      name: 'AbortError',
    })

    clearQRCodeGIFCache()
    firstResponse.resolve(response(arrayBuffer(7)))
    await firstRejected

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
    const firstRejected = expect(first).rejects.toMatchObject({
      name: 'AbortError',
    })
    clearQRCodeGIFCache()
    const second = readGIFAsArrayBuffer('/race.gif')

    firstResponse.resolve(response(arrayBuffer(1)))
    await firstRejected

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

  it('rejects oversized content before reading the response body', async () => {
    const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1))
    const cancel = vi.fn()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) =>
            name === 'content-length'
              ? String(GIF_RESOURCE_LIMITS.maxBytes + 1)
              : null,
        },
        body: { cancel },
        arrayBuffer,
      } as unknown as Response),
    )

    await expect(readGIFAsArrayBuffer('/oversized.gif')).rejects.toThrow(
      'encoded size',
    )
    expect(arrayBuffer).not.toHaveBeenCalled()
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('cancels a streamed response as soon as its byte limit is exceeded', async () => {
    const cancel = vi.fn()
    const oversizedChunk = new Uint8Array(GIF_RESOURCE_LIMITS.maxBytes + 1)
    let readCount = 0

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        body: {
          getReader: () => ({
            read: async () => {
              readCount++

              return readCount === 1
                ? { done: false, value: oversizedChunk }
                : { done: true, value: undefined }
            },
            cancel,
          }),
        },
      } as unknown as Response),
    )

    await expect(
      readGIFAsArrayBuffer('/streamed-too-large.gif'),
    ).rejects.toThrow('encoded size')
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(readCount).toBe(1)
  })

  it('aborts an in-flight GIF request when its consumer cancels', async () => {
    const controller = new AbortController()
    let requestSignal: AbortSignal | undefined

    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined

        return new Promise<Response>((_resolve, reject) => {
          requestSignal?.addEventListener(
            'abort',
            () => reject(new DOMException('aborted', 'AbortError')),
            { once: true },
          )
        })
      }),
    )

    const request = readGIFAsArrayBuffer('/cancel.gif', {
      signal: controller.signal,
    })
    const rejected = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    })

    controller.abort()

    await rejected
    expect(requestSignal?.aborted).toBe(true)
  })

  it('evicts least-recent GIFs when the byte budget is exceeded', async () => {
    const buffer = new ArrayBuffer(GIF_RESOURCE_LIMITS.maxBytes)
    const fetch = vi.fn().mockResolvedValue(response(buffer))

    vi.stubGlobal('fetch', fetch)

    await readGIFAsArrayBuffer('/one.gif')
    await readGIFAsArrayBuffer('/two.gif')
    await readGIFAsArrayBuffer('/three.gif')
    await readGIFAsArrayBuffer('/four.gif')
    await readGIFAsArrayBuffer('/one.gif')

    expect(fetch).toHaveBeenCalledTimes(5)
  })
})
