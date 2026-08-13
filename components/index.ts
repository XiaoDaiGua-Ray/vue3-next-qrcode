import QRCode, { props } from './qrcode/index'

import type { App, DefineComponent } from 'vue'
import type { QRCodeProps } from './qrcode/src/QRCode'
import type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeBaseOptions,
  QRCodeOptions,
  ComponentOptions,
  DefineProvider,
  QRCodeRenderResponse,
} from './qrcode/src/types'

export type {
  QRCodeInst,
  QRCodeLevel,
  QRCodeStatus,
  QRCodeComponentProps,
  QRCodeBaseOptions,
  QRCodeOptions,
  ComponentOptions,
  DefineProvider,
  QRCodeRenderResponse,
  QRCodeProps,
}

export { QRCode as Vue3NextQrcode, props as qrcodeProps }
export { QRErrorCorrectLevel } from './qrcode/src/errorCorrection'
export { useQRCode } from './qrcode/src/useQRCode'
export { QRCodeGenerationCancelledError } from './qrcode/src/useQRCode'
export type {
  QRCodeGenerationConcurrency,
  QRCodeGenerationStatus,
  UseQRCodeConfig,
  UseQRCodeConfigWithDefaults,
  UseQRCodeOptions,
  UseQRCodeReturn,
  UseQRCodeReturnWithDefaults,
  UseQRCodeReturnType,
} from './qrcode/src/useQRCode'
export { useQRCodeDownload } from './qrcode/src/useQRCodeDownload'
export type {
  QRCodeDownloadSource,
  CompatibleMaybeRef,
  UseQRCodeDownloadReturn,
} from './qrcode/src/useQRCodeDownload'
export { clearQRCodeGIFCache } from './qrcode/src/utils'
export { QRCodeClient } from './qrcode/src/QRCodeClient'

const install = (app: App): void => {
  app.component(QRCode.name as string, QRCode)
}

export interface Vue3NextQrcodePlugin {
  install: (app: App) => void
  Vue3NextQrcode: DefineComponent<QRCodeProps>
}

const plugin: Vue3NextQrcodePlugin = {
  install,
  Vue3NextQrcode: QRCode,
}

export default plugin
