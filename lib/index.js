"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
require("./qrcode/index.js");
const QRCode = require("./qrcode/src/QRCode.js");
const props = require("./qrcode/src/props.js");
const index = {
  install(app) {
    app.component(QRCode.default.name, QRCode.default);
  }
};
exports.Vue3NextQrcode = QRCode.default;
exports.qrcodeProps = props.default;
exports.default = index;
