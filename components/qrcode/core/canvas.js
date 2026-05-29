function assertBrowserCanvas() {
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    throw new Error('Canvas rendering is only available in browser environments')
  }
}

function normalizeMime(format = 'png') {
  if (format.startsWith('image/')) return format

  if (format === 'jpg' || format === 'jpeg') return 'image/jpeg'
  if (format === 'webp') return 'image/webp'
  if (format === 'gif') return 'image/gif'

  return 'image/png'
}

function dataURLToUint8Array(dataURL) {
  const [, base64 = ''] = dataURL.split(',')
  if (typeof atob !== 'function') {
    throw new Error('Base64 decoding is not available in this environment')
  }

  const binary = atob(base64)

  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function uint8ArrayToBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

async function blobToDataURL(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())

  return `data:${blob.type};base64,${uint8ArrayToBase64(bytes)}`
}

export class Canvas {
  constructor(width, height) {
    assertBrowserCanvas()

    if (typeof document === 'undefined') {
      const canvas = new OffscreenCanvas(width, height)

      canvas.toDataURL = async (format = 'png') => {
        const blob = await canvas.convertToBlob({
          type: normalizeMime(format),
        })

        return blobToDataURL(blob)
      }
      canvas.toBuffer = async (format = 'png') => {
        const blob = await canvas.convertToBlob({
          type: normalizeMime(format),
        })

        return new Uint8Array(await blob.arrayBuffer())
      }

      return canvas
    }

    const element = document.createElement('canvas')

    element.width = width
    element.height = height
    element.toBuffer = (format = 'png') =>
      dataURLToUint8Array(element.toDataURL(normalizeMime(format)))

    return element
  }
}

export function isCanvasElement(value) {
  return (
    (typeof HTMLCanvasElement !== 'undefined' &&
      value instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== 'undefined' && value instanceof OffscreenCanvas)
  )
}
