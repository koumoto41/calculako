import { type CsvImportRow, normalizeDate, parseCsvLine, splitCsvLines } from './csv'

// Amazon card statement CSV has no fixed header row - it starts with a
// cardholder/card-number info line, then plain (unquoted) data rows:
// <date>,<item description>,<amount>,,,,<memo>
const DATE_COLUMN = 0
const CONTENT_COLUMN = 1
const AMOUNT_COLUMN = 2
const MEMO_COLUMN = 6

export function parseAmazonCsv(text: string): CsvImportRow[] {
  const lines = splitCsvLines(text)
  const rows: CsvImportRow[] = []

  // Only rows whose first column is an actual date count as data - this is
  // what naturally excludes the leading cardholder/card-number info line
  // (its first column isn't a date), so there's no separate header to skip.
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const fields = parseCsvLine(lines[lineIndex])
    const date = normalizeDate(fields[DATE_COLUMN] ?? '')

    if (!date) {
      continue
    }

    const content = (fields[CONTENT_COLUMN] ?? '').trim()
    const amount = Number((fields[AMOUNT_COLUMN] ?? '').replace(/,/g, ''))
    const memo = (fields[MEMO_COLUMN] ?? '').trim()

    if (!Number.isFinite(amount)) {
      continue
    }

    rows.push({ id: `${lineIndex}-${date}-${amount}`, date, content, memo, amount, settlementDate: null })
  }

  return rows
}
