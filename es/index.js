import "./qrcode/index.js";
import QRCode from "./qrcode/src/QRCode.js";
import { default as default2 } from "./qrcode/src/props.js";
const index = {
  install(app) {
    app.component(QRCode.name, QRCode);
  }
};
export {
  QRCode as Vue3NextQrcode,
  index as default,
  default2 as qrcodeProps
};
