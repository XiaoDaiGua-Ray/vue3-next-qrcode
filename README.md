<p align="center">
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode">
    <img width="216" src="https://avatars.githubusercontent.com/u/51957438?v=4">
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vue3-next-qrcode?activeTab=readme"><img src="https://img.shields.io/npm/v/vue3-next-qrcode.svg" alt="npm package"></a>
  <a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XiaoDaiGua-Ray/vue3-next-qrcode" alt="LICENSE"></a>
</p>

<div align="center">

# vue3-next-qrcode

English | [简体中文](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/README.zh-CN.md)

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
import 'vue3-next-qrcode/es/style.css'
</script>

<template>
  <Vue3NextQrcode text="hello vue3 next qrcode" />
</template>
```

## 🤺 Props Options

| **name**               | **type**                                              | **default**      | **des**                                                                                                              | **version** |
| ---------------------- | ----------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| watchText              | boolean                                               | true             | Atuo watch QR code text, If update text, then re-render QR code                                                      | \*          |
| status                 | QRCodeStatus                                          | undefined        | QR code status                                                                                                       | \*          |
| errorDescription       | string \| VNode                                       | 二维码已过期     | status error QR code error description label                                                                         | \*          |
| errorActionDescription | string                                                | 重新加载         | status error QR code error action description label                                                                  | \*          |
| text                   | string                                                | `required`       | Text to be encoded in the QR code                                                                                    | \*          |
| size                   | number                                                | 160              | Size of the QR code in pixel                                                                                         | \*          |
| margin                 | number                                                | 12               | Size of margins around the QR code body in pixel                                                                     | \*          |
| correctLevel           | number                                                | 1                | Error correction level of the QR code(0-3), Accepts a value provided by _QRErrorCorrectLevel_                        | \*          |
| maskPattern            | number                                                | undefined        | Specify the mask pattern to be used in QR code encoding, Accepts a value provided by _QRMaskPattern_                 | \*          |
| version                | number                                                | undefined        | Specify the version to be used in QR code encoding, Accepts an integer in range [1, 40]                              | \*          |
| components             | ComponentOptions                                      | {}               | Options to control components in the QR code                                                                         | \*          |
| colorDark              | string                                                | #000000          | Color of the blocks on the QR code                                                                                   | \*          |
| colorLight             | boolean                                               | #ffffff          | Color of the blocks on the QR code                                                                                   | \*          |
| autoColor              | boolean                                               | true             | Automatically calculate the _colorLight_ value from the QR code's background                                         | \*          |
| backgroundImage        | string                                                | undefined        | Background image to be used in the QR code                                                                           | \*          |
| backgroundDimming      | string                                                | rgba(0, 0, 0, 0) | Color of the dimming mask above the background image                                                                 | \*          |
| gifBackgroundURL       | string                                                | undefined        | GIF background image to be used in the QR code                                                                       | \*          |
| gifBackground          | ArrayBuffer                                           | undefined        | GIF background image to be used in the QR code                                                                       | \*          |
| whiteMargin            | boolean                                               | true             | Use a white margin instead of a transparent one which reveals the background of the QR code on margins               | \*          |
| logoImage              | string                                                | undefined        | Logo image to be displayed at the center of the QR code                                                              | \*          |
| logoScale              | number                                                | 0.4              | Ratio of the logo size to the QR code size                                                                           | \*          |
| logoMargin             | number                                                | 6                | Size of margins around the logo image in pixels                                                                      | \*          |
| logoCornerRadius       | number                                                | 8                | Corner radius of the logo image in pixels                                                                            | \*          |
| dotScale               | number                                                | 1                | Ratio of the real size to the full size of the blocks                                                                | \*          |
| onSuccess              | (dataURL: ArrayBuffer \| string \| undefined) => void | null             | When the QR code is successfully generated, this callback is called                                                  | \*          |
| onError                | (e: unknown) => void                                  | null             | When the QR code generation fails, this callback is called                                                           | \*          |
| onReload               | () => void                                            | null             | When reload button is clicked, this callback is called, This method will not execute if the errorAction slot is used | \*          |

## 🔧 Slots

| **name**    | **params** | **des**                                    | **version** |
| ----------- | ---------- | ------------------------------------------ | ----------- |
| errorAction | ()         | Custom display style in status error state | \*          |
| loading     | ()         | Customize loading status slots             | 2.0.4       |

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
