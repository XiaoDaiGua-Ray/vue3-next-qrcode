import QRCode from './src/QRCode'
import props from './src/props'

import type { App } from 'vue'

QRCode.install = function (app: App) {
  app.component(QRCode.name!, QRCode)
}

export { props }
export default QRCode
