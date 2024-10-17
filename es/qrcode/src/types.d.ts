/// <reference types="node" />
import type { ComponentOptions, Options } from '../core/awesome-qr';
export type QRCodeStatus = 'error' | 'success' | 'loading';
export type QRCodeLevel = 0 | 1 | 2 | 3;
export type QRCodeRenderResponse = string | ArrayBuffer | Buffer | undefined;
export type QRCodeInst = {
    /**
     *
     * @param fileName file name
     *
     * 如果未设置名称，则默认以 时间戳.png 命名
     */
    downloadQRCode: (fileName?: string) => void;
};
export type MaybeArray<T> = T | T[];
export type AnyFC = (...args: any[]) => any;
export type QRCodeComponentProps = ComponentOptions;
export type QRCodeOptions = Options;
export interface DefineProvider {
    '--ray-qrcode-primary-color': string;
    '--ray-qrcode-primary-color-2': string;
    '--ray-qrcode-width': string;
    '--ray-qrcode-height': string;
    '--ray-qrcode-border-radius': string;
    '--ray-qrcode-mask-color': string;
    '--ray-qrcode-spin-size': string;
}
