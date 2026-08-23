import { useCallback, useEffect, useState } from 'react'
import { MonthSelector } from '../components/MonthSelector'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseTable } from '../components/ExpenseTable'
import { CardBillForm } from '../components/CardBillForm'
import { BalanceSummary } from '../components/BalanceSummary'
import { useSelectedMonth } from '../hooks/useSelectedMonth'
import { listCategories } from '../api/categories'
import { listVendors } from '../api/vendors'
import { listCards } from '../api/cards'
import { listCardBills, saveCardBills } from '../api/cardBills'
import { createExpense, deleteExpense, listExpenses, updateExpense } from '../api/expenses'
import { closeMonth, getMonthSummary, reopenMonth } from '../api/months'
import { errorMessage } from '../utils/apiError'
import type { Card, CardBill, Category, Expense, ExpenseInput, MonthSummary, Vendor } from '../types'

export function ExpenseEntryPage() {
  const selectedMonth = useSelectedMonth()
  const { year, month } = selectedMonth

  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [summary, setSummary] = useState<MonthSummary | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isUpdatingLock, setIsUpdatingLock] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const [expenseList, billList, summaryData] = await Promise.all([
      listExpenses(year, month),
      listCardBills(year, month),
      getMonthSummary(year, month),
    ])
    setExpenses(expenseList)
    setCardBills(billList)
    setSummary(summaryData)
    setCheckedIds(new Set())
  }, [year, month])

  useEffect(() => {
    listCategories().then(setCategories)
    listVendors().then(setVendors)
    listCards().then(setCards)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const isClosed = summary?.is_closed ?? false

  async function handleCreateOrUpdate(input: ExpenseInput) {
    if (editingExpense) {
      // This form has no settlement-month UI. Preserve the expense's
      // existing settlement month unless its date was actually edited here,
      // in which case let the backend re-derive settlement from the new
      // date (rather than silently keeping it pinned to the old month).
      const dateUnchanged = input.date === editingExpense.date
      await updateExpense(editingExpense.id, {
        ...input,
        settlement_year: dateUnchanged ? editingExpense.settlement_year : undefined,
        settlement_month: dateUnchanged ? editingExpense.settlement_month : undefined,
      })
      setEditingExpense(null)
    } else {
      await createExpense(input)
    }
    await reload()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('この経費を削除しますか？')) return
    await deleteExpense(id)
    await reload()
  }

  function toggleChecked(id: number) {
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
      const allChecked = expenses.every((expense) => prev.has(expense.id))
      const next = new Set(prev)
      for (const expense of expenses) {
        if (allChecked) {
          next.delete(expense.id)
        } else {
          next.add(expense.id)
        }
      }
      return next
    })
  }

  async function handleBulkDelete() {
    if (!window.confirm(`選択した${checkedIds.size}件の経費を削除しますか？`)) return
    setBulkDeleteError(null)
    setIsBulkDeleting(true)

    const failures: string[] = []
    for (const id of checkedIds) {
      try {
        await deleteExpense(id)
      } catch (err) {
        failures.push(errorMessage(err, `ID ${id} の削除に失敗しました。`))
      }
    }

    // Always reload so the list reflects whatever actually happened
    // server-side, even if some deletions in the batch failed.
    await reload()
    setIsBulkDeleting(false)
    if (failures.length > 0) {
      setBulkDeleteError(failures.join(' / '))
    }
  }

  async function handleSaveCardBills(bills: { card_id: number; amount: number }[]) {
    await saveCardBills(year, month, bills)
    await reload()
  }

  async function handleClose() {
    if (!window.confirm(`${year}年${month}月を確定します。確定後は編集できなくなります。よろしいですか？`)) {
      return
    }
    setIsUpdatingLock(true)
    try {
      await closeMonth(year, month)
      await reload()
    } finally {
      setIsUpdatingLock(false)
    }
  }

  async function handleReopen() {
    if (!window.confirm(`${year}年${month}月の確定を解除します。再び編集できるようになります。よろしいですか？`)) {
      return
    }
    setIsUpdatingLock(true)
    try {
      await reopenMonth(year, month)
      await reload()
    } finally {
      setIsUpdatingLock(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>経費入力</h1>
        <MonthSelector {...selectedMonth} />
      </div>

      {summary && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${isClosed ? 'badge-closed' : 'badge-open'}`}>
            {isClosed ? '確定済み' : '未確定'}
          </span>
          {isClosed ? (
            <button type="button" className="btn btn-secondary" onClick={handleReopen} disabled={isUpdatingLock}>
              この月の確定を解除する
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleClose} disabled={isUpdatingLock}>
              この月を確定する
            </button>
          )}
        </div>
      )}

      {isClosed && (
        <p className="status-message" role="status">
          この月は確定済みのため編集できません。
        </p>
      )}

      <div className="card">
        <div className="card-header">
          <h2>{editingExpense ? '経費を編集' : '経費を追加'}</h2>
        </div>
        <ExpenseForm
          categories={categories}
          vendors={vendors}
          disabled={isClosed}
          initial={
            editingExpense
              ? {
                  date: editingExpense.date,
                  category_id: editingExpense.category_id,
                  vendor_id: editingExpense.vendor_id,
                  content: editingExpense.content,
                  amount: editingExpense.amount,
                  memo: editingExpense.memo ?? '',
                  // settlement_year/settlement_month are intentionally left
                  // out: editing through this plain form has no UI for them,
                  // so the backend re-derives settlement from the (possibly
                  // edited) date, same as any other non-import expense edit.
                }
              : undefined
          }
          onSubmit={handleCreateOrUpdate}
          onCancel={editingExpense ? () => setEditingExpense(null) : undefined}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>経費一覧</h2>
          {!isClosed && checkedIds.size > 0 && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
              選択した{checkedIds.size}件を削除
            </button>
          )}
        </div>
        {bulkDeleteError && (
          <p className="alert" role="alert">
            {bulkDeleteError}
          </p>
        )}
        <ExpenseTable
          expenses={expenses}
          categories={categories}
          vendors={vendors}
          disabled={isClosed}
          checkedIds={checkedIds}
          onToggleChecked={toggleChecked}
          onToggleCheckAll={toggleCheckAll}
          onEdit={setEditingExpense}
          onDelete={handleDelete}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>各カードの請求金額</h2>
        </div>
        <CardBillForm cards={cards} bills={cardBills} disabled={isClosed} onSave={handleSaveCardBills} />
      </div>

      {summary && (
        <BalanceSummary
          allowance={summary.allowance}
          expenseTotal={summary.expense_total}
          cardBillTotal={summary.card_bill_total}
        />
      )}
    </div>
  )
}
