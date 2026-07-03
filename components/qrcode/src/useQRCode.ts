import { ref } from 'vue'
import { renderQRCode } from './renderer'
import { useGifBackground } from './useGifBackground'
import { useQRCodeDownload } from './useQRCodeDownload'
import { useQRCodeRenderQueue } from './useQRCodeRenderQueue'

import type { QRCodeRenderResponse, QRCodeBaseOptions } from './types'

export interface UseQRCodeOptions extends Partial<QRCodeBaseOptions> {
  /**
   * Text to be encoded in the QR code (required)
   */
  text: string
  /**
   * GIF background URL to be loaded and used
   */
  gifBackgroundURL?: string
}

/**
 * Composable for generating QR codes
 *
 * @example
 * ```ts
 * const { qrcodeURL, isLoading, error, generate } = useQRCode()
 *
 * // Generate a simple QR code
 * await generate({ text: 'Hello World' })
 *
 * // Generate with GIF background
 * await generate({
 *   text: 'Hello World',
 *   gifBackgroundURL: 'https://example.com/bg.gif',
 *   colorDark: '#000000'
 * })
 * ```
 */
export function useQRCode() {
  const qrcodeURL = ref<QRCodeRenderResponse>()
  const error = ref<Error | null>(null)
  const gifBackground = useGifBackground()
  const renderQueue = useQRCodeRenderQueue<QRCodeRenderResponse>()
  const { canDownload, download } = useQRCodeDownload(qrcodeURL)
  const isLoading = renderQueue.isRendering

  const generate = async (
    options: UseQRCodeOptions,
  ): Promise<QRCodeRenderResponse> => {
    if (isLoading.value) {
      throw new Error('QR code generation is already in progress')
    }

    if (!options.text) {
      throw new Error('Text is required for QR code generation')
    }

    error.value = null

    try {
      const result = await renderQueue.runExclusive(async () => {
        const {
          gifBackgroundURL,
          gifBackground: gifBackgroundOption,
          ...qrOptions
        } = options

        let gifBackgroundBuffer = gifBackgroundOption

        if (gifBackgroundURL) {
          gifBackgroundBuffer =
            gifBackground.getBuffer(gifBackgroundURL) ??
            (await gifBackground.load(gifBackgroundURL))
        }

        const cleanOptions: Partial<QRCodeBaseOptions> = Object.fromEntries(
          Object.entries(qrOptions).filter(([, value]) => value !== void 0),
        )

        if (gifBackgroundBuffer) {
          cleanOptions.gifBackground = gifBackgroundBuffer
        }

        return renderQRCode(cleanOptions as QRCodeBaseOptions)
      })

      qrcodeURL.value = result
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      throw errorObj
    }
  }

  const clear = (): void => {
    qrcodeURL.value = void 0
    error.value = null
    gifBackground.clear()
  }

  return {
    qrcodeURL,
    isLoading,
    error,
    generate,
    canDownload,
    download,
    clear,
  } as const
}

export type UseQRCodeReturnType = ReturnType<typeof useQRCode>
