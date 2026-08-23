// A single row parsed out of any supported card statement CSV, already
// normalized to the shape the import UI and the expense API need.
export interface CsvImportRow {
  id: string
  date: string
  content: string
  memo: string
  amount: number
  // The statement's actual payment date - e.g. a July purchase is billed
  // (and should be budgeted) in August, not July. Not every export includes
  // this column, so it can be null.
  settlementDate: string | null
}

export function parseCsvLine(line: string): string[] {
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
export function normalizeDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function splitCsvLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/).filter((line) => line.trim() !== '')
}

// Card statement CSV exports from Japanese services aren't consistently one
// encoding or the other in practice, so detect it from the bytes: decode as
// UTF-8 first with `fatal: true` (Shift_JIS bytes for Japanese text are
// essentially never also valid UTF-8, so this throws for a Shift_JIS file)
// and fall back to Shift_JIS only if that fails.
export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('shift_jis').decode(buffer)
  }
}
