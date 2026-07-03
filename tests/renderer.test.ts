import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderQRCode } from '../components/qrcode/src/renderer'
import { renderQRCodeOnMainThread } from '../components/qrcode/src/renderer-main'
import { renderQRCodeInWorker } from '../components/qrcode/src/renderer-worker'
import { arrayBuffer } from './helpers'

vi.mock('../components/qrcode/src/renderer-main', () => ({
  renderQRCodeOnMainThread: vi.fn(),
}))

vi.mock('../components/qrcode/src/renderer-worker', () => ({
  renderQRCodeInWorker: vi.fn(),
}))

const mockedMain = vi.mocked(renderQRCodeOnMainThread)
const mockedWorker = vi.mocked(renderQRCodeInWorker)

describe('renderer', () => {
  beforeEach(() => {
    mockedMain.mockReset()
    mockedWorker.mockReset()
  })

  it('uses the main-thread renderer in packaged configuration', async () => {
    mockedMain.mockResolvedValue('main')
    mockedWorker.mockResolvedValue('worker')

    await expect(
      renderQRCode({ text: 'gif', gifBackground: arrayBuffer(1) }),
    ).resolves.toBe('main')

    expect(mockedMain).toHaveBeenCalledWith({
      text: 'gif',
      gifBackground: expect.any(ArrayBuffer),
    })
    expect(mockedWorker).not.toHaveBeenCalled()
  })
})
