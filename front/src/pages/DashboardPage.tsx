import { useEffect, useState, useCallback } from 'react'
import { MonthSelector } from '../components/MonthSelector'
import { CategoryBreakdownTable } from '../components/CategoryBreakdownTable'
import { useSelectedMonth } from '../hooks/useSelectedMonth'
import { closeMonth, getMonthSummary, reopenMonth } from '../api/months'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { MonthSummary } from '../types'

export function DashboardPage() {
  useDocumentTitle('ダッシュボード')
  const selectedMonth = useSelectedMonth()
  const { year, month } = selectedMonth
  const [summary, setSummary] = useState<MonthSummary | null>(null)
  const [isUpdatingLock, setIsUpdatingLock] = useState(false)

  const loadSummary = useCallback(() => {
    getMonthSummary(year, month).then(setSummary)
  }, [year, month])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  async function handleClose() {
    if (!window.confirm(`${year}年${month}月を確定します。確定後は編集できなくなります。よろしいですか？`)) {
      return
    }
    setIsUpdatingLock(true)
    try {
      await closeMonth(year, month)
      await loadSummary()
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
      await loadSummary()
    } finally {
      setIsUpdatingLock(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>ダッシュボード</h1>
        <MonthSelector {...selectedMonth} />
      </div>

      {summary && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">状態</div>
              <span className={`badge ${summary.is_closed ? 'badge-closed' : 'badge-open'}`}>
                {summary.is_closed ? '確定済み' : '未確定'}
              </span>
            </div>
            <div className="stat-card">
              <div className="stat-label">月合計</div>
              <div className="stat-value">{summary.expense_total.toLocaleString()}円</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">カード請求合計</div>
              <div className="stat-value">{summary.card_bill_total.toLocaleString()}円</div>
            </div>
          </div>

          <div>
            {summary.is_closed ? (
              <button type="button" className="btn btn-secondary" onClick={handleReopen} disabled={isUpdatingLock}>
                この月の確定を解除する
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleClose} disabled={isUpdatingLock}>
                この月を確定する
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2>費目別集計</h2>
            </div>
            <CategoryBreakdownTable breakdown={summary.category_breakdown} />
          </div>
        </>
      )}
    </div>
  )
}
