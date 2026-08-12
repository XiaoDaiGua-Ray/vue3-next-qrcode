import { default as QRCode, props } from './qrcode/index';
import { App, DefineComponent } from 'vue';
import { QRCodeProps } from './qrcode/src/QRCode';
import { QRCodeInst, QRCodeLevel, QRCodeStatus, QRCodeComponentProps, QRCodeBaseOptions, QRCodeOptions, ComponentOptions, DefineProvider, QRCodeRenderResponse } from './qrcode/src/types';
export type { QRCodeInst, QRCodeLevel, QRCodeStatus, QRCodeComponentProps, QRCodeBaseOptions, QRCodeOptions, ComponentOptions, DefineProvider, QRCodeRenderResponse, QRCodeProps, };
export { QRCode as Vue3NextQrcode, props as qrcodeProps };
export { useQRCode } from './qrcode/src/useQRCode';
export { QRCodeGenerationCancelledError } from './qrcode/src/useQRCode';
export type { QRCodeGenerationConcurrency, QRCodeGenerationStatus, UseQRCodeConfig, UseQRCodeConfigWithDefaults, UseQRCodeOptions, UseQRCodeReturn, UseQRCodeReturnWithDefaults, UseQRCodeReturnType, } from './qrcode/src/useQRCode';
export { useQRCodeDownload } from './qrcode/src/useQRCodeDownload';
export type { QRCodeDownloadSource, CompatibleMaybeRef, UseQRCodeDownloadReturn, } from './qrcode/src/useQRCodeDownload';
export { clearQRCodeGIFCache } from './qrcode/src/utils';
export { QRCodeClient } from './qrcode/src/QRCodeClient';
export interface Vue3NextQrcodePlugin {
    install: (app: App) => void;
    Vue3NextQrcode: DefineComponent<QRCodeProps>;
}
declare const plugin: Vue3NextQrcodePlugin;
export default plugin;
