/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
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
  link.download = fileName || `qrcode-${Date.now()}.png`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// GIF cache to avoid re-fetching the same GIF
const MAX_GIF_CACHE_ENTRIES = 20
const gifCache = new Map<string, ArrayBuffer>()
const gifRequests = new Map<string, Promise<ArrayBuffer>>()
let gifCacheVersion = 0

const setGIFCache = (url: string, buffer: ArrayBuffer): void => {
  if (gifCache.has(url)) {
    gifCache.delete(url)
  }

  gifCache.set(url, buffer)

  while (gifCache.size > MAX_GIF_CACHE_ENTRIES) {
    const oldestKey = gifCache.keys().next().value

    if (oldestKey === void 0) return

    gifCache.delete(oldestKey)
  }
}

const fetchGIFAsArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
  // Use fetch API if available (more modern and SSR-friendly)
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      throw new Error(`Failed to fetch GIF: ${error}`)
    }
  }

  // Fallback to XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.responseType = 'blob'

    xhr.onload = () => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read GIF as ArrayBuffer'))
        }
      }
      reader.onerror = () => reject(new Error('FileReader error'))
      reader.onabort = () => reject(new Error('FileReader aborted'))

      reader.readAsArrayBuffer(xhr.response)
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.open('GET', url)
    xhr.send()
  })
}

/**
 * Read GIF file as ArrayBuffer from URL with caching
 * Only works in browser environment
 */
export const readGIFAsArrayBuffer = async (
  url: string,
): Promise<ArrayBuffer> => {
  if (!isBrowser()) {
    throw new Error(
      'readGIFAsArrayBuffer is only available in browser environment',
    )
  }

  // Check cache first
  const cached = gifCache.get(url)
  if (cached) {
    return cached
  }

  const pending = gifRequests.get(url)
  if (pending) return pending

  const requestVersion = gifCacheVersion
  const request = fetchGIFAsArrayBuffer(url)
    .then((buffer) => {
      if (requestVersion === gifCacheVersion) {
        setGIFCache(url, buffer)
      }

      return buffer
    })
    .finally(() => {
      gifRequests.delete(url)
    })

  gifRequests.set(url, request)

  return request
}

/**
 * Clear GIF cache
 */
export const clearGIFCache = (): void => {
  gifCacheVersion++
  gifCache.clear()
  gifRequests.clear()
}

export const clearQRCodeGIFCache = clearGIFCache
