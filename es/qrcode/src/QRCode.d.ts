import { default as props } from './props';
import { DefineComponent, ExtractPropTypes } from 'vue';
type ResolvedQRCodeProps = ExtractPropTypes<typeof props>;
export type QRCodeProps = Pick<ResolvedQRCodeProps, 'text'> & Partial<Omit<ResolvedQRCodeProps, 'text'>>;
declare const _default: DefineComponent<QRCodeProps>;
export default _default;
