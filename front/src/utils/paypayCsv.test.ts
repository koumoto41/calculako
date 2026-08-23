import { parsePayPayCsv } from './paypayCsv'

const sampleCsv = `"利用日/キャンセル日","利用店名・商品名","利用者","決済方法","支払区分","利用金額","手数料","支払総額","当月支払金額","翌月以降繰越金額","調整額","当月お支払日"
"2026/7/4","サンエー","本人*","PayPayクレジット","1回","4417","0","4417","4417","0","0","2026/8/27"
"2026/7/4","ローソン","本人*","PayPayクレジット","1回","1806","0","1806","1806","0","0","2026/8/27"
`

test('parses date, store name, and amount from a PayPay CSV export', () => {
  const rows = parsePayPayCsv(sampleCsv)

  expect(rows).toHaveLength(2)
  expect(rows[0]).toMatchObject({ date: '2026-07-04', memo: 'サンエー', content: '', amount: 4417, settlementDate: '2026-08-27' })
  expect(rows[1]).toMatchObject({ date: '2026-07-04', memo: 'ローソン', content: '', amount: 1806, settlementDate: '2026-08-27' })
})

test('skips blank lines and rows with an unparseable date', () => {
  const csv = `"利用日/キャンセル日","利用店名・商品名","利用者","決済方法","支払区分","利用金額","手数料","支払総額","当月支払金額","翌月以降繰越金額","調整額","当月お支払日"

"invalid-date","サンエー","本人*","PayPayクレジット","1回","4417","0","4417","4417","0","0","2026/8/27"
"2026/12/1","ローソン","本人*","PayPayクレジット","1回","500","0","500","500","0","0","2027/1/27"
`

  const rows = parsePayPayCsv(csv)

  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ date: '2026-12-01', memo: 'ローソン', amount: 500 })
})

test('settlementDate is null when the CSV has no 当月お支払日 column', () => {
  const csv = `"利用日/キャンセル日","利用店名・商品名","利用金額"
"2026/7/4","サンエー","4417"
`

  const rows = parsePayPayCsv(csv)

  expect(rows).toHaveLength(1)
  expect(rows[0].settlementDate).toBeNull()
})

test('assigns a stable, unique id per row', () => {
  const rows = parsePayPayCsv(sampleCsv)

  expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
})
