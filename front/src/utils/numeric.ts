const FULL_WIDTH_DIGITS = '０１２３４５６７８９'

// "５０００" -> "5000". Needed because native <input type="number"> silently
// rejects full-width digits (typed via an IME left in full-width mode)
// instead of converting them, which makes the field look like it's not
// accepting input at all - even though the value is being typed correctly.
export function toHalfWidthDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) => String(FULL_WIDTH_DIGITS.indexOf(char)))
}

// Normalizes free-typed text (which may mix full-width digits, stray
// characters, etc.) down to a plain non-negative integer for amount fields.
export function parseAmountInput(value: string): number {
  const digitsOnly = toHalfWidthDigits(value).replace(/[^0-9]/g, '')
  return digitsOnly === '' ? 0 : Number(digitsOnly)
}
