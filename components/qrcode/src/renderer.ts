import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

declare const __VUE3_NEXT_QRCODE_ENABLE_WORKER__: boolean

export async function renderQRCode(
  options: QRCodeBaseOptions,
): Promise<QRCodeRenderResponse> {
  if (__VUE3_NEXT_QRCODE_ENABLE_WORKER__ && options.gifBackground) {
    try {
      const { renderQRCodeInWorker } = await import('./renderer-worker')

      return await renderQRCodeInWorker(options)
    } catch {
      // Worker support varies across bundlers and browsers. Main-thread
      // rendering is the compatibility fallback.
    }
  }

  const { renderQRCodeOnMainThread } = await import('./renderer-main')

  return renderQRCodeOnMainThread(options)
}
