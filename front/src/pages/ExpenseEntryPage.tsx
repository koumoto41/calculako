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

  const reload = useCallback(async () => {
    const [expenseList, billList, summaryData] = await Promise.all([
      listExpenses(year, month),
      listCardBills(year, month),
      getMonthSummary(year, month),
    ])
    setExpenses(expenseList)
    setCardBills(billList)
    setSummary(summaryData)
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
      await updateExpense(editingExpense.id, input)
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
          initial={editingExpense ? { ...editingExpense, memo: editingExpense.memo ?? '' } : undefined}
          onSubmit={handleCreateOrUpdate}
          onCancel={editingExpense ? () => setEditingExpense(null) : undefined}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>経費一覧</h2>
        </div>
        <ExpenseTable
          expenses={expenses}
          categories={categories}
          vendors={vendors}
          disabled={isClosed}
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
