import type { ComponentOptions, Options } from '../core/awesome-qr'

export type QRCodeStatus = 'error' | 'success' | 'loading'

export type QRCodeLevel = 0 | 1 | 2 | 3

export type QRCodeRenderResponse = string | ArrayBuffer | Buffer | undefined

export type QRCodeInst = {
  /**
   *
   * @param fileName file name
   *
   * 如果未设置名称，则默认以 时间戳.png 命名
   */
  downloadQRCode: (fileName?: string) => void
}

export type MaybeArray<T> = T | T[]

export type AnyFC = (...args: any[]) => any

export type QRCodeComponentProps = ComponentOptions

// Re-export Options type from awesome-qr
export type QRCodeOptions = Options

// Ensure text is required in the base options
export interface QRCodeBaseOptions {
  text: string
  size?: number
  margin?: number
  correctLevel?: number
  maskPattern?: number
  version?: number
  components?: ComponentOptions
  colorDark?: string
  colorLight?: string
  autoColor?: boolean
  backgroundImage?: string
  backgroundDimming?: string
  gifBackground?: ArrayBuffer
  whiteMargin?: boolean
  logoImage?: string
  logoScale?: number
  logoMargin?: number
  logoCornerRadius?: number
  dotScale?: number
}

export interface DefineProvider {
  '--r-qrcode-primary-color'?: string
  '--r-qrcode-primary-color-2'?: string
  '--r-qrcode-width'?: string
  '--r-qrcode-height'?: string
  '--r-qrcode-border-radius'?: string
  '--r-qrcode-mask-color'?: string
  '--r-qrcode-spin-size'?: string
}
