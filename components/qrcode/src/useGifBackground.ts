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

  const load = async (url: string): Promise<ArrayBuffer> => {
    const currentRequestId = ++requestId
    const buffer = await readGIFAsArrayBuffer(url)

    if (!disposed && currentRequestId === requestId) {
      gifBackground.value = { url, buffer }
    }

    return buffer
  }

  const getBuffer = (url: string): ArrayBuffer | null => {
    const current = gifBackground.value

    return current?.url === url ? current.buffer : null
  }

  const clear = (): void => {
    requestId++
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
