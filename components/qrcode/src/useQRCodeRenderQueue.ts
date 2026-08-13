import { ref } from 'vue'

type LatestRenderHandlers<T> = {
  onSuccess?: (result: T) => void
  onError?: (error: unknown) => void
}

export function useQRCodeRenderQueue<T>() {
  const isRendering = ref(false)
  const needsRerender = ref(false)
  let requestId = 0
  let disposed = false
  let activeController: AbortController | null = null

  const runLatest = async (
    task: (signal: AbortSignal) => Promise<T>,
    handlers: LatestRenderHandlers<T> = {},
  ): Promise<T | undefined> => {
    const currentRequestId = ++requestId

    if (isRendering.value) {
      needsRerender.value = true
      activeController?.abort()
      return undefined
    }

    const controller = new AbortController()

    activeController = controller
    isRendering.value = true
    needsRerender.value = false

    try {
      const result = await task(controller.signal)

      if (!disposed && currentRequestId === requestId) {
        handlers.onSuccess?.(result)

        return result
      }

      return undefined
    } catch (error) {
      if (!disposed && currentRequestId === requestId) {
        handlers.onError?.(error)
      }

      return undefined
    } finally {
      if (activeController === controller) activeController = null

      isRendering.value = false

      if (!disposed && needsRerender.value) {
        void runLatest(task, handlers)
      }
    }
  }

  const runExclusive = async (
    task: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> => {
    if (isRendering.value) {
      throw new Error('QR code generation is already in progress')
    }

    const currentRequestId = ++requestId
    const controller = new AbortController()

    activeController = controller
    isRendering.value = true
    needsRerender.value = false

    try {
      const result = await task(controller.signal)

      if (disposed || currentRequestId !== requestId) {
        throw new Error('QR code generation was cancelled')
      }

      return result
    } finally {
      if (activeController === controller) activeController = null

      isRendering.value = false
    }
  }

  const dispose = (): void => {
    disposed = true
    requestId++
    activeController?.abort()
    activeController = null
    needsRerender.value = false
    isRendering.value = false
  }

  return {
    isRendering,
    needsRerender,
    runLatest,
    runExclusive,
    dispose,
  } as const
}

export type UseQRCodeRenderQueueReturn<T> = ReturnType<
  typeof useQRCodeRenderQueue<T>
>
