import { useEffect, useState, type ChangeEvent } from 'react'
import { MonthSelector } from '../components/MonthSelector'
import { listCategories } from '../api/categories'
import { listVendors } from '../api/vendors'
import { createExpense } from '../api/expenses'
import { errorMessage } from '../utils/apiError'
import { readCsvFile, type CsvImportRow } from '../utils/csv'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Category, Vendor } from '../types'

interface ImportDraft {
  id: string
  date: string
  amount: number
  memo: string
  content: string
  category_id: number
  vendor_id: number | null
}

interface ImportResult {
  successCount: number
  failures: string[]
}

interface ImportPageProps {
  title: string
  // Column header for the select-step table's descriptive column, and the
  // label used to build each checkbox's accessible name.
  descriptionLabel: string
  parseCsv: (text: string) => CsvImportRow[]
}

export function ImportPage({ title, descriptionLabel, parseCsv }: ImportPageProps) {
  useDocumentTitle(title)
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [rows, setRows] = useState<CsvImportRow[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<'select' | 'review'>('select')
  const [drafts, setDrafts] = useState<ImportDraft[]>([])
  const [settlementYear, setSettlementYear] = useState(new Date().getFullYear())
  const [settlementMonth, setSettlementMonth] = useState(new Date().getMonth() + 1)
  const [isImporting, setIsImporting] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    listCategories().then(setCategories)
    listVendors().then(setVendors)
  }, [])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setFileError(null)
    setResult(null)
    try {
      const text = await readCsvFile(file)
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setFileError('CSVから有効なデータを読み込めませんでした。ファイル形式を確認してください。')
        return
      }
      setRows([...parsed].sort((a, b) => a.date.localeCompare(b.date)))
      setCheckedIds(new Set())
      setDrafts([])
      setStep('select')
    } catch {
      setFileError('CSVの読み込みに失敗しました。')
    }
  }

  const allChecked = rows.length > 0 && rows.every((row) => checkedIds.has(row.id))
  const describeRow = (row: CsvImportRow) => row.content || row.memo

  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleCheckAll() {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      for (const row of rows) {
        if (allChecked) {
          next.delete(row.id)
        } else {
          next.add(row.id)
        }
      }
      return next
    })
  }

  function handleConfirmSelection() {
    const selected = rows.filter((row) => checkedIds.has(row.id))
    // The date field always just shows the CSV's own date. The settlement
    // month is a separate, independent concept (defaults to the current
    // working month, not derived from the CSV) and is what actually gets
    // used as the registered expense's year/month at import time.
    setDrafts(
      selected.map((row) => ({
        id: row.id,
        date: row.date,
        amount: row.amount,
        memo: row.memo,
        content: row.content,
        category_id: 0,
        vendor_id: null,
      })),
    )

    setStep('review')
  }

  function updateDraft(id: string, patch: Partial<ImportDraft>) {
    setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)))
  }

  const canImport = drafts.length > 0 && drafts.every((draft) => draft.category_id > 0)

  async function handleImport() {
    setIsImporting(true)
    const failures: string[] = []
    const succeededIds = new Set<string>()

    for (const draft of drafts) {
      try {
        await createExpense({
          // date stays exactly as the CSV shows it. settlement_year/month
          // are registered separately and are what the app's month views,
          // filtering, and locking actually key off - so an expense keeps
          // its true transaction date while still counting toward whichever
          // month it's actually billed/budgeted under.
          date: draft.date,
          settlement_year: settlementYear,
          settlement_month: settlementMonth,
          category_id: draft.category_id,
          vendor_id: draft.vendor_id,
          content: draft.content.trim(),
          amount: draft.amount,
          memo: draft.memo,
        })
        succeededIds.add(draft.id)
      } catch (err) {
        failures.push(`${draft.date} ${draft.memo}: ${errorMessage(err, 'インポートに失敗しました。')}`)
      }
    }

    setIsImporting(false)
    setResult({ successCount: succeededIds.size, failures })

    // Imported rows leave the pool entirely; anything that failed stays in
    // the review form (with its edits intact) so the user can fix and retry.
    setRows((prev) => prev.filter((row) => !succeededIds.has(row.id)))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      succeededIds.forEach((id) => next.delete(id))
      return next
    })
    setDrafts((prev) => prev.filter((draft) => !succeededIds.has(draft.id)))

    if (failures.length === 0) {
      setStep('select')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>{title}</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>CSVファイルを選択</h2>
        </div>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {fileError && (
          <p className="alert" role="alert" style={{ marginTop: 12 }}>
            {fileError}
          </p>
        )}
      </div>

      {result && (
        <p className={result.failures.length > 0 ? 'alert' : 'status-message'} role="status">
          {result.successCount}件をインポートしました。
          {result.failures.length > 0 && (
            <>
              {' '}
              {result.failures.length}件は失敗しました。
              <br />
              {result.failures.join(' / ')}
            </>
          )}
        </p>
      )}

      {rows.length > 0 && step === 'select' && (
        <div className="card">
          <div className="card-header">
            <h2>インポートするデータを選択</h2>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" aria-label="すべて選択" checked={allChecked} onChange={toggleCheckAll} />
                  </th>
                  <th>日付</th>
                  <th>{descriptionLabel}</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`${row.date} ${describeRow(row)}を選択`}
                        checked={checkedIds.has(row.id)}
                        onChange={() => toggleChecked(row.id)}
                      />
                    </td>
                    <td>{row.date}</td>
                    <td>{describeRow(row)}</td>
                    <td>{row.amount.toLocaleString()}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={checkedIds.size === 0}
              onClick={handleConfirmSelection}
            >
              確認する（{checkedIds.size}件選択中）
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="card">
          <div className="card-header">
            <h2>インポート内容を入力</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>精算月</span>
              <MonthSelector
                year={settlementYear}
                month={settlementMonth}
                setMonth={(y, m) => { setSettlementYear(y); setSettlementMonth(m) }}
              />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: -8 }}>
            日付はCSVの日付のままです。登録する年月は精算月が優先されます（日付欄の日にちはそのまま使われます）。
          </p>

          {drafts.map((draft, index) => (
            <div key={draft.id} className={index > 0 ? 'import-row' : undefined}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`import-date-${draft.id}`}>日付</label>
                  <input
                    id={`import-date-${draft.id}`}
                    type="date"
                    required
                    value={draft.date}
                    onChange={(event) => updateDraft(draft.id, { date: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`import-category-${draft.id}`}>費目</label>
                  <select
                    id={`import-category-${draft.id}`}
                    required
                    value={draft.category_id || ''}
                    onChange={(event) =>
                      updateDraft(draft.id, { category_id: Number(event.target.value), vendor_id: null })
                    }
                  >
                    <option value="" disabled>
                      選択してください
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor={`import-vendor-${draft.id}`}>購入先</label>
                  <select
                    id={`import-vendor-${draft.id}`}
                    value={draft.vendor_id ?? ''}
                    onChange={(event) =>
                      updateDraft(draft.id, { vendor_id: event.target.value ? Number(event.target.value) : null })
                    }
                  >
                    <option value="">なし</option>
                    {vendors
                      .filter((vendor) => vendor.category_id === draft.category_id)
                      .map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor={`import-content-${draft.id}`}>内容</label>
                  <input
                    id={`import-content-${draft.id}`}
                    type="text"
                    value={draft.content}
                    onChange={(event) => updateDraft(draft.id, { content: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`import-amount-${draft.id}`}>金額</label>
                  <input
                    id={`import-amount-${draft.id}`}
                    type="number"
                    min={1}
                    required
                    value={draft.amount}
                    onChange={(event) => updateDraft(draft.id, { amount: Number(event.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor={`import-memo-${draft.id}`}>メモ</label>
                  <input
                    id={`import-memo-${draft.id}`}
                    type="text"
                    value={draft.memo}
                    onChange={(event) => updateDraft(draft.id, { memo: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep('select')}>
              選択に戻る
            </button>
            <button type="button" className="btn btn-primary" disabled={!canImport || isImporting} onClick={handleImport}>
              インポート
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
