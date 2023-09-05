import QRCode from "./src/QRCode.js";
QRCode.install = function(app) {
  app.component(QRCode.name, QRCode);
};
export {
  QRCode as default
};
