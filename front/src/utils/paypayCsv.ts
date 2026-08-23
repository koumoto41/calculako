import { type CsvImportRow, normalizeDate, parseCsvLine, splitCsvLines } from './csv'

// PayPay card statement CSV: "利用日/キャンセル日","利用店名・商品名","利用者","決済方法",
// "支払区分","利用金額","手数料","支払総額","当月支払金額","翌月以降繰越金額","調整額","当月お支払日"
const DATE_COLUMN = 0
const STORE_NAME_COLUMN = 1
const AMOUNT_COLUMN = 5
const SETTLEMENT_DATE_COLUMN = 11

export function parsePayPayCsv(text: string): CsvImportRow[] {
  const lines = splitCsvLines(text)
  const rows: CsvImportRow[] = []

  // First line is the header.
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const fields = parseCsvLine(lines[lineIndex])
    const date = normalizeDate(fields[DATE_COLUMN] ?? '')
    const storeName = (fields[STORE_NAME_COLUMN] ?? '').trim()
    const amount = Number((fields[AMOUNT_COLUMN] ?? '').replace(/,/g, ''))
    const settlementDate = normalizeDate(fields[SETTLEMENT_DATE_COLUMN] ?? '')

    if (!date || storeName === '' || !Number.isFinite(amount)) {
      continue
    }

    // PayPay's export has no separate "content" column, so it starts blank
    // (the user fills it in during review) - the store name becomes memo.
    rows.push({ id: `${lineIndex}-${date}-${amount}`, date, content: '', memo: storeName, amount, settlementDate })
  }

  return rows
}
