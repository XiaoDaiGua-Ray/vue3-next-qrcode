import QRCode, { props } from './qrcode/index'

import type { App, ExtractPublicPropTypes } from 'vue'
import type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeOptions,
} from './qrcode/src/types'

type QRCodeProps = ExtractPublicPropTypes<typeof props>

export type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeOptions,
  QRCodeProps,
}

export { QRCode as Vue3NextQrcode, props as qrcodeProps }
export default {
  install(app: App) {
    app.component(QRCode.name as string, QRCode)
  },
}
