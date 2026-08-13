import { GIF_RESOURCE_LIMITS } from './gifLimits'

type ReadGIFOptions = {
  signal?: AbortSignal
}

type GIFRequestRecord = {
  controller: AbortController
  promise: Promise<ArrayBuffer>
  consumers: number
  settled: boolean
}

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

const createAbortError = (reason?: unknown): Error => {
  if (reason instanceof Error) return reason

  return new DOMException('The operation was aborted', 'AbortError')
}

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === 'AbortError' || error.name === 'TimeoutError')

const assertGIFBufferSize = (byteLength: number): void => {
  if (byteLength > GIF_RESOURCE_LIMITS.maxBytes) {
    throw new Error(
      `GIF background encoded size ${byteLength} exceeds the maximum ${GIF_RESOURCE_LIMITS.maxBytes} bytes.`,
    )
  }
}

const getDataURLExtension = (dataURL: string): string => {
  const mime = /^data:([^;,]+)/i.exec(dataURL)?.[1]?.toLowerCase()

  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/svg+xml') return 'svg'

  return 'png'
}

/**
 * Download base64 encoded file
 * Only works in browser environment
 */
export const downloadBase64File = (base64: string, fileName?: string): void => {
  if (!isBrowser()) {
    console.warn('downloadBase64File is only available in browser environment')
    return
  }

  const link = document.createElement('a')

  link.href = base64
  link.download =
    fileName || `qrcode-${Date.now()}.${getDataURLExtension(base64)}`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const gifCache = new Map<string, ArrayBuffer>()
const gifRequests = new Map<string, GIFRequestRecord>()
let gifCacheBytes = 0
let gifCacheVersion = 0

const deleteGIFCacheEntry = (url: string): void => {
  const cached = gifCache.get(url)

  if (!cached) return

  gifCacheBytes -= cached.byteLength
  gifCache.delete(url)
}

const setGIFCache = (url: string, buffer: ArrayBuffer): void => {
  deleteGIFCacheEntry(url)
  gifCache.set(url, buffer)
  gifCacheBytes += buffer.byteLength

  while (
    gifCache.size > GIF_RESOURCE_LIMITS.maxCacheEntries ||
    gifCacheBytes > GIF_RESOURCE_LIMITS.maxCacheBytes
  ) {
    const oldestKey = gifCache.keys().next().value

    if (oldestKey === void 0) return

    deleteGIFCacheEntry(oldestKey)
  }
}

const getCachedGIF = (url: string): ArrayBuffer | undefined => {
  const cached = gifCache.get(url)

  if (!cached) return undefined

  gifCache.delete(url)
  gifCache.set(url, cached)

  return cached
}

const readResponseBody = async (
  response: Response,
  signal: AbortSignal,
): Promise<ArrayBuffer> => {
  if (signal.aborted) throw createAbortError(signal.reason)

  const contentLengthValue = response.headers?.get?.('content-length')
  const contentLength = contentLengthValue
    ? Number.parseInt(contentLengthValue, 10)
    : Number.NaN

  if (Number.isFinite(contentLength)) {
    try {
      assertGIFBufferSize(contentLength)
    } catch (error) {
      await response.body?.cancel?.()
      throw error
    }
  }

  const reader = response.body?.getReader()

  if (!reader) {
    const buffer = await response.arrayBuffer()

    if (signal.aborted) throw createAbortError(signal.reason)

    assertGIFBufferSize(buffer.byteLength)
    return buffer
  }

  const chunks: Uint8Array[] = []
  let byteLength = 0

  for (;;) {
    if (signal.aborted) {
      await reader.cancel()
      throw createAbortError(signal.reason)
    }

    const { done, value } = await reader.read()

    if (done) break
    if (!value) continue

    byteLength += value.byteLength

    if (byteLength > GIF_RESOURCE_LIMITS.maxBytes) {
      await reader.cancel()
      assertGIFBufferSize(byteLength)
    }

    chunks.push(value)
  }

  const bytes = new Uint8Array(byteLength)
  let offset = 0

  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  return bytes.buffer
}

const fetchGIFAsArrayBuffer = async (
  url: string,
  signal: AbortSignal,
): Promise<ArrayBuffer> => {
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch(url, { signal })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await readResponseBody(response, signal)
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        throw createAbortError(signal.reason ?? error)
      }

      throw new Error(`Failed to fetch GIF: ${String(error)}`)
    }
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const cleanup = (): void => {
      signal.removeEventListener('abort', handleAbort)
    }
    const fail = (error: Error): void => {
      cleanup()
      reject(error)
    }
    const handleAbort = (): void => {
      xhr.abort()
      fail(createAbortError(signal.reason))
    }

    xhr.responseType = 'arraybuffer'
    xhr.timeout = GIF_RESOURCE_LIMITS.requestTimeoutMs
    xhr.onload = () => {
      if (xhr.status !== 0 && (xhr.status < 200 || xhr.status >= 300)) {
        fail(new Error(`Failed to fetch GIF: HTTP status ${xhr.status}`))
        return
      }

      try {
        const contentLength = Number.parseInt(
          xhr.getResponseHeader('content-length') ?? '',
          10,
        )

        if (Number.isFinite(contentLength)) {
          assertGIFBufferSize(contentLength)
        }

        const buffer = xhr.response as ArrayBuffer

        assertGIFBufferSize(buffer.byteLength)
        cleanup()
        resolve(buffer)
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)))
      }
    }
    xhr.onerror = () => fail(new Error('Failed to fetch GIF: Network error'))
    xhr.ontimeout = () =>
      fail(new Error('Failed to fetch GIF: Request timed out'))
    xhr.onabort = () => {
      if (!signal.aborted) {
        fail(new Error('Failed to fetch GIF: Request aborted'))
      }
    }
    signal.addEventListener('abort', handleAbort, { once: true })
    xhr.open('GET', url)
    xhr.send()
  })
}

