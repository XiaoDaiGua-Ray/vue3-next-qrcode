import { default as props } from './src/props';
import { App, DefineComponent } from 'vue';
import { QRCodeProps } from './src/QRCode';
declare const installableQRCode: DefineComponent<QRCodeProps> & {
    install?: (app: App) => void;
};
export { props };
export default installableQRCode;
