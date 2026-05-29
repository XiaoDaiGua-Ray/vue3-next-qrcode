import { renderQRCodeOnMainThread } from './renderer-main'

import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

type RenderMessage = {
  id: number
  options: QRCodeBaseOptions
}

type RenderResponse =
  | {
      id: number
      result: QRCodeRenderResponse
    }
  | {
      id: number
      error: string
    }

self.onmessage = async (event: MessageEvent<RenderMessage>) => {
  const { id, options } = event.data

  try {
    const result = await renderQRCodeOnMainThread(options)
    const response: RenderResponse = { id, result }

    self.postMessage(response)
  } catch (error) {
    const response: RenderResponse = {
      id,
      error: error instanceof Error ? error.message : String(error),
    }

    self.postMessage(response)
  }
}
