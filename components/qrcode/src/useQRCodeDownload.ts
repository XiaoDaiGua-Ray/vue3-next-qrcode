import { computed, unref } from 'vue'
import { downloadBase64File } from './utils'

import type { ComputedRef, MaybeRef } from 'vue'
import type { QRCodeRenderResponse } from './types'

export type QRCodeDownloadSource = MaybeRef<QRCodeRenderResponse>

export type UseQRCodeDownloadReturn = {
  canDownload: ComputedRef<boolean>
  download: (
    fileName?: string,
    sourceOverride?: QRCodeRenderResponse,
  ) => Promise<void>
}

const isDownloadableQRCode = (source: QRCodeRenderResponse): source is string =>
  typeof source === 'string' && source.length > 0

export function useQRCodeDownload(
  source?: QRCodeDownloadSource,
): UseQRCodeDownloadReturn {
  const resolveSource = (
    sourceOverride?: QRCodeRenderResponse,
  ): QRCodeRenderResponse =>
    sourceOverride !== void 0 ? sourceOverride : source ? unref(source) : void 0

  const canDownload = computed(() => isDownloadableQRCode(resolveSource()))

  const download = async (
    fileName?: string,
    sourceOverride?: QRCodeRenderResponse,
  ): Promise<void> => {
    const qrcode = resolveSource(sourceOverride)

    if (!isDownloadableQRCode(qrcode)) {
      throw new Error('QR code not available for download')
    }

    downloadBase64File(qrcode, fileName)
  }

  return {
    canDownload,
    download,
  }
}
