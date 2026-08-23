import { useEffect, useState, type FormEvent } from 'react'
import type { Category, ExpenseInput, Vendor } from '../types'

interface ExpenseFormProps {
  categories: Category[]
  vendors: Vendor[]
  disabled: boolean
  initial?: ExpenseInput
  onSubmit: (input: ExpenseInput) => Promise<void>
  onCancel?: () => void
}

const emptyInput: ExpenseInput = {
  date: new Date().toISOString().slice(0, 10),
  category_id: 0,
  vendor_id: null,
  content: '',
  amount: 0,
  memo: '',
}

export function ExpenseForm({ categories, vendors, disabled, initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [input, setInput] = useState<ExpenseInput>(initial ?? emptyInput)

  useEffect(() => {
    setInput(initial ?? emptyInput)
  }, [initial])

  const vendorOptions = vendors.filter((vendor) => vendor.category_id === input.category_id)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(input)
    if (!initial) {
      setInput(emptyInput)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expense-date">日付</label>
          <input
            id="expense-date"
            type="date"
            required
            disabled={disabled}
            value={input.date}
            onChange={(event) => setInput({ ...input, date: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="expense-category">費目</label>
          <select
            id="expense-category"
            required
            disabled={disabled}
            value={input.category_id || ''}
            onChange={(event) =>
              setInput({ ...input, category_id: Number(event.target.value), vendor_id: null })
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
          <label htmlFor="expense-vendor">購入先</label>
          <select
            id="expense-vendor"
            disabled={disabled}
            value={input.vendor_id ?? ''}
            onChange={(event) =>
              setInput({ ...input, vendor_id: event.target.value ? Number(event.target.value) : null })
            }
          >
            <option value="">なし</option>
            {vendorOptions.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="expense-content">内容</label>
          <input
            id="expense-content"
            type="text"
            required
            disabled={disabled}
            value={input.content}
            onChange={(event) => setInput({ ...input, content: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="expense-amount">金額（税込み）</label>
          <input
            id="expense-amount"
            type="number"
            min={1}
            required
            disabled={disabled}
            value={input.amount || ''}
            onChange={(event) => setInput({ ...input, amount: Number(event.target.value) })}
          />
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="expense-memo">メモ</label>
          <input
            id="expense-memo"
            type="text"
            disabled={disabled}
            value={input.memo}
            onChange={(event) => setInput({ ...input, memo: event.target.value })}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={disabled}>
          {initial ? '更新する' : '追加する'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
