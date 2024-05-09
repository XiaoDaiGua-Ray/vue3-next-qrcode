import QRCode, { props } from './qrcode/index'

import type { App } from 'vue'
import type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeOptions,
} from './qrcode/src/types'

export type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeOptions,
}

export { QRCode as Vue3NextQrcode, props as qrcodeProps }
export default {
  install(app: App) {
    app.component(QRCode.name as string, QRCode)
  },
}
