import { parseAmountInput, toHalfWidthDigits } from './numeric'

test('converts full-width digits to half-width', () => {
  expect(toHalfWidthDigits('５０００')).toBe('5000')
  expect(toHalfWidthDigits('1２3４')).toBe('1234')
})

test('parseAmountInput handles plain, full-width, and mixed input', () => {
  expect(parseAmountInput('5000')).toBe(5000)
  expect(parseAmountInput('５０００')).toBe(5000)
  expect(parseAmountInput('5,000円')).toBe(5000)
})

test('parseAmountInput treats an empty or non-numeric string as 0', () => {
  expect(parseAmountInput('')).toBe(0)
  expect(parseAmountInput('円')).toBe(0)
})