const createGIFRequest = (url: string): GIFRequestRecord => {
  const controller = new AbortController()
  const requestVersion = gifCacheVersion
  const record = {
    controller,
    consumers: 0,
    settled: false,
  } as GIFRequestRecord
  const timeout = setTimeout(
    () => controller.abort(),
    GIF_RESOURCE_LIMITS.requestTimeoutMs,
  )

  record.promise = fetchGIFAsArrayBuffer(url, controller.signal)
    .then((buffer) => {
      if (requestVersion === gifCacheVersion) {
        setGIFCache(url, buffer)
      }

      return buffer
    })
    .finally(() => {
      clearTimeout(timeout)
      record.settled = true

      if (gifRequests.get(url) === record) {
        gifRequests.delete(url)
      }
    })

  gifRequests.set(url, record)

  return record
}

const subscribeToGIFRequest = (
  record: GIFRequestRecord,
  signal?: AbortSignal,
): Promise<ArrayBuffer> => {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason))
  }

  record.consumers++

  return new Promise((resolve, reject) => {
    let finished = false

    const finish = (): void => {
      if (finished) return

      finished = true
      record.consumers--
      signal?.removeEventListener('abort', handleAbort)

      if (!record.settled && record.consumers === 0) {
        record.controller.abort()
      }
    }
    const handleAbort = (): void => {
      finish()
      reject(createAbortError(signal?.reason))
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
    record.promise.then(
      (buffer) => {
        if (finished) return

        finish()
        resolve(buffer)
      },
      (error: unknown) => {
        if (finished) return

        finish()
        reject(error)
      },
    )
  })
}

/**
 * Read GIF file as ArrayBuffer from URL with caching.
 * Only works in browser environments.
 */
export const readGIFAsArrayBuffer = async (
  url: string,
  options: ReadGIFOptions = {},
): Promise<ArrayBuffer> => {
  if (!isBrowser()) {
    throw new Error(
      'readGIFAsArrayBuffer is only available in browser environment',
    )
  }

  if (options.signal?.aborted) {
    throw createAbortError(options.signal.reason)
  }

  const cached = getCachedGIF(url)

  if (cached) return cached

  const request = gifRequests.get(url) ?? createGIFRequest(url)

  return subscribeToGIFRequest(request, options.signal)
}

/**
 * Clear GIF cache and abort all in-flight shared requests.
 */
export const clearGIFCache = (): void => {
  gifCacheVersion++
  gifCache.clear()
  gifCacheBytes = 0

  for (const request of gifRequests.values()) {
    request.controller.abort()
  }

  gifRequests.clear()
}

export const clearQRCodeGIFCache = clearGIFCache
