"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const QRCode = require("./src/QRCode.js");
QRCode.default.install = function(app) {
  app.component(QRCode.default.name, QRCode.default);
};
exports.default = QRCode.default;
