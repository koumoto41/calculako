import { parseAmazonCsv } from './amazonCsv'

// Amazon's export has no header row with column names - just a leading
// cardholder-info line (name, masked card number, card type), then
// unquoted data rows.
const sampleCsv = `山田 太郎 様,5302-32**-****-****,ゴールドマスター
2026/07/11,AMAZON.CO.JP,5159,,,,
2026/07/12,APPLE.COM/BILL,700,,,,
`

test('parses date, content, and amount from an Amazon CSV export', () => {
  const rows = parseAmazonCsv(sampleCsv)

  expect(rows).toHaveLength(2)
  expect(rows[0]).toMatchObject({ date: '2026-07-11', content: 'AMAZON.CO.JP', amount: 5159, memo: '' })
  expect(rows[1]).toMatchObject({ date: '2026-07-12', content: 'APPLE.COM/BILL', amount: 700, memo: '' })
})

test('excludes the leading cardholder-info line since its first column is not a date', () => {
  const rows = parseAmazonCsv(sampleCsv)

  expect(rows.every((row) => row.content !== 'ゴールドマスター')).toBe(true)
})

test('reads the memo from the 7th column when present', () => {
  const csv = `名前 様,1234-****-****-****,カード
2026/07/11,AMAZON.CO.JP,5159,,,,返品分
`

  const rows = parseAmazonCsv(csv)

  expect(rows[0].memo).toBe('返品分')
})

test('skips rows with an unparseable amount', () => {
  const csv = `名前 様,1234-****-****-****,カード
2026/07/11,AMAZON.CO.JP,N/A,,,,
`

  const rows = parseAmazonCsv(csv)

  expect(rows).toHaveLength(0)
})
