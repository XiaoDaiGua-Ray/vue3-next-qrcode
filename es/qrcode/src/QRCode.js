import { defineComponent, computed, ref, watchEffect, watch, onMounted, onBeforeUnmount, createVNode } from "vue";
import "./index.scss.js";
import props from "./props.js";
import { AwesomeQR as AwesomeQR_1 } from "../../node_modules/.pnpm/awesome-qr@2.1.5-rc.0/node_modules/awesome-qr/lib/awesome-qr.js";
import { call } from "./call.js";
const downloadBase64File = (base64, fileName) => {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName || (/* @__PURE__ */ new Date()).getTime() + ".png";
  link.click();
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
const QRCode = /* @__PURE__ */ defineComponent({
  name: "Vue3NextQrcode",
  props,
  setup(props2, ctx) {
    const {
      expose
    } = ctx;
    const cssVars = computed(() => {
      const cssVar = {
        "--ray-qrcode-width": props2.size + "px",
        "--ray-qrcode-height": props2.size + "px",
        "--ray-qrcode-border-radius": props2.logoCornerRadius + "px"
      };
      return cssVar;
    });
    const qrcodeURL = ref();
    let gifBuffer;
    const isClick = ref(false);
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
      new AwesomeQR_1({
        ...ops,
        gifBackground: gifBuffer ?? void 0
      }).draw().then((res) => {
        const {
          onSuccess
        } = props2;
        if (onSuccess) {
          call(onSuccess, res);
        }
        qrcodeURL.value = res;
      }).catch((err) => {
        const {
          onError
        } = props2;
        if (onError) {
          call(onError, err);
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
        call(onReload);
      }
    };
    const downloadQRCode = (fileName) => {
      if (qrcodeURL.value && typeof qrcodeURL.value === "string") {
        downloadBase64File(qrcodeURL.value, fileName);
      }
    };
    watchEffect(() => {
      if (props2.watchText) {
        watchCallback = watch(() => props2.text, () => renderQRCode());
      }
    });
    expose({
      downloadQRCode
    });
    onMounted(async () => {
      await getGIFImageByURL();
      renderQRCode();
    });
    onBeforeUnmount(() => {
      watchCallback && watchCallback();
    });
    return {
      qrcodeURL,
      errorActionClick,
      cssVars,
      isClick
    };
  },
  render() {
    return createVNode("div", {
      "class": "ray-qrcode",
      "style": [this.cssVars]
    }, [createVNode("div", {
      "class": [this.status === "loading" ? "ray-qrcode__loading" : ""]
    }, [this.status === "loading" ? createVNode("div", {
      "class": "ray-qrcode__spin"
    }, null) : null, createVNode("img", {
      "src": this.qrcodeURL
    }, null)]), this.status === "error" ? createVNode("div", {
      "class": "ray-qrcode__error"
    }, [createVNode("div", {
      "class": "ray-qrcode__error-content"
    }, [typeof this.errorDescription === "string" ? this.errorDescription : () => this.errorDescription]), createVNode("div", {
      "class": "ray-qrcode__error-btn",
      "onClick": this.errorActionClick.bind(this)
    }, [this.$slots.errorAction ? this.$slots.errorAction() : createVNode("span", {
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
export {
  QRCode as default,
  downloadBase64File
};
