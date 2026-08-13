import type { QRCodeBaseOptions } from './types'

export const isQRCodeCorrectLevel = (value: unknown): boolean =>
  [0, 1, 2, 3].includes(value as number)

export const isQRCodeMaskPattern = (value: unknown): boolean =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 7

export const isQRCodeVersion = (value: unknown): boolean =>
  Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 40

export const isQRCodeDotScale = (value: unknown): boolean =>
  typeof value === 'number' && value > 0 && value <= 1

export const assertQRCodeOptions = (
  options: Partial<QRCodeBaseOptions>,
): void => {
  if (
    options.correctLevel !== undefined &&
    !isQRCodeCorrectLevel(options.correctLevel)
  ) {
    throw new Error('correctLevel should be one of 0, 1, 2, or 3.')
  }

  if (
    options.maskPattern !== undefined &&
    !isQRCodeMaskPattern(options.maskPattern)
  ) {
    throw new Error('maskPattern should be an integer in range [0, 7].')
  }

  if (options.version !== undefined && !isQRCodeVersion(options.version)) {
    throw new Error('version should be an integer in range [1, 40].')
  }

  if (options.dotScale !== undefined && !isQRCodeDotScale(options.dotScale)) {
    throw new Error('dotScale should be in range (0, 1].')
  }
}
