import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import QRCode from '../components/qrcode/src/QRCode'
import { renderQRCode } from '../components/qrcode/src/renderer'
import { clearQRCodeGIFCache } from '../components/qrcode/src/utils'
import { deferred, flushPromises, waitFor } from './helpers'

vi.mock('../components/qrcode/src/renderer', () => ({
  renderQRCode: vi.fn(),
}))

const mockedRenderQRCode = vi.mocked(renderQRCode)

describe('QRCode component', () => {
  beforeEach(() => {
    clearQRCodeGIFCache()
    mockedRenderQRCode.mockReset()
  })

  it('renders on mount and calls onSuccess with the generated URL', async () => {
    const onSuccess = vi.fn<(value: unknown) => void>()
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,mounted')

    const wrapper = mount(QRCode, {
      props: {
        text: 'hello',
        onSuccess,
      },
    })

    await waitFor(() =>
      expect(wrapper.find('img').attributes('src')).toBe(
        'data:image/png;base64,mounted',
      ),
    )

    expect(onSuccess).toHaveBeenCalledWith('data:image/png;base64,mounted')
    expect(mockedRenderQRCode).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'hello' }),
    )
  })

  it('does not re-render text changes when watchText is false', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,stable')
    const wrapper = mount(QRCode, {
      props: {
        text: 'first',
        watchText: false,
      },
    })

    await waitFor(() => expect(mockedRenderQRCode).toHaveBeenCalledTimes(1))
    await wrapper.setProps({ text: 'second' })
    await nextTick()
    await flushPromises()

    expect(mockedRenderQRCode).toHaveBeenCalledTimes(1)
  })

  it('commits only the latest render after rapid prop changes', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const onSuccess = vi.fn<(value: unknown) => void>()
    mockedRenderQRCode
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const wrapper = mount(QRCode, {
      props: {
        text: 'first',
        onSuccess,
      },
    })

    await waitFor(() => expect(mockedRenderQRCode).toHaveBeenCalledTimes(1))
    await wrapper.setProps({ text: 'second' })

    first.resolve('data:image/png;base64,old')
    await waitFor(() => expect(mockedRenderQRCode).toHaveBeenCalledTimes(2))

    expect(mockedRenderQRCode).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: 'second' }),
    )

    second.resolve('data:image/png;base64,new')
    await waitFor(() =>
      expect(wrapper.find('img').attributes('src')).toBe(
        'data:image/png;base64,new',
      ),
    )

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith('data:image/png;base64,new')
  })

  it('routes GIF URL load failures through onError', async () => {
    const onError = vi.fn<(error: unknown) => void>()
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(url: string) => Promise<Response>>()
        .mockRejectedValue(new Error('network down')),
    )

    mount(QRCode, {
      props: {
        text: 'gif',
        gifBackgroundURL: '/missing.gif',
        onError,
      },
    })

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1))
    expect(mockedRenderQRCode).not.toHaveBeenCalled()
  })

  it('exposes async downloadQRCode', async () => {
    mockedRenderQRCode.mockResolvedValue('data:image/png;base64,download')
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    const wrapper = mount(QRCode, {
      props: {
        text: 'download',
      },
    })

    await waitFor(() =>
      expect(wrapper.find('img').attributes('src')).toBe(
        'data:image/png;base64,download',
      ),
    )

    await wrapper.vm.downloadQRCode('code.png')

    expect(click).toHaveBeenCalledTimes(1)
  })
})
