import { describe, expect, it, vi } from 'vitest'
import { useQRCodeRenderQueue } from '../components/qrcode/src/useQRCodeRenderQueue'
import { deferred, waitFor } from './helpers'

describe('useQRCodeRenderQueue', () => {
  it('keeps only the latest render result', async () => {
    const queue = useQRCodeRenderQueue<string>()
    const first = deferred<string>()
    const second = deferred<string>()
    const task = vi
      .fn<() => Promise<string>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const onSuccess = vi.fn<(result: string) => void>()

    const firstRun = queue.runLatest(task, { onSuccess })
    const queuedRun = queue.runLatest(task, { onSuccess })

    await expect(queuedRun).resolves.toBeUndefined()
    first.resolve('old')
    await firstRun

    await waitFor(() => expect(task).toHaveBeenCalledTimes(2))

    second.resolve('new')
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('new'))
    expect(onSuccess).not.toHaveBeenCalledWith('old')
  })

  it('routes the latest render error to the error handler', async () => {
    const queue = useQRCodeRenderQueue<string>()
    const error = new Error('broken')
    const onError = vi.fn<(error: unknown) => void>()

    await queue.runLatest(() => Promise.reject(error), { onError })

    expect(onError).toHaveBeenCalledWith(error)
  })

  it('rejects concurrent exclusive renders without cancelling the active one', async () => {
    const queue = useQRCodeRenderQueue<string>()
    const pending = deferred<string>()
    const first = queue.runExclusive(() => pending.promise)

    await expect(
      queue.runExclusive(() => Promise.resolve('second')),
    ).rejects.toThrow('already in progress')

    pending.resolve('first')

    await expect(first).resolves.toBe('first')
  })

  it('does not commit after dispose', async () => {
    const queue = useQRCodeRenderQueue<string>()
    const pending = deferred<string>()
    const onSuccess = vi.fn<(result: string) => void>()
    const run = queue.runLatest(() => pending.promise, { onSuccess })

    queue.dispose()
    pending.resolve('late')
    await run

    expect(onSuccess).not.toHaveBeenCalled()
  })
})
