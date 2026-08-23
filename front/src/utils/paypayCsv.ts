export interface PayPayCsvRow {
  id: string
  date: string
  storeName: string
  amount: number
  // The statement's actual payment date - e.g. a July purchase is billed
  // (and should be budgeted) in August, not July. Not every export includes
  // this column, so it can be null.
  settlementDate: string | null
}

// PayPay card statement CSV: "利用日/キャンセル日","利用店名・商品名","利用者","決済方法",
// "支払区分","利用金額","手数料","支払総額","当月支払金額","翌月以降繰越金額","調整額","当月お支払日"
const DATE_COLUMN = 0
const STORE_NAME_COLUMN = 1
const AMOUNT_COLUMN = 5
const SETTLEMENT_DATE_COLUMN = 11

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current)
  return fields
}

// "2026/7/4" -> "2026-07-04"
function normalizeDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function parsePayPayCsv(text: string): PayPayCsvRow[] {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.trim() !== '')
  const rows: PayPayCsvRow[] = []

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

    rows.push({ id: `${lineIndex}-${date}-${amount}`, date, storeName, amount, settlementDate })
  }

  return rows
}

// PayPay's CSV export encoding isn't consistently one or the other in
// practice, so detect it from the bytes: decode as UTF-8 first with
// `fatal: true` (Shift_JIS bytes for Japanese text are essentially never
// also valid UTF-8, so this throws for a Shift_JIS file) and fall back to
// Shift_JIS only if that fails.
export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('shift_jis').decode(buffer)
  }
}
