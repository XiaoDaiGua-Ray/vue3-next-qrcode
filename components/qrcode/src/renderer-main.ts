import { AwesomeQR } from '../core/awesome-qr'

import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

export async function renderQRCodeOnMainThread(
  options: QRCodeBaseOptions,
  signal?: AbortSignal,
): Promise<QRCodeRenderResponse> {
  return new AwesomeQR(options, signal).draw()
}
