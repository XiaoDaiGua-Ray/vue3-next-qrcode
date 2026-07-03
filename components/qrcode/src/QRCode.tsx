import './index.scss'

import props from './props'
import { call } from './call'
import { renderQRCode as renderQRCodeImage } from './renderer'
import { useGifBackground } from './useGifBackground'
import { useQRCodeDownload } from './useQRCodeDownload'
import { useQRCodeRenderQueue } from './useQRCodeRenderQueue'
import {
  ref,
  onMounted,
  defineComponent,
  computed,
  watch,
  onBeforeUnmount,
} from 'vue'

import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

export default defineComponent({
  name: 'Vue3NextQrcode',
  props,
  setup(props, ctx) {
    const { expose } = ctx

    // State
    const qrcodeURL = ref<QRCodeRenderResponse>()
    const isClick = ref(false)
    const gifBackground = useGifBackground()
    const renderQueue = useQRCodeRenderQueue<QRCodeRenderResponse>()
    const { download } = useQRCodeDownload(qrcodeURL)

    // Computed
    const cssVars = computed(() => {
      const { defineProvider, size, logoCornerRadius, maskColor } = props

      return {
        '--r-qrcode-width': `${size}px`,
        '--r-qrcode-height': `${size}px`,
        '--r-qrcode-border-radius': `${logoCornerRadius}px`,
        '--r-qrcode-mask-color': maskColor,
        ...defineProvider,
      }
    })

    const loadingClass = computed(() => {
      if (props.status !== 'loading') return ''

      return ctx.slots.loading
        ? 'r-qrcode__loading--custom'
        : 'r-qrcode__loading'
    })

    // Methods
    const renderQRCode = async (): Promise<void> => {
      await renderQueue.runLatest(
        async () => {
          const {
            gifBackgroundURL,
            gifBackground: gifBackgroundProp,
            onSuccess: _onSuccess,
            onError: _onError,
            defineProvider: _defineProvider,
            maskColor: _maskColor,
            watchText: _watchText,
            status: _status,
            errorDescription: _errorDescription,
            errorActionDescription: _errorActionDescription,
            onReload: _onReload,
            ...ops
          } = props

          let gifBackgroundBuffer: ArrayBuffer | undefined

          if (gifBackgroundURL) {
            gifBackgroundBuffer =
              gifBackground.getBuffer(gifBackgroundURL) ??
              (await gifBackground.load(gifBackgroundURL))
          } else {
            gifBackgroundBuffer = gifBackgroundProp || undefined
          }

          const renderOptions: QRCodeBaseOptions = {
            ...ops,
            text: props.text ?? '',
            gifBackground: gifBackgroundBuffer,
          }

          return renderQRCodeImage(renderOptions)
        },
        {
          onSuccess(result) {
            qrcodeURL.value = result

            if (props.onSuccess) {
              call(props.onSuccess, result)
            }
          },
          onError(error) {
            if (props.onError) {
              call(props.onError, error)
            }
          },
        },
      )
    }

    const handleErrorAction = (): void => {
      if (ctx.slots.errorAction) return

      const { onReload } = props

      if (onReload) {
        call(onReload)
      }
    }

    const downloadQRCode = async (fileName?: string): Promise<void> => {
      await download(fileName)
    }

    // Watchers
    const renderOptionValues = computed(() => [
      props.watchText ? props.text : null,
      props.size,
      props.margin,
      props.correctLevel,
      props.maskPattern,
      props.version,
      props.components,
      props.colorDark,
      props.colorLight,
      props.autoColor,
      props.backgroundImage,
      props.backgroundDimming,
      props.gifBackground,
      props.whiteMargin,
      props.logoImage,
      props.logoScale,
      props.logoMargin,
      props.logoCornerRadius,
      props.dotScale,
    ])

    const stopOptionsWatch = watch(renderOptionValues, renderQRCode, {
      deep: true,
    })

    const stopGifWatch = watch(
      () => props.gifBackgroundURL,
      (newUrl) => {
        if (!newUrl) {
          gifBackground.clear()
        }

        renderQRCode()
      },
    )

    // Lifecycle
    onMounted(() => {
      renderQRCode()
    })

    onBeforeUnmount(() => {
      stopOptionsWatch()
      stopGifWatch()
      renderQueue.dispose()
      gifBackground.dispose()
    })

    // Expose
    expose({
      downloadQRCode,
    })

    return {
      qrcodeURL,
      cssVars,
      isClick,
      loadingClass,
      errorActionClick: handleErrorAction,
    }
  },
  render() {
    const { status, errorDescription, errorActionDescription } = this

    return (
      <div
        class="r-qrcode"
        style={this.cssVars}
        role="img"
        aria-label="QR Code"
      >
        <div class={this.loadingClass}>
          {status === 'loading' &&
            (this.$slots.loading ? (
              <div class="r-qrcode__loading-slots">{this.$slots.loading()}</div>
            ) : (
              <div class="r-qrcode__spin" role="status" aria-label="Loading" />
            ))}
          <img
            src={this.qrcodeURL as string | undefined}
            alt="QR Code"
            data-component="VUE3_NEXT_QRCODE"
          />
        </div>

        {status === 'error' && (
          <div class="r-qrcode__error" role="alert">
            <div class="r-qrcode__error-content">
              {typeof errorDescription === 'string'
                ? errorDescription
                : errorDescription}
            </div>
            <div
              class="r-qrcode__error-btn"
              onClick={this.errorActionClick}
              role="button"
              tabindex={0}
              onKeydown={(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()

                  this.errorActionClick()
                }
              }}
            >
              {this.$slots.errorAction ? (
                this.$slots.errorAction()
              ) : (
                <span
                  onMousedown={() => (this.isClick = true)}
                  onMouseup={() => (this.isClick = false)}
                  class={this.isClick ? 'r-qrcode__error-btn-click' : ''}
                >
                  {errorActionDescription}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  },
})
