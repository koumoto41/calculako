import type { SelectedMonth } from '../hooks/useSelectedMonth'

export function MonthSelector({ year, month, setMonth }: SelectedMonth) {
  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(year - 1, 12)
    } else {
      setMonth(year, month - 1)
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(year + 1, 1)
    } else {
      setMonth(year, month + 1)
    }
  }

  return (
    <div className="month-nav">
      <button type="button" className="btn-icon" aria-label="前の月" onClick={goToPreviousMonth}>
        ‹
      </button>
      <span className="month-nav-label">
        {year}年{month}月
      </span>
      <button type="button" className="btn-icon" aria-label="次の月" onClick={goToNextMonth}>
        ›
      </button>
    </div>
  )
}
