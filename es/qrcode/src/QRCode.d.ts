import type { QRCodeRenderResponse } from './types';
export declare const downloadBase64File: (base64: string, fileName?: string) => void;
declare const _default: import("vue").DefineComponent<{
    watchText: {
        type: BooleanConstructor;
        default: boolean;
    };
    status: {
        type: import("vue").PropType<import("./types").QRCodeStatus>;
    };
    errorDescription: {
        type: import("vue").PropType<string | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>>;
        default: string;
    };
    errorActionDescription: {
        type: StringConstructor;
        default: string;
    };
    text: {
        type: StringConstructor;
        required: boolean;
    };
    size: {
        type: NumberConstructor;
        default: number;
    };
    margin: {
        type: NumberConstructor;
        default: number;
    };
    correctLevel: {
        type: import("vue").PropType<import("./types").QRCodeLevel>;
        default: number;
        validator: (value: unknown) => boolean;
    };
    maskPattern: {
        type: NumberConstructor;
    };
    version: {
        type: NumberConstructor;
    };
    components: {
        type: import("vue").PropType<import("awesome-qr/lib/awesome-qr").ComponentOptions>;
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
        type: StringConstructor;
        default: string;
    };
    colorLight: {
        type: StringConstructor;
        default: string;
    };
    autoColor: {
        type: BooleanConstructor;
        default: boolean;
    };
    backgroundImage: {
        type: StringConstructor;
    };
    backgroundDimming: {
        type: StringConstructor;
        default: string;
    };
    gifBackgroundURL: {
        type: StringConstructor;
    };
    gifBackground: {
        type: ArrayBufferConstructor;
    };
    whiteMargin: {
        type: BooleanConstructor;
        default: boolean;
    };
    logoImage: {
        type: StringConstructor;
    };
    logoScale: {
        type: NumberConstructor;
        default: number;
    };
    logoMargin: {
        type: NumberConstructor;
        default: number;
    };
    logoCornerRadius: {
        type: NumberConstructor;
        default: number;
    };
    dotScale: {
        type: NumberConstructor;
        default: number;
    };
    onSuccess: {
        type: import("vue").PropType<import("./types").MaybeArray<(dataURL: string | ArrayBuffer | undefined) => void>>;
        default: null;
    };
    onError: {
        type: import("vue").PropType<import("./types").MaybeArray<(e: unknown) => void>>;
        default: null;
    };
    onReload: {
        type: import("vue").PropType<import("./types").MaybeArray<() => void>>;
        default: null;
    };
}, {
    qrcodeURL: import("vue").Ref<QRCodeRenderResponse>;
    spinOverrides: {
        opacitySpinning: string;
    };
    errorActionClick: () => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    watchText: {
        type: BooleanConstructor;
        default: boolean;
    };
    status: {
        type: import("vue").PropType<import("./types").QRCodeStatus>;
    };
    errorDescription: {
        type: import("vue").PropType<string | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>>;
        default: string;
    };
    errorActionDescription: {
        type: StringConstructor;
        default: string;
    };
    text: {
        type: StringConstructor;
        required: boolean;
    };
    size: {
        type: NumberConstructor;
        default: number;
    };
    margin: {
        type: NumberConstructor;
        default: number;
    };
    correctLevel: {
        type: import("vue").PropType<import("./types").QRCodeLevel>;
        default: number;
        validator: (value: unknown) => boolean;
    };
    maskPattern: {
        type: NumberConstructor;
    };
    version: {
        type: NumberConstructor;
    };
    components: {
        type: import("vue").PropType<import("awesome-qr/lib/awesome-qr").ComponentOptions>;
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
        type: StringConstructor;
        default: string;
    };
    colorLight: {
        type: StringConstructor;
        default: string;
    };
    autoColor: {
        type: BooleanConstructor;
        default: boolean;
    };
    backgroundImage: {
        type: StringConstructor;
    };
    backgroundDimming: {
        type: StringConstructor;
        default: string;
    };
    gifBackgroundURL: {
        type: StringConstructor;
    };
    gifBackground: {
        type: ArrayBufferConstructor;
    };
    whiteMargin: {
        type: BooleanConstructor;
        default: boolean;
    };
    logoImage: {
        type: StringConstructor;
    };
    logoScale: {
        type: NumberConstructor;
        default: number;
    };
    logoMargin: {
        type: NumberConstructor;
        default: number;
    };
    logoCornerRadius: {
        type: NumberConstructor;
        default: number;
    };
    dotScale: {
        type: NumberConstructor;
        default: number;
    };
    onSuccess: {
        type: import("vue").PropType<import("./types").MaybeArray<(dataURL: string | ArrayBuffer | undefined) => void>>;
        default: null;
    };
    onError: {
        type: import("vue").PropType<import("./types").MaybeArray<(e: unknown) => void>>;
        default: null;
    };
    onReload: {
        type: import("vue").PropType<import("./types").MaybeArray<() => void>>;
        default: null;
    };
}>>, {
    watchText: boolean;
    errorDescription: string | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    errorActionDescription: string;
    size: number;
    margin: number;
    correctLevel: import("./types").QRCodeLevel;
    components: import("awesome-qr/lib/awesome-qr").ComponentOptions;
    colorDark: string;
    colorLight: string;
    autoColor: boolean;
    backgroundDimming: string;
    whiteMargin: boolean;
    logoScale: number;
    logoMargin: number;
    logoCornerRadius: number;
    dotScale: number;
    onSuccess: import("./types").MaybeArray<(dataURL: string | ArrayBuffer | undefined) => void>;
    onError: import("./types").MaybeArray<(e: unknown) => void>;
    onReload: import("./types").MaybeArray<() => void>;
}, {}>;
export default _default;
