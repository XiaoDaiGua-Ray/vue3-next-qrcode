import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useQRCodeDownload } from '../components/qrcode/src/useQRCodeDownload'

describe('useQRCodeDownload', () => {
  it('tracks whether the current source can be downloaded', async () => {
    const source = ref<string | undefined>()
    const { canDownload, download } = useQRCodeDownload(source)

    expect(canDownload.value).toBe(false)
    await expect(download()).rejects.toThrow('QR code not available')

    source.value = 'data:image/png;base64,abc'

    expect(canDownload.value).toBe(true)
  })

  it('downloads the current ref source', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    const source = ref('data:image/png;base64,abc')
    const { download } = useQRCodeDownload(source)

    await download('code.png')

    expect(click).toHaveBeenCalledTimes(1)
    expect(document.querySelector('a')).toBeNull()
  })

  it('allows an explicit source override', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    const { download } = useQRCodeDownload()

    await download('override.png', 'data:image/png;base64,override')

    expect(click).toHaveBeenCalledTimes(1)
  })
})
