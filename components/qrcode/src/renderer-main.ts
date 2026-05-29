import { AwesomeQR } from '../core/awesome-qr'

import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

export async function renderQRCodeOnMainThread(
  options: QRCodeBaseOptions,
): Promise<QRCodeRenderResponse> {
  return new AwesomeQR(options).draw()
}
