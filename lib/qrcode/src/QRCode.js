"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const vue = require("vue");
require("./index.scss.js");
const props = require("./props.js");
const awesomeQr = require("../../node_modules/.pnpm/awesome-qr@2.1.5-rc.0/node_modules/awesome-qr/lib/awesome-qr.js");
const call = require("./call.js");
const downloadBase64File = (base64, fileName) => {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName || (/* @__PURE__ */ new Date()).getTime() + ".png";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const readGIFAsArrayBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.onabort = (e) => {
        reject(e);
      };
      reader.readAsArrayBuffer(xhr.response);
    };
    xhr.open("GET", url);
    xhr.send();
  });
};
const QRCode = /* @__PURE__ */ vue.defineComponent({
  name: "Vue3NextQrcode",
  props: props.default,
  setup(props2, ctx) {
    const {
      expose
    } = ctx;
    const cssVars = vue.computed(() => {
      const cssVar = {
        "--ray-qrcode-width": props2.size + "px",
        "--ray-qrcode-height": props2.size + "px",
        "--ray-qrcode-border-radius": props2.logoCornerRadius + "px",
        "--ray-qrcode-mask-color": props2.maskColor
      };
      return cssVar;
    });
    const qrcodeURL = vue.ref();
    let gifBuffer;
    const isClick = vue.ref(false);
    let watchCallback;
    const getGIFImageByURL = async () => {
      const {
        gifBackgroundURL
      } = props2;
      if (!gifBackgroundURL) {
        return;
      }
      try {
        gifBuffer = await readGIFAsArrayBuffer(gifBackgroundURL);
      } catch (e) {
        console.error(e);
      }
    };
    const renderQRCode = () => {
      const {
        gifBackgroundURL,
        gifBackground,
        ...ops
      } = props2;
      new awesomeQr.AwesomeQR({
        ...ops,
        gifBackground: gifBuffer ?? void 0
      }).draw().then((res) => {
        const {
          onSuccess
        } = props2;
        if (onSuccess) {
          call.call(onSuccess, res);
        }
        qrcodeURL.value = res;
      }).catch((err) => {
        const {
          onError
        } = props2;
        if (onError) {
          call.call(onError, err);
        }
      });
    };
    const errorActionClick = () => {
      if (ctx.slots.errorAction) {
        return;
      }
      const {
        onReload
      } = props2;
      if (onReload) {
        call.call(onReload);
      }
    };
    const downloadQRCode = (fileName) => {
      if (qrcodeURL.value && typeof qrcodeURL.value === "string") {
        return new Promise((resolve) => {
          downloadBase64File(qrcodeURL.value, fileName);
          resolve();
        });
      } else {
        return Promise.reject();
      }
    };
    vue.watchEffect(() => {
      if (props2.watchText) {
        watchCallback = vue.watch(() => props2.text, () => renderQRCode());
      } else {
        watchCallback == null ? void 0 : watchCallback();
      }
    });
    expose({
      downloadQRCode
    });
    vue.onMounted(async () => {
      await getGIFImageByURL();
      renderQRCode();
    });
    vue.onBeforeUnmount(() => {
      watchCallback == null ? void 0 : watchCallback();
    });
    return {
      qrcodeURL,
      errorActionClick,
      cssVars,
      isClick
    };
  },
  render() {
    return vue.createVNode("div", {
      "class": "ray-qrcode",
      "style": [this.cssVars]
    }, [vue.createVNode("div", {
      "class": [this.status === "loading" && !this.$slots.loading ? "ray-qrcode__loading" : "", this.$slots.loading ? "ray-qrcode__loading--custom" : ""]
    }, [this.status === "loading" ? this.$slots.loading ? vue.createVNode("div", {
      "class": "ray-qrcode__loading-slots"
    }, [this.$slots.loading()]) : vue.createVNode("div", {
      "class": "ray-qrcode__spin"
    }, null) : null, vue.createVNode("img", vue.mergeProps({
      "src": this.qrcodeURL
    }, {
      img_tag: "VUE3_NEXT_QRCODE"
    }), null)]), this.status === "error" ? vue.createVNode("div", {
      "class": "ray-qrcode__error"
    }, [vue.createVNode("div", {
      "class": "ray-qrcode__error-content"
    }, [typeof this.errorDescription === "string" ? this.errorDescription : () => this.errorDescription]), vue.createVNode("div", {
      "class": "ray-qrcode__error-btn",
      "onClick": this.errorActionClick.bind(this)
    }, [this.$slots.errorAction ? this.$slots.errorAction() : vue.createVNode("span", {
      "onMousedown": () => {
        this.isClick = true;
      },
      "onMouseup": () => {
        this.isClick = false;
      },
      "class": [this.isClick ? "ray-qrcode__error-btn-click" : ""]
    }, [this.errorActionDescription])])]) : null]);
  }
});
exports.default = QRCode;
exports.downloadBase64File = downloadBase64File;
