import { shallowRef } from 'vue'
import { readGIFAsArrayBuffer } from './utils'

export type GIFBackgroundState = {
  url: string
  buffer: ArrayBuffer
}

export function useGifBackground() {
  const gifBackground = shallowRef<GIFBackgroundState | null>(null)
  let requestId = 0
  let disposed = false
  let activeController: AbortController | null = null

  const load = async (
    url: string,
    signal?: AbortSignal,
  ): Promise<ArrayBuffer> => {
    const currentRequestId = ++requestId
    const controller = new AbortController()
    const abortFromParent = (): void => controller.abort(signal?.reason)

    activeController?.abort()
    activeController = controller

    if (signal?.aborted) {
      abortFromParent()
    } else {
      signal?.addEventListener('abort', abortFromParent, { once: true })
    }

    try {
      const buffer = await readGIFAsArrayBuffer(url, {
        signal: controller.signal,
      })

      if (controller.signal.aborted) {
        throw controller.signal.reason instanceof Error
          ? controller.signal.reason
          : new DOMException('The operation was aborted', 'AbortError')
      }

      if (!disposed && currentRequestId === requestId) {
        gifBackground.value = { url, buffer }
      }

      return buffer
    } finally {
      signal?.removeEventListener('abort', abortFromParent)

      if (activeController === controller) {
        activeController = null
      }
    }
  }

  const getBuffer = (url: string): ArrayBuffer | null => {
    const current = gifBackground.value

    return current?.url === url ? current.buffer : null
  }

  const clear = (): void => {
    requestId++
    activeController?.abort()
    activeController = null
    gifBackground.value = null
  }

  const dispose = (): void => {
    disposed = true
    clear()
  }

  return {
    gifBackground,
    load,
    getBuffer,
    clear,
    dispose,
  } as const
}

export type UseGifBackgroundReturn = ReturnType<typeof useGifBackground>
