import { ref, shallowRef } from 'vue'
import { renderQRCode } from './renderer'
import { readGIFAsArrayBuffer } from './utils'

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
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const gifBuffer = shallowRef<ArrayBuffer | null>(null)

  const loadGIFFromURL = async (url: string): Promise<ArrayBuffer> => {
    try {
      const buffer = await readGIFAsArrayBuffer(url)
      gifBuffer.value = buffer
      return buffer
    } catch (err) {
      const errorMsg = err instanceof Error ? err : new Error(String(err))
      throw new Error(`Failed to load GIF from URL: ${errorMsg.message}`)
    }
  }

  const generate = async (
    options: UseQRCodeOptions,
  ): Promise<QRCodeRenderResponse> => {
    if (isLoading.value) {
      throw new Error('QR code generation is already in progress')
    }

    if (!options.text) {
      throw new Error('Text is required for QR code generation')
    }

    isLoading.value = true
    error.value = null

    try {
      const { gifBackgroundURL, ...qrOptions } = options

      // Load GIF if URL is provided
      let gifBackground: ArrayBuffer | undefined

      if (gifBackgroundURL) {
        gifBackground = await loadGIFFromURL(gifBackgroundURL)
      }

      // Clean options: remove undefined values
      const cleanOptions: Record<string, any> = {}

      Object.keys(qrOptions).forEach((key) => {
        const value = (qrOptions as UseQRCodeOptions)[
          key as keyof UseQRCodeOptions
        ]

        if (value !== void 0) {
          cleanOptions[key] = value
        }
      })

      // Add gifBackground if available
      if (gifBackground) {
        cleanOptions.gifBackground = gifBackground
      }

      // Generate QR code
      const result = await renderQRCode(cleanOptions as QRCodeBaseOptions)

      qrcodeURL.value = result
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      throw errorObj
    } finally {
      isLoading.value = false
    }
  }

  const clear = (): void => {
    qrcodeURL.value = void 0
    error.value = null
    gifBuffer.value = null
  }

  return {
    qrcodeURL,
    isLoading,
    error,
    generate,
    clear,
  } as const
}

export type UseQRCodeReturnType = ReturnType<typeof useQRCode>
