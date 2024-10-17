/// <reference types="node" />
import type { MaybeArray, QRCodeStatus, QRCodeLevel, DefineProvider } from './types';
import type { PropType, VNode } from 'vue';
import type { ComponentOptions } from '../core/awesome-qr';
declare const props: {
    defineProvider: {
        /**
         *
         * Define provider.
         * You can define qrcode css here.
         *
         * @default undefined
         */
        type: PropType<Partial<DefineProvider>>;
        default: undefined;
    };
    maskColor: {
        /**
         *
         * QR code mask color
         *
         * @default rgba(255, 255, 255, 0.96)
         */
        type: StringConstructor;
        default: string;
    };
    watchText: {
        /**
         *
         * Atuo watch QR code text
         * If update text, then re-render QR code
         *
         * @default true
         */
        type: BooleanConstructor;
        default: boolean;
    };
    status: {
        /**
         *
         * QR code status
         *
         * @default undefined
         */
        type: PropType<QRCodeStatus>;
    };
    errorDescription: {
        /**
         *
         * QR code error description label
         *
         * @default 二维码已过期
         */
        type: PropType<string | VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>>;
        default: string;
    };
    errorActionDescription: {
        /**
         *
         * QR code error action description label
         *
         * @default 重新加载
         */
        type: StringConstructor;
        default: string;
    };
    text: {
        /**
         *
         * Text to be encoded in the QR code
         */
        type: StringConstructor;
        required: boolean;
    };
    size: {
        /**
         *
         * Size of the QR code in pixel.
         *
         * @default 160
         */
        type: NumberConstructor;
        default: number;
    };
    margin: {
        /**
         *
         * Size of margins around the QR code body in pixel.
         *
         * @default 12
         */
        type: NumberConstructor;
        default: number;
    };
    correctLevel: {
        /**
         *
         * Error correction level of the QR code
         * Accepts a value provided by _QRErrorCorrectLevel_
         *
         * @default 1
         */
        type: PropType<QRCodeLevel>;
        default: number;
        validator: (value: unknown) => boolean;
    };
    maskPattern: {
        /**
         *
         * Specify the mask pattern to be used in QR code encoding
         * Accepts a value provided by _QRMaskPattern_
         */
        type: NumberConstructor;
    };
    version: {
        /**
         *
         * Specify the version to be used in QR code encoding
         * Accepts an integer in range [1, 40]
         */
        type: NumberConstructor;
    };
    components: {
        /**
         *
         * Options to control components in the QR code.
         *
         * @default {data:{scale...},...}
         */
        type: PropType<ComponentOptions>;
        default: () => {
            data: {
                scale: number;
            };
            timing: {
                scale: number;
                protectors: boolean;
            };
            alignment: {
                scale: number;
                protectors: boolean;
            };
            cornerAlignment: {
                scale: number;
                protectors: boolean;
            };
        };
    };
    colorDark: {
        /**
         *
         * Color of the blocks on the QR code
         * Accepts a CSS &lt;color&gt;
         *
         * @default #000000
         */
        type: StringConstructor;
        default: string;
    };
    colorLight: {
        /**
         *
         * Color of the blocks on the QR code
         * Accepts a CSS &lt;color&gt;
         *
         * @default #ffffff
         */
        type: StringConstructor;
        default: string;
    };
    autoColor: {
        /**
         *
         * Automatically calculate the _colorLight_ value from the QR code's background
         *
         * @default true
         */
        type: BooleanConstructor;
        default: boolean;
    };
    backgroundImage: {
        /**
         *
         * Background image to be used in the QR code
         * Accepts a `data:` string in web browsers or a Buffer in Node.js
         *
         * @default undefined
         */
        type: StringConstructor;
    };
    backgroundDimming: {
        /**
         *
         * Color of the dimming mask above the background image
         * Accepts a CSS &lt;color&gt;
         *
         * @default rgba(0, 0, 0, 0)
         */
        type: StringConstructor;
        default: string;
    };
    gifBackgroundURL: {
        /**
         *
         * GIF background image to be used in the QR code
         *
         * @default undefined
         */
        type: StringConstructor;
    };
    gifBackground: {
        /**
         *
         * GIF background image to be used in the QR code
         *
         * @default undefined
         */
        type: ArrayBufferConstructor;
    };
    whiteMargin: {
        /**
         *
         * Use a white margin instead of a transparent one which reveals the background of the QR code on margins
         *
         * @default true
         */
        type: BooleanConstructor;
        default: boolean;
    };
    logoImage: {
        /**
         *
         * Logo image to be displayed at the center of the QR code
         * Accepts a `data:` string in web browsers or a Buffer in Node.js
         * When set to `undefined` or `null`, the logo is disabled
         *
         * @default undefined
         */
        type: StringConstructor;
    };
    logoScale: {
        /**
         *
         * Ratio of the logo size to the QR code size
         *
         * @default 0.4
         */
        type: NumberConstructor;
        default: number;
    };
    logoMargin: {
        /**
         *
         * Size of margins around the logo image in pixels
         *
         * @default 6
         */
        type: NumberConstructor;
        default: number;
    };
    logoCornerRadius: {
        /**
         * Corner radius of the logo image in pixels.
         *
         * @default 8
         */
        type: NumberConstructor;
        default: number;
    };
    dotScale: {
        /**
         *
         * Ratio of the real size to the full size of the blocks.
         * This can be helpful when you want to make more parts of the background visible.
         *
         * @default 1
         */
        type: NumberConstructor;
        default: number;
    };
    onSuccess: {
        /**
         *
         * When the QR code is successfully generated, this callback is called
         */
        type: PropType<MaybeArray<(dataURL: ArrayBuffer | string | undefined | Buffer) => void>>;
        default: null;
    };
    onError: {
        /**
         *
         * When the QR code generation fails, this callback is called
         */
        type: PropType<MaybeArray<(e: unknown) => void>>;
        default: null;
    };
    onReload: {
        /**
         *
         * When reload button is clicked, this callback is called
         * This method will not execute if the errorAction slot is used
         */
        type: PropType<MaybeArray<() => void>>;
        default: null;
    };
};
export default props;
