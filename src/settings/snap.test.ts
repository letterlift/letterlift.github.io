import { describe, expect, it } from 'vitest'
import { snapToStep } from './snap'

describe('snapToStep', () => {
  it('removes floating point noise', () => {
    expect(snapToStep(0.1 + 0.2, 0.2, 0.7, 0.05)).toBe(0.3)
    expect(snapToStep(1.4 + 0.30000000000000004, 1.4, 2.2, 0.1)).toBe(1.7)
  })
  it('snaps to the nearest step and clamps to the range', () => {
    expect(snapToStep(20.4, 16, 32, 1)).toBe(20)
    expect(snapToStep(99, 40, 90, 2)).toBe(90)
    expect(snapToStep(-1, 0, 0.12, 0.01)).toBe(0)
  })
})
