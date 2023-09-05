<p align="center">
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode">
    <img width="216" src="https://usc1.contabostorage.com/c2e495d7890844d392e8ec0c6e5d77eb:alist/ray/ray.svg?sign=ZklU9Bh5b6oKp1X0LOhGwkx4g5mW4wk_w9Jt5zlZ5EQ=:0">
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vue3-next-qrcode?activeTab=readme"><img src="https://img.shields.io/npm/v/vue3-next-qrcode.svg" alt="npm package"></a>
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XiaoDaiGua-Ray/vue3-next-qrcode" alt="LICENSE"></a>
</p>

<div align="center">

# vue3-next-qrcode

[English](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/README.md) | 简体中文

A QR Code component about vue3 that supports rich attributes such as LOGO GIF

</div>

## ✨ Features

- 🏄🏼‍♂️ easy to use
- 🛸 Rich configuration properties
- 🏟️ Cover most business scenarios
- 🎯 Built with TypeScript, providing full type definition files

## 📦 Install

```bash
npm i vue3-next-qrcode
```

## 🤹‍♀️ Usage

```vue
<script lang="ts" setup>
import { Vue3NextQrcode } from 'vue3-next-qrcode'
</script>

<template>
  <Vue3NextQrcode text="hello vue3 next qrcode" />
</template>
```

## 🤺 Props Options

```ts
{
  watchText: {
    /**
     *
     * Atuo watch QR code text
     * If update text, then re-render QR code
     *
     * @default true
     */
    type: Boolean,
    default: true,
  },
  status: {
    /**
     *
     * QR code status
     *
     * @default undefined
     */
    type: String as PropType<QRCodeStatus>,
  },
  errorDescription: {
    /**
     *
     * QR code error description label
     *
     * @default 二维码已过期
     */
    type: [String, Object] as PropType<string | VNode>,
    default: '二维码已过期',
  },
  errorActionDescription: {
    /**
     *
     * QR code error action description label
     *
     * @default 重新加载
     */
    type: String,
    default: '重新加载',
  },
  text: {
    /**
     *
     * Text to be encoded in the QR code
     */
    type: String,
    required: true,
  },
  size: {
    /**
     *
     * Size of the QR code in pixel.
     *
     * @default 160
     */
    type: Number,
    default: 160,
  },
  margin: {
    /**
     *
     * Size of margins around the QR code body in pixel.
     *
     * @default 12
     */
    type: Number,
    default: 12,
  },
  correctLevel: {
    /**
     *
     * Error correction level of the QR code
     * Accepts a value provided by _QRErrorCorrectLevel_
     *
     * @default 1
     */
    type: Number as PropType<QRCodeLevel>,
    default: 1,
    validator: (value: unknown) => [0, 1, 2, 3].includes(value as number),
  },
  maskPattern: {
    /**
     *
     * Specify the mask pattern to be used in QR code encoding
     * Accepts a value provided by _QRMaskPattern_
     */
    type: Number,
  },
  version: {
    /**
     *
     * Specify the version to be used in QR code encoding
     * Accepts an integer in range [1, 40]
     */
    type: Number,
  },
  components: {
    /**
     *
     * Options to control components in the QR code.
     *
     * @default {data:{scale...},...}
     */
    type: Object as PropType<ComponentOptions>,
    default: () => ({
      data: {
        scale: 1,
      },
      timing: {
        scale: 1,
        protectors: false,
      },
      alignment: {
        scale: 1,
        protectors: false,
      },
      cornerAlignment: {
        scale: 1,
        protectors: true,
      },
    }),
  },
  colorDark: {
    /**
     *
     * Color of the blocks on the QR code
     * Accepts a CSS &lt;color&gt;
     *
     * @default #000000
     */
    type: String,
    default: '#000000',
  },
  colorLight: {
    /**
     *
     * Color of the blocks on the QR code
     * Accepts a CSS &lt;color&gt;
     *
     * @default #ffffff
     */
    type: String,
    default: '#ffffff',
  },
  autoColor: {
    /**
     *
     * Automatically calculate the _colorLight_ value from the QR code's background
     *
     * @default true
     */
    type: Boolean,
    default: true,
  },
  backgroundImage: {
    /**
     *
     * Background image to be used in the QR code
     * Accepts a `data:` string in web browsers or a Buffer in Node.js
     *
     * @default undefined
     */
    type: String,
  },
  backgroundDimming: {
    /**
     *
     * Color of the dimming mask above the background image
     * Accepts a CSS &lt;color&gt;
     *
     * @default rgba(0, 0, 0, 0)
     */
    type: String,
    default: 'rgba(0, 0, 0, 0)',
  },
  gifBackgroundURL: {
    /**
     *
     * GIF background image to be used in the QR code
     *
     * @default undefined
     */
    type: String,
  },
  gifBackground: {
    /**
     *
     * GIF background image to be used in the QR code
     *
     * @default undefined
     */
    type: ArrayBuffer,
  },
  whiteMargin: {
    /**
     *
     * Use a white margin instead of a transparent one which reveals the background of the QR code on margins
     *
     * @default true
     */
    type: Boolean,
    default: true,
  },
  logoImage: {
    /**
     *
     * Logo image to be displayed at the center of the QR code
     * Accepts a `data:` string in web browsers or a Buffer in Node.js
     * When set to `undefined` or `null`, the logo is disabled
     *
     * @default undefined
     */
    type: String,
  },
  logoScale: {
    /**
     *
     * Ratio of the logo size to the QR code size
     *
     * @default 0.4
     */
    type: Number,
    default: 0.4,
  },
  logoMargin: {
    /**
     *
     * Size of margins around the logo image in pixels
     *
     * @default 6
     */
    type: Number,
    default: 6,
  },
  logoCornerRadius: {
    /**
     * Corner radius of the logo image in pixels.
     *
     * @default 8
     */
    type: Number,
    default: 8,
  },
  dotScale: {
    /**
     *
     * Ratio of the real size to the full size of the blocks.
     * This can be helpful when you want to make more parts of the background visible.
     *
     * @default 1
     */
    type: Number,
    default: 1,
  },
  onSuccess: {
    /**
     *
     * When the QR code is successfully generated, this callback is called
     */
    type: [Function, Array] as PropType<
      MaybeArray<(dataURL: ArrayBuffer | string | undefined) => void>
    >,
    default: null,
  },
  onError: {
    /**
     *
     * When the QR code generation fails, this callback is called
     */
    type: [Function, Array] as PropType<MaybeArray<(e: unknown) => void>>,
    default: null,
  },
  onReload: {
    /**
     *
     * When reload button is clicked, this callback is called
     * This method will not execute if the errorAction slot is used
     */
    type: [Function, Array] as PropType<MaybeArray<() => void>>,
    default: null,
  },
}
```

## 🪴 Project Activity

![Alt](https://repobeats.axiom.co/api/embed/7802e3c093747ad0cf1dbda3937e7a34500428ad.svg 'Repobeats analytics image')

### Contributing

Thanks for all their contributions 🐝 !

<a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XiaoDaiGua-Ray/vue3-next-qrcode" />
</a>

## 🌸 Thanks

This project is developed based on [awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md)

## 📄 License

[MIT License](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE) © 2023-PRESENT [Ray](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode)
