import './index.scss'

import props from './props'
import { call } from './call'
import { renderQRCode as renderQRCodeImage } from './renderer'
import { downloadBase64File, readGIFAsArrayBuffer } from './utils'
import {
  ref,
  onMounted,
  defineComponent,
  computed,
  watch,
  onBeforeUnmount,
  shallowRef,
} from 'vue'

import type { QRCodeBaseOptions, QRCodeRenderResponse } from './types'

export default defineComponent({
  name: 'Vue3NextQrcode',
  props,
  setup(props, ctx) {
    const { expose } = ctx

    // State
    const qrcodeURL = ref<QRCodeRenderResponse>()
    const gifBuffer = shallowRef<ArrayBuffer | null>(null)
    const isClick = ref(false)
    const isRendering = ref(false)
    const needsRerender = ref(false)
    let renderRequestId = 0

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
    const loadGIFFromURL = async (url: string): Promise<void> => {
      try {
        gifBuffer.value = await readGIFAsArrayBuffer(url)
      } catch (error) {
        console.error('Failed to load GIF background:', error)

        gifBuffer.value = null

        throw error
      }
    }

    const renderQRCode = async (): Promise<void> => {
      const requestId = ++renderRequestId

      if (isRendering.value) {
        needsRerender.value = true
        return
      }

      isRendering.value = true
      needsRerender.value = false

      try {
        const {
          gifBackgroundURL,
          gifBackground,
          onSuccess,
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

        // Load GIF if needed
        if (gifBackgroundURL && !gifBuffer.value) {
          await loadGIFFromURL(gifBackgroundURL)
        }

        const renderOptions: QRCodeBaseOptions = {
          ...ops,
          text: props.text ?? '',
          gifBackground: gifBuffer.value || gifBackground || undefined,
        }
        const result = await renderQRCodeImage(renderOptions)

        if (requestId !== renderRequestId) return

        qrcodeURL.value = result

        if (onSuccess) {
          call(onSuccess, result)
        }
      } catch (error) {
        const { onError } = props

        if (onError) {
          call(onError, error)
        }
      } finally {
        isRendering.value = false

        if (needsRerender.value) {
          renderQRCode()
        }
      }
    }

    const handleErrorAction = (): void => {
      if (ctx.slots.errorAction) return

      const { onReload } = props

      if (onReload) {
        call(onReload)
      }
    }

    const downloadQRCode = async (fileName?: string): Promise<void> => {
      if (!qrcodeURL.value || typeof qrcodeURL.value !== 'string') {
        throw new Error('QR code not available for download')
      }

      downloadBase64File(qrcodeURL.value, fileName)
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
      async (newUrl) => {
        if (newUrl) {
          await loadGIFFromURL(newUrl)
        } else {
          gifBuffer.value = null
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
