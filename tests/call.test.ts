import { describe, expect, it, vi } from 'vitest'
import { call } from '../components/qrcode/src/call'

describe('call', () => {
  it('calls one function with all arguments', () => {
    const fn = vi.fn<(value: string, count: number) => void>()

    call(fn, 'value', 2)

    expect(fn).toHaveBeenCalledWith('value', 2)
  })

  it('calls an array of functions and ignores empty input', () => {
    const first = vi.fn<(value: string) => void>()
    const second = vi.fn<(value: string) => void>()

    call([first, second], 'value')
    call(undefined)

    expect(first).toHaveBeenCalledWith('value')
    expect(second).toHaveBeenCalledWith('value')
  })
})
