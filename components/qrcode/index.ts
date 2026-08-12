import QRCode from './src/QRCode'
import props from './src/props'

import type { App, DefineComponent } from 'vue'
import type { QRCodeProps } from './src/QRCode'

const installableQRCode = QRCode as DefineComponent<QRCodeProps> & {
  install?: (app: App) => void
}

installableQRCode.install = function (app: App) {
  app.component(QRCode.name!, QRCode)
}

export { props }
export default installableQRCode
