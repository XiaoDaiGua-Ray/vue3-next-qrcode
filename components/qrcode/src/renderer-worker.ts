import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

type WorkerResponse =
  | {
      id: number
      result: QRCodeRenderResponse
    }
  | {
      id: number
      error: string
    }

let workerId = 0

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined'

export async function renderQRCodeInWorker(
  options: QRCodeBaseOptions,
): Promise<QRCodeRenderResponse> {
  if (!isBrowser() || !options.gifBackground || typeof Worker === 'undefined') {
    throw new Error('Worker rendering is not available')
  }

  const worker = new Worker(new URL('./qrcode.worker.ts', import.meta.url), {
    type: 'module',
  })
  const id = ++workerId

  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return

      worker.terminate()

      if ('error' in event.data) {
        reject(new Error(event.data.error))
      } else {
        resolve(event.data.result)
      }
    }

    worker.onerror = (event) => {
      worker.terminate()
      reject(event.error || new Error(event.message))
    }

    worker.postMessage({ id, options })
  })
}
