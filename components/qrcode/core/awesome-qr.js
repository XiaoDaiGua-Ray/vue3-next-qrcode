import canvas from '../deps/skia-canvas-lib/lib/browser'
const { Canvas } = canvas
import { decompressFrames, parseGIF } from './gifuct-js/index'
import { QRCodeModel, QRErrorCorrectLevel, QRUtil } from './qrcode'
import GIFEncoder from './gif.js/GIFEncoder'

const defaultScale = 0.4
async function loadImage(url) {
  if (!url) return undefined

  return new Promise((resolve, reject) => {
    const img = new Image()

    const cleanup = () => {
      img.onload = null
      img.onerror = null
    }

    img.onload = () => {
      resolve(img)
      cleanup()
    }

    img.onerror = () => {
      reject(new Error('Image load error'))
      cleanup()
    }

    if (url.startsWith('data:')) {
      img.src = url
    } else {
      img.crossOrigin = 'Anonymous'
      img.src = url
    }
  })
}
export class AwesomeQR {
  constructor(options) {
    const _options = Object.assign({}, options)
    Object.keys(AwesomeQR.defaultOptions).forEach((k) => {
      if (!(k in _options)) {
        Object.defineProperty(_options, k, {
          value: AwesomeQR.defaultOptions[k],
          enumerable: true,
          writable: true,
        })
      }
    })
    if (!_options.components) {
      _options.components = AwesomeQR.defaultComponentOptions
    } else if (typeof _options.components === 'object') {
      Object.keys(AwesomeQR.defaultComponentOptions).forEach((k) => {
        if (!(k in _options.components)) {
          Object.defineProperty(_options.components, k, {
            value: AwesomeQR.defaultComponentOptions[k],
            enumerable: true,
            writable: true,
          })
        } else {
          Object.defineProperty(_options.components, k, {
            value: Object.assign(
              Object.assign({}, AwesomeQR.defaultComponentOptions[k]),
              _options.components[k],
            ),
            enumerable: true,
            writable: true,
          })
        }
      })
    }
    if (_options.dotScale !== null && _options.dotScale !== undefined) {
      if (_options.dotScale <= 0 || _options.dotScale > 1) {
        throw new Error('dotScale should be in range (0, 1].')
      }
      _options.components.data.scale = _options.dotScale
      _options.components.timing.scale = _options.dotScale
      _options.components.alignment.scale = _options.dotScale
    }
    this.options = _options
    this.canvas = new Canvas(options.size, options.size)
    this.canvasContext = this.canvas.getContext('2d')
    this.qrCode = new QRCodeModel(-1, this.options.correctLevel)
    if (Number.isInteger(this.options.maskPattern)) {
      this.qrCode.maskPattern = this.options.maskPattern
    }
    if (Number.isInteger(this.options.version)) {
      this.qrCode.typeNumber = this.options.version
    }
    this.qrCode.addData(this.options.text)
    this.qrCode.make()

    // 添加缓存
    this._cache = new Map()
  }
  draw() {
    return new Promise((resolve) => this._draw().then(resolve))
  }
  _clear() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  static _prepareRoundedCornerClip(canvasContext, x, y, w, h, r) {
    canvasContext.beginPath()
    canvasContext.moveTo(x, y)
    canvasContext.arcTo(x + w, y, x + w, y + h, r)
    canvasContext.arcTo(x + w, y + h, x, y + h, r)
    canvasContext.arcTo(x, y + h, x, y, r)
    canvasContext.arcTo(x, y, x + w, y, r)
    canvasContext.closePath()
  }
  static _getAverageRGB(image) {
    const blockSize = 5
    const defaultRGB = { r: 0, g: 0, b: 0 }

    const { width, height } = image
    const canvas = new Canvas(width, height)
    const context = canvas.getContext('2d')

    if (!context) return defaultRGB

    context.drawImage(image, 0, 0)

    let data
    try {
      data = context.getImageData(0, 0, width, height).data
    } catch (e) {
      return defaultRGB
    }

    let rgb = { r: 0, g: 0, b: 0 }
    let count = 0

    // 使用 for...of 优化遍历
    for (let i = 0; i < data.length; i += blockSize * 4) {
      const [r, g, b] = data.slice(i, i + 3)
      if (r > 200 || g > 200 || b > 200) continue

      count++
      rgb.r += r
      rgb.g += g
      rgb.b += b
    }

    return {
      r: ~~(rgb.r / count),
      g: ~~(rgb.g / count),
      b: ~~(rgb.b / count),
    }
  }
  static _drawDot(
    canvasContext,
    centerX,
    centerY,
    nSize,
    xyOffset = 0,
    dotScale = 1,
  ) {
    canvasContext.fillRect(
      (centerX + xyOffset) * nSize,
      (centerY + xyOffset) * nSize,
      dotScale * nSize,
      dotScale * nSize,
    )
  }
  static _drawAlignProtector(canvasContext, centerX, centerY, nSize) {
    canvasContext.clearRect(
      (centerX - 2) * nSize,
      (centerY - 2) * nSize,
      5 * nSize,
      5 * nSize,
    )
    canvasContext.fillRect(
      (centerX - 2) * nSize,
      (centerY - 2) * nSize,
      5 * nSize,
      5 * nSize,
    )
  }
  static _drawAlign(
    canvasContext,
    centerX,
    centerY,
    nSize,
    xyOffset = 0,
    dotScale = 1,
    colorDark,
    hasProtector,
  ) {
    const oldFillStyle = canvasContext.fillStyle
    canvasContext.fillStyle = colorDark

    // 使用更简洁的方式绘制点
    const drawDots = (positions) => {
      positions.forEach(([x, y]) => {
        this._drawDot(
          canvasContext,
          centerX + x,
          centerY + y,
          nSize,
          xyOffset,
          dotScale,
        )
      })
    }

    // 外围点位置
    const outerDots = [
      [-2, -2],
      [-1, -2],
      [0, -2],
      [1, -2],
      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [-1, 2],
      [-2, 2],
      [-2, 1],
      [-2, 0],
      [-2, -1],
    ]

    drawDots(outerDots)

    // 中心点
    this._drawDot(canvasContext, centerX, centerY, nSize, xyOffset, dotScale)

    if (!hasProtector) {
      canvasContext.fillStyle = 'rgba(255, 255, 255, 0.6)'
      // 内部点位置
      const innerDots = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ]
      drawDots(innerDots)
    }

