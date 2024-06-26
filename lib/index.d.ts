import QRCode, { props } from './qrcode/index';
import type { App } from 'vue';
import type { QRCodeInst, QRCodeLevel, QRCodeStatus } from './qrcode/src/types';
export type { QRCodeInst, QRCodeLevel, QRCodeStatus };
export { QRCode as Vue3NextQrcode, props as qrcodeProps };
declare const _default: {
    install(app: App): void;
};
export default _default;
