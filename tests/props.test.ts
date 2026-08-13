import { describe, expect, it } from 'vitest'
import props from '../components/qrcode/src/props'

const validator = (prop: keyof typeof props) => {
  const maybeValidator = props[prop].validator

  if (!maybeValidator) {
    throw new Error(`${String(prop)} has no validator`)
  }

  return maybeValidator
}

describe('qrcode props validators', () => {
  it('does not apply dotScale unless the user supplies it', () => {
    expect(props.dotScale.default).toBeUndefined()
  })

  it('validates maskPattern as integer 0..7', () => {
    const validate = validator('maskPattern')

    expect(validate(0)).toBe(true)
    expect(validate(7)).toBe(true)
    expect(validate(-1)).toBe(false)
    expect(validate(8)).toBe(false)
    expect(validate(1.5)).toBe(false)
  })

  it('validates version as integer 1..40', () => {
    const validate = validator('version')

    expect(validate(1)).toBe(true)
    expect(validate(40)).toBe(true)
    expect(validate(0)).toBe(false)
    expect(validate(41)).toBe(false)
    expect(validate(2.5)).toBe(false)
  })

  it('validates dotScale as number in (0, 1]', () => {
    const validate = validator('dotScale')

    expect(validate(0.1)).toBe(true)
    expect(validate(1)).toBe(true)
    expect(validate(0)).toBe(false)
    expect(validate(1.1)).toBe(false)
    expect(validate('1')).toBe(false)
  })

  it('keeps correctLevel limited to known levels', () => {
    const validate = validator('correctLevel')

    expect(validate(0)).toBe(true)
    expect(validate(3)).toBe(true)
    expect(validate(4)).toBe(false)
  })
})
