import './index.scss'

import props from './props'
import { AwesomeQR } from 'awesome-qr/lib/awesome-qr'
import { call } from './call'
import {
  ref,
  onMounted,
  defineComponent,
  watchEffect,
  computed,
  watch,
  onBeforeUnmount,
} from 'vue'

import type { QRCodeRenderResponse } from './types'
import type { WatchStopHandle } from 'vue'

export const downloadBase64File = (base64: string, fileName?: string) => {
  const link = document.createElement('a')

  link.href = base64
  link.download = fileName || new Date().getTime() + '.png'

  link.click()
}

const readGIFAsArrayBuffer = (
  url: string,
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.responseType = 'blob'

    xhr.onload = () => {
      const reader = new FileReader()

      reader.onloadend = () => {
        resolve(reader.result)
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.onabort = (e) => {
        reject(e)
      }

      reader.readAsArrayBuffer(xhr.response)
    }

    xhr.open('GET', url)
    xhr.send()
  })
}

export default defineComponent({
  name: 'Vue3NextQrcode',
  props,
  setup(props, ctx) {
    const { expose } = ctx

    const cssVars = computed(() => {
      const cssVar = {
        '--ray-qrcode-width': props.size + 'px',
        '--ray-qrcode-height': props.size + 'px',
        '--ray-qrcode-border-radius': props.logoCornerRadius + 'px',
      }

      return cssVar
    })
    const qrcodeURL = ref<QRCodeRenderResponse>()
    let gifBuffer: string | ArrayBuffer | null
    const isClick = ref(false)
    let watchCallback!: WatchStopHandle

    const getGIFImageByURL = async () => {
      const { gifBackgroundURL } = props

      if (!gifBackgroundURL) {
        return
      }

      try {
        gifBuffer = await readGIFAsArrayBuffer(gifBackgroundURL)
      } catch (e) {
        console.error(e)
      }
    }

    const renderQRCode = () => {
      const { gifBackgroundURL, gifBackground, ...ops } = props

      new AwesomeQR({
        ...ops,
        gifBackground: (gifBuffer as ArrayBuffer) ?? undefined,
      })
        .draw()
        .then((res) => {
          const { onSuccess } = props

          if (onSuccess) {
            call(onSuccess, res)
          }

          qrcodeURL.value = res
        })
        .catch((err) => {
          const { onError } = props

          if (onError) {
            call(onError, err)
          }
        })
    }

    const errorActionClick = () => {
      if (ctx.slots.errorAction) {
        return
      }

      const { onReload } = props

      if (onReload) {
        call(onReload)
      }
    }

    const downloadQRCode = (fileName?: string) => {
      if (qrcodeURL.value && typeof qrcodeURL.value === 'string') {
        downloadBase64File(qrcodeURL.value, fileName)
      }
    }

    watchEffect(() => {
      if (props.watchText) {
        watchCallback = watch(
          () => props.text,
          () => renderQRCode(),
        )
      } else {
        watchCallback?.()
      }
    })

    expose({
      downloadQRCode,
    })

    onMounted(async () => {
      await getGIFImageByURL()
      renderQRCode()
    })
    onBeforeUnmount(() => {
      watchCallback?.()
    })

    return {
      qrcodeURL,
      errorActionClick,
      cssVars,
      isClick,
    }
  },
  render() {
    return (
      <div class="ray-qrcode" style={[this.cssVars]}>
        <div
          class={[
            this.status === 'loading' && !this.$slots.loading
              ? 'ray-qrcode__loading'
              : '',
            this.$slots.loading ? 'ray-qrcode__loading--custom' : '',
          ]}
        >
          {this.status === 'loading' ? (
            this.$slots.loading ? (
              <div class="ray-qrcode__loading-slots">
                {this.$slots.loading()}
              </div>
            ) : (
              <div class="ray-qrcode__spin"></div>
            )
          ) : null}
          <img src={this.qrcodeURL as string | undefined} />
        </div>
        {this.status === 'error' ? (
          <div class="ray-qrcode__error">
            <div class="ray-qrcode__error-content">
              {typeof this.errorDescription === 'string'
                ? this.errorDescription
                : () => this.errorDescription}
            </div>
            <div
              class="ray-qrcode__error-btn"
              onClick={this.errorActionClick.bind(this)}
            >
              {this.$slots.errorAction ? (
                this.$slots.errorAction()
              ) : (
                <span
                  onMousedown={() => {
                    this.isClick = true
                  }}
                  onMouseup={() => {
                    this.isClick = false
                  }}
                  class={[this.isClick ? 'ray-qrcode__error-btn-click' : '']}
                >
                  {this.errorActionDescription}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  },
})