    canvasContext.fillStyle = oldFillStyle
  }
  async _draw() {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u
    const nCount = this.qrCode?.moduleCount
    const rawSize = this.options.size
    let rawMargin = this.options.margin
    if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
      rawMargin = 0
    }
    const margin = Math.ceil(rawMargin)
    const rawViewportSize = rawSize - 2 * rawMargin
    const whiteMargin = this.options.whiteMargin
    const backgroundDimming = this.options.backgroundDimming
    const nSize = Math.ceil(rawViewportSize / nCount)
    const viewportSize = nSize * nCount
    const size = viewportSize + 2 * margin
    const mainCanvas = new Canvas(size, size)
    const mainCanvasContext = mainCanvas.getContext('2d')
    this._clear()
    // Translate to make the top and left margins off the viewport
    mainCanvasContext.save()
    mainCanvasContext.translate(margin, margin)
    const backgroundCanvas = new Canvas(size, size)
    const backgroundCanvasContext = backgroundCanvas.getContext('2d')
    let parsedGIFBackground = null
    let gifFrames = []
    if (!!this.options.gifBackground) {
      const gif = parseGIF(this.options.gifBackground)
      parsedGIFBackground = gif
      gifFrames = decompressFrames(gif, true)
      if (this.options.autoColor) {
        let r = 0,
          g = 0,
          b = 0
        let count = 0
        for (let i = 0; i < gifFrames[0].colorTable.length; i++) {
          const c = gifFrames[0].colorTable[i]
          if (c[0] > 200 || c[1] > 200 || c[2] > 200) continue
          if (c[0] === 0 && c[1] === 0 && c[2] === 0) continue
          count++
          r += c[0]
          g += c[1]
          b += c[2]
        }
        r = ~~(r / count)
        g = ~~(g / count)
        b = ~~(b / count)
        this.options.colorDark = `rgb(${r},${g},${b})`
      }
    } else if (!!this.options.backgroundImage) {
      const backgroundImage = await loadImage(this.options.backgroundImage)
      if (this.options.autoColor) {
        const avgRGB = AwesomeQR._getAverageRGB(backgroundImage)
        this.options.colorDark = `rgb(${avgRGB.r},${avgRGB.g},${avgRGB.b})`
      }
      backgroundCanvasContext.drawImage(
        backgroundImage,
        0,
        0,
        backgroundImage.width,
        backgroundImage.height,
        0,
        0,
        size,
        size,
      )
      backgroundCanvasContext.rect(0, 0, size, size)
      backgroundCanvasContext.fillStyle = backgroundDimming
      backgroundCanvasContext.fill()
    } else {
      backgroundCanvasContext.rect(0, 0, size, size)
      backgroundCanvasContext.fillStyle = this.options.colorLight
      backgroundCanvasContext.fill()
    }
    const alignmentPatternCenters = QRUtil.getPatternPosition(
      this.qrCode.typeNumber,
    )
    const dataScale =
      ((_c =
        (_b = this.options.components) === null || _b === void 0
          ? void 0
          : _b.data) === null || _c === void 0
        ? void 0
        : _c.scale) || defaultScale
    const dataXyOffset = (1 - dataScale) * 0.5
    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        const bIsDark = this.qrCode.isDark(row, col)
        const isBlkPosCtr =
          (col < 8 && (row < 8 || row >= nCount - 8)) ||
          (col >= nCount - 8 && row < 8)
        const isTiming =
          (row == 6 && col >= 8 && col <= nCount - 8) ||
          (col == 6 && row >= 8 && row <= nCount - 8)
        let isProtected = isBlkPosCtr || isTiming
        for (let i = 1; i < alignmentPatternCenters.length - 1; i++) {
          isProtected =
            isProtected ||
            (row >= alignmentPatternCenters[i] - 2 &&
              row <= alignmentPatternCenters[i] + 2 &&
              col >= alignmentPatternCenters[i] - 2 &&
              col <= alignmentPatternCenters[i] + 2)
        }
        const nLeft = col * nSize + (isProtected ? 0 : dataXyOffset * nSize)
        const nTop = row * nSize + (isProtected ? 0 : dataXyOffset * nSize)
        mainCanvasContext.strokeStyle = bIsDark
          ? this.options.colorDark
          : this.options.colorLight
        mainCanvasContext.lineWidth = 0.5
        mainCanvasContext.fillStyle = bIsDark
          ? this.options.colorDark
          : this.options.colorLight
        if (alignmentPatternCenters.length === 0) {
          if (!isProtected) {
            mainCanvasContext.fillRect(
              nLeft,
              nTop,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
            )
          }
        } else {
          const inAgnRange =
            col < nCount - 4 &&
            col >= nCount - 4 - 5 &&
            row < nCount - 4 &&
            row >= nCount - 4 - 5
          if (!isProtected && !inAgnRange) {
            // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
            mainCanvasContext.fillRect(
              nLeft,
              nTop,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
            )
          }
        }
      }
    }
    const cornerAlignmentCenter =
      alignmentPatternCenters[alignmentPatternCenters.length - 1]
    // - PROTECTORS
    const protectorStyle = this.options.colorLight
    // - FINDER PROTECTORS
    mainCanvasContext.fillStyle = protectorStyle
    mainCanvasContext.fillRect(0, 0, 8 * nSize, 8 * nSize)
    mainCanvasContext.fillRect(0, (nCount - 8) * nSize, 8 * nSize, 8 * nSize)
    mainCanvasContext.fillRect((nCount - 8) * nSize, 0, 8 * nSize, 8 * nSize)
    // - TIMING PROTECTORS
    if (
      (_e =
        (_d = this.options.components) === null || _d === void 0
          ? void 0
          : _d.timing) === null || _e === void 0
        ? void 0
        : _e.protectors
    ) {
      mainCanvasContext.fillRect(
        8 * nSize,
        6 * nSize,
        (nCount - 8 - 8) * nSize,
        nSize,
      )
      mainCanvasContext.fillRect(
        6 * nSize,
        8 * nSize,
        nSize,
        (nCount - 8 - 8) * nSize,
      )
    }
    // - CORNER ALIGNMENT PROTECTORS
    if (
      (_g =
        (_f = this.options.components) === null || _f === void 0
          ? void 0
          : _f.cornerAlignment) === null || _g === void 0
        ? void 0
        : _g.protectors
    ) {
      AwesomeQR._drawAlignProtector(
        mainCanvasContext,
        cornerAlignmentCenter,
        cornerAlignmentCenter,
        nSize,
      )
    }
    // - ALIGNMENT PROTECTORS
    if (
      (_j =
        (_h = this.options.components) === null || _h === void 0
          ? void 0
          : _h.alignment) === null || _j === void 0
        ? void 0
        : _j.protectors
    ) {
      for (let i = 0; i < alignmentPatternCenters.length; i++) {
        for (let j = 0; j < alignmentPatternCenters.length; j++) {
          const agnX = alignmentPatternCenters[j]
          const agnY = alignmentPatternCenters[i]
          if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
            continue
          } else if (
            agnY === 6 &&
            (agnX === 6 || agnX === cornerAlignmentCenter)
          ) {
            continue
          } else if (
            agnX === cornerAlignmentCenter &&
            agnY === cornerAlignmentCenter
          ) {
            continue
          } else {
            AwesomeQR._drawAlignProtector(mainCanvasContext, agnX, agnY, nSize)
          }
        }
      }
    }
    // - FINDER
    mainCanvasContext.fillStyle = this.options.colorDark
    mainCanvasContext.fillRect(0, 0, 7 * nSize, nSize)
    mainCanvasContext.fillRect((nCount - 7) * nSize, 0, 7 * nSize, nSize)
    mainCanvasContext.fillRect(0, 6 * nSize, 7 * nSize, nSize)
    mainCanvasContext.fillRect(
      (nCount - 7) * nSize,
      6 * nSize,
      7 * nSize,
      nSize,
    )
    mainCanvasContext.fillRect(0, (nCount - 7) * nSize, 7 * nSize, nSize)
    mainCanvasContext.fillRect(0, (nCount - 7 + 6) * nSize, 7 * nSize, nSize)
    mainCanvasContext.fillRect(0, 0, nSize, 7 * nSize)
    mainCanvasContext.fillRect(6 * nSize, 0, nSize, 7 * nSize)
    mainCanvasContext.fillRect((nCount - 7) * nSize, 0, nSize, 7 * nSize)
    mainCanvasContext.fillRect((nCount - 7 + 6) * nSize, 0, nSize, 7 * nSize)
    mainCanvasContext.fillRect(0, (nCount - 7) * nSize, nSize, 7 * nSize)
    mainCanvasContext.fillRect(
      6 * nSize,
      (nCount - 7) * nSize,
      nSize,
      7 * nSize,
    )
    mainCanvasContext.fillRect(2 * nSize, 2 * nSize, 3 * nSize, 3 * nSize)
    mainCanvasContext.fillRect(
      (nCount - 7 + 2) * nSize,
      2 * nSize,
      3 * nSize,
      3 * nSize,
    )
    mainCanvasContext.fillRect(
      2 * nSize,
      (nCount - 7 + 2) * nSize,
      3 * nSize,
      3 * nSize,
    )
    // - TIMING
    const timingScale =
      ((_l =
        (_k = this.options.components) === null || _k === void 0
          ? void 0
          : _k.timing) === null || _l === void 0
        ? void 0
        : _l.scale) || defaultScale
    const timingXyOffset = (1 - timingScale) * 0.5
    for (let i = 0; i < nCount - 8; i += 2) {
      AwesomeQR._drawDot(
        mainCanvasContext,
        8 + i,
        6,
        nSize,
        timingXyOffset,
        timingScale,
      )
      AwesomeQR._drawDot(
        mainCanvasContext,
        6,
        8 + i,
        nSize,
        timingXyOffset,
        timingScale,
      )
    }
    // - CORNER ALIGNMENT PROTECTORS
    const cornerAlignmentScale =
      ((_o =
        (_m = this.options.components) === null || _m === void 0
          ? void 0
          : _m.cornerAlignment) === null || _o === void 0
        ? void 0
        : _o.scale) || defaultScale
    const cornerAlignmentXyOffset = (1 - cornerAlignmentScale) * 0.5
    AwesomeQR._drawAlign(
      mainCanvasContext,
      cornerAlignmentCenter,
      cornerAlignmentCenter,
      nSize,
      cornerAlignmentXyOffset,
      cornerAlignmentScale,
      this.options.colorDark,
      ((_q =
        (_p = this.options.components) === null || _p === void 0
          ? void 0
          : _p.cornerAlignment) === null || _q === void 0
        ? void 0
        : _q.protectors) || false,
    )
    // - ALIGNEMNT
    const alignmentScale =
      ((_s =
        (_r = this.options.components) === null || _r === void 0
          ? void 0
          : _r.alignment) === null || _s === void 0
        ? void 0
        : _s.scale) || defaultScale
    const alignmentXyOffset = (1 - alignmentScale) * 0.5
    for (let i = 0; i < alignmentPatternCenters.length; i++) {
      for (let j = 0; j < alignmentPatternCenters.length; j++) {
        const agnX = alignmentPatternCenters[j]
        const agnY = alignmentPatternCenters[i]
        if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
          continue
        } else if (
          agnY === 6 &&
          (agnX === 6 || agnX === cornerAlignmentCenter)
        ) {
          continue
        } else if (
          agnX === cornerAlignmentCenter &&
          agnY === cornerAlignmentCenter
        ) {
          continue
        } else {
          AwesomeQR._drawAlign(
            mainCanvasContext,
            agnX,
            agnY,
            nSize,
            alignmentXyOffset,
            alignmentScale,
            this.options.colorDark,
            ((_u =
              (_t = this.options.components) === null || _t === void 0
                ? void 0
                : _t.alignment) === null || _u === void 0
              ? void 0
              : _u.protectors) || false,
          )
        }
      }
    }
    // Fill the margin
    if (whiteMargin) {
      mainCanvasContext.fillStyle = this.options.backgroundColor
      mainCanvasContext.fillRect(-margin, -margin, size, margin)
      mainCanvasContext.fillRect(-margin, viewportSize, size, margin)
      mainCanvasContext.fillRect(viewportSize, -margin, margin, size)
      mainCanvasContext.fillRect(-margin, -margin, margin, size)
    }
    if (!!this.options.logoImage) {
      const logoImage = await loadImage(this.options.logoImage)
      let logoScale = this.options.logoScale
      let logoMargin = this.options.logoMargin
      let logoCornerRadius = this.options.logoCornerRadius
      if (logoScale <= 0 || logoScale >= 1.0) {
        logoScale = 0.2
      }
      if (logoMargin < 0) {
        logoMargin = 0
      }
      if (logoCornerRadius < 0) {
        logoCornerRadius = 0
      }
      const logoSize = viewportSize * logoScale
      const x = 0.5 * (size - logoSize)
      const y = x
      // Restore the canvas
      // After restoring, the top and left margins should be taken into account
      mainCanvasContext.restore()
      // Clean the area that the logo covers (including margins)
      mainCanvasContext.fillStyle = this.options.logoBackgroundColor
      mainCanvasContext.save()
      AwesomeQR._prepareRoundedCornerClip(
        mainCanvasContext,
        x - logoMargin,
        y - logoMargin,
        logoSize + 2 * logoMargin,
        logoSize + 2 * logoMargin,
        logoCornerRadius + logoMargin,
      )
      mainCanvasContext.clip()
      const oldGlobalCompositeOperation =
        mainCanvasContext.globalCompositeOperation
      mainCanvasContext.globalCompositeOperation = 'destination-out'
      mainCanvasContext.fill()
      mainCanvasContext.globalCompositeOperation = oldGlobalCompositeOperation
      mainCanvasContext.restore()
      // Draw logo image
      mainCanvasContext.save()
      AwesomeQR._prepareRoundedCornerClip(
        mainCanvasContext,
        x,
        y,
        logoSize,
        logoSize,
        logoCornerRadius,
      )
      mainCanvasContext.clip()
      mainCanvasContext.drawImage(logoImage, x, y, logoSize, logoSize)
      mainCanvasContext.restore()
      // Re-translate the canvas to translate the top and left margins into invisible area
      mainCanvasContext.save()
      mainCanvasContext.translate(margin, margin)
    }
    if (!!parsedGIFBackground) {
      let gifOutput
      // Reuse in order to apply the patch
      let backgroundCanvas
      let backgroundCanvasContext
      let patchCanvas
      let patchCanvasContext
      let patchData
      gifFrames.forEach(async function (frame) {
        if (!gifOutput) {
          gifOutput = new GIFEncoder(rawSize, rawSize)
          gifOutput.setDelay(frame.delay)
          gifOutput.setRepeat(0)
        }
        const { width, height } = frame.dims
        if (!backgroundCanvas) {
          backgroundCanvas = new Canvas(width, height)
          backgroundCanvasContext = backgroundCanvas.getContext('2d')
          backgroundCanvasContext.rect(
            0,
            0,
            backgroundCanvas.width,
            backgroundCanvas.height,
          )
          backgroundCanvasContext.fillStyle = '#ffffff'
          backgroundCanvasContext.fill()
        }
        if (
          !patchCanvas ||
          !patchData ||
          width !== patchCanvas.width ||
          height !== patchCanvas.height
        ) {
          patchCanvas = new Canvas(width, height)
          patchCanvasContext = patchCanvas.getContext('2d')
          patchData = patchCanvasContext.createImageData(width, height)
        }
        patchData.data.set(frame.patch)
        patchCanvasContext.putImageData(patchData, 0, 0)
        backgroundCanvasContext.drawImage(
          patchCanvas.getContext('2d').canvas,
          frame.dims.left,
          frame.dims.top,
        )
        const unscaledCanvas = new Canvas(size, size)
        const unscaledCanvasContext = unscaledCanvas.getContext('2d')
        unscaledCanvasContext.drawImage(
          backgroundCanvas.getContext('2d').canvas,
          0,
          0,
          size,
          size,
        )
        unscaledCanvasContext.rect(0, 0, size, size)
        unscaledCanvasContext.fillStyle = backgroundDimming
        unscaledCanvasContext.fill()
        unscaledCanvasContext.drawImage(
          mainCanvas.getContext('2d').canvas,
          0,
          0,
          size,
          size,
        )
        // Scale the final image
        const outCanvas = new Canvas(rawSize, rawSize)
        const outCanvasContext = outCanvas.getContext('2d')
        outCanvasContext.drawImage(
          unscaledCanvas.getContext('2d').canvas,
          0,
          0,
          rawSize,
          rawSize,
        )
        gifOutput.addFrame(
          outCanvasContext.getImageData(0, 0, outCanvas.width, outCanvas.height)
            .data,
        )
      })
      if (!gifOutput) {
        throw new Error('No frames.')
      }
      gifOutput.finish()
      if (isElement(this.canvas)) {
        const u8array = gifOutput.stream().toFlattenUint8Array()
        const binary = u8array.reduce(
          (bin, u8) => bin + String.fromCharCode(u8),
          '',
        )
        return Promise.resolve(
          `data:image/gif;base64,${globalThis.btoa(binary)}`,
        )
      }
      return Promise.resolve(
        Buffer.from(gifOutput.stream().toFlattenUint8Array()),
      )
    } else {
      // Swap and merge the foreground and the background
      backgroundCanvasContext.drawImage(
        mainCanvas.getContext('2d').canvas,
        0,
        0,
        size,
        size,
      )
      mainCanvasContext.drawImage(
        backgroundCanvas.getContext('2d').canvas,
        -margin,
        -margin,
        size,
        size,
      )
      // Scale the final image
      const outCanvas = new Canvas(rawSize, rawSize) //document.createElement("canvas");
      const outCanvasContext = outCanvas.getContext('2d')
      outCanvasContext.drawImage(
        mainCanvas.getContext('2d').canvas,
        0,
        0,
        rawSize,
        rawSize,
      )
      this.canvas = outCanvas
      const format = this.options.gifBackground ? 'gif' : 'png'
      if (isElement(this.canvas)) {
        return Promise.resolve(this.canvas.toDataURL(format))
      }
      return Promise.resolve(this.canvas.toBuffer(format))
    }
  }
  // 缓存计算结果
  _getCachedResult(key, compute) {
    if (this._cache.has(key)) {
      return this._cache.get(key)
    }
    const result = compute()
    this._cache.set(key, result)
    return result
  }
}
AwesomeQR.CorrectLevel = QRErrorCorrectLevel
AwesomeQR.defaultComponentOptions = {
  data: {
    scale: 0.4,
  },
  timing: {
    scale: 0.5,
    protectors: false,
  },
  alignment: {
    scale: 0.5,
    protectors: false,
  },
  cornerAlignment: {
    scale: 0.5,
    protectors: true,
  },
}
AwesomeQR.defaultOptions = {
  text: '',
  size: 400,
  margin: 20,
  colorDark: '#000000',
  colorLight: 'rgba(255, 255, 255, 0.6)',
  correctLevel: QRErrorCorrectLevel.M,
  backgroundImage: undefined,
  backgroundDimming: 'rgba(0,0,0,0)',
  logoImage: undefined,
  logoScale: 0.2,
  logoMargin: 4,
  logoCornerRadius: 8,
  whiteMargin: true,
  components: AwesomeQR.defaultComponentOptions,
  autoColor: true,
  logoBackgroundColor: '#ffffff',
  backgroundColor: '#ffffff',
}
function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement
  } catch (e) {
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (
      typeof obj === 'object' &&
      obj.nodeType === 1 &&
      typeof obj.style === 'object' &&
      typeof obj.ownerDocument === 'object'
    )
  }
}
