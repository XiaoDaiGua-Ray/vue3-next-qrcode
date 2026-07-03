export type QRCodeStatus = 'error' | 'success' | 'loading'

export type QRCodeLevel = 0 | 1 | 2 | 3

export type QRCodeRenderResponse = string | ArrayBuffer | Uint8Array | undefined

export type QRCodeInst = {
  /**
   *
   * @param fileName file name
   *
   * 如果未设置名称，则默认以 时间戳.png 命名
   */
  downloadQRCode: (fileName?: string) => Promise<void>
}

export type MaybeArray<T> = T | T[]

export type AnyFC = (...args: unknown[]) => unknown

export type QRCodePartOptions = {
  /**
   * Scale factor for the QR code part.
   */
  scale?: number
  /**
   * Draw a protective background around the QR code part.
   */
  protectors?: boolean
}

export type QRCodeComponentProps = {
  /**
   * Component options for data/ECC dots.
   */
  data?: Pick<QRCodePartOptions, 'scale'>
  /**
   * Component options for timing patterns.
   */
  timing?: QRCodePartOptions
  /**
   * Component options for alignment patterns.
   */
  alignment?: QRCodePartOptions
  /**
   * Component options for alignment pattern on the bottom-right corner.
   */
  cornerAlignment?: QRCodePartOptions
}

export type ComponentOptions = QRCodeComponentProps

// Ensure text is required in the base options
export interface QRCodeBaseOptions {
  text: string
  size?: number
  margin?: number
  correctLevel?: number
  maskPattern?: number
  version?: number
  components?: QRCodeComponentProps
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

export interface QRCodeOptions extends QRCodeBaseOptions {
  logoBackgroundColor?: string
  backgroundColor?: string
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
