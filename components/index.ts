import QRCode, { props } from './qrcode/index'

import type { App } from 'vue'

export { QRCode as Vue3NextQrcode, props as qrcodeProps }
export default {
  install(app: App) {
    app.component(QRCode.name, QRCode)
  },
}
