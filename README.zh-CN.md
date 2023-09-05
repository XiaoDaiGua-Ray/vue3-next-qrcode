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

一个关于 vue3 的 QR Code 组件，支持 LOGO GIF 等丰富属性

</div>

## ✨ 特性

- 🏄🏼‍♂️ 简单易用
- 🛸 丰富的配置属性
- 🏟️ 覆盖大部分业务场景
- 🎯 使用 TypeScript 构建，提供完整的类型定义文件

## 📦 安装

```bash
npm i vue3-next-qrcode
```

## 🤹‍♀️ 使用

```vue
<script lang="ts" setup>
import { Vue3NextQrcode } from 'vue3-next-qrcode'
</script>

<template>
  <Vue3NextQrcode text="hello vue3 next qrcode" />
</template>
```

## 🤺 Props 配置项

| **名称**               | **类型**                                              | **默认值**       | **说明**                                                                           | **版本** |
| ---------------------- | ----------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | -------- |
| watchText              | boolean                                               | true             | 是否启用自动监听内容变换后，重新渲染二维码                                         | \*       |
| status                 | QRCodeStatus                                          | undefined        | 二维码状态                                                                         | \*       |
| errorDescription       | string \| VNode                                       | 二维码已过期     | status error 状态下的描述文案                                                      | \*       |
| errorActionDescription | string                                                | 重新加载         | status error 状态下的按钮描述文案                                                  | \*       |
| text                   | string                                                | `必填`           | 二维码填充内容                                                                     | \*       |
| size                   | number                                                | 160              | 二维码渲染尺寸                                                                     | \*       |
| margin                 | number                                                | 12               | 二维码主体周围的边距大小（以像素为单位)                                            | \*       |
| correctLevel           | number                                                | 1                | 二维码纠错等级（0-3）                                                              | \*       |
| maskPattern            | number                                                | undefined        | 指定二维码编码时使用的掩码图案，接受*QRMaskPattern*提供的值                        | \*       |
| version                | number                                                | undefined        | 指定二维码编码使用的版本，接受[1-40]整数                                           | \*       |
| components             | ComponentOptions                                      | {}               | 用于控制二维码中的组件的选项                                                       | \*       |
| colorDark              | string                                                | #000000          | 二维码上方块的颜色                                                                 | \*       |
| colorLight             | boolean                                               | #ffffff          | 二维码上方块的颜色                                                                 | \*       |
| autoColor              | boolean                                               | true             | 自动计算二维码背景的*colorLight*值                                                 | \*       |
| backgroundImage        | string                                                | undefined        | 二维码背景图                                                                       | \*       |
| backgroundDimming      | string                                                | rgba(0, 0, 0, 0) | 背景图像上方调光蒙版的颜色                                                         | \*       |
| gifBackgroundURL       | string                                                | undefined        | gif 图链接地址                                                                     | \*       |
| gifBackground          | ArrayBuffer                                           | undefined        | gif 图文件流                                                                       | \*       |
| whiteMargin            | boolean                                               | true             | 使用白色边距而不是透明边距，透明边距会显示边距上二维码的背景                       | \*       |
| logoImage              | string                                                | undefined        | 二维码 logo                                                                        | \*       |
| logoScale              | number                                                | 0.4              | logo 与二维码尺寸的比例                                                            | \*       |
| logoMargin             | number                                                | 6                | logo 边距尺寸                                                                      | \*       |
| logoCornerRadius       | number                                                | 8                | 二维码圆角尺寸                                                                     | \*       |
| dotScale               | number                                                | 1                | 块的实际大小与完整大小的比率，当您想要使背景的更多部分可见时，这会很有帮助。       | \*       |
| onSuccess              | (dataURL: ArrayBuffer \| string \| undefined) => void | null             | 二维码渲染成功回调                                                                 | \*       |
| onError                | (e: unknown) => void                                  | null             | 二维码渲染失败回调                                                                 | \*       |
| onReload               | () => void                                            | null             | status error 状态下点击重新加载按钮回调，如果使用了 errorAction 插槽该方法不会执行 | \*       |

## 🪴 项目活动

![Alt](https://repobeats.axiom.co/api/embed/7802e3c093747ad0cf1dbda3937e7a34500428ad.svg 'Repobeats analytics image')

### 贡献者

感谢他们的所做的一切贡献 🐝 ！

<a href="https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XiaoDaiGua-Ray/vue3-next-qrcode" />
</a>

## 🌸 Thanks

该项目基于 [awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md) 开发

## 📄 证书

[MIT License](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode/blob/main/LICENSE) © 2023-PRESENT [Ray](https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode)
