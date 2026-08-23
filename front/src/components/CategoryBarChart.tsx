import type { CategoryBreakdown } from '../types'

interface CategoryBarChartProps {
  breakdown: CategoryBreakdown[]
}

export function CategoryBarChart({ breakdown }: CategoryBarChartProps) {
  const rows = breakdown.filter((row) => row.total > 0).sort((a, b) => b.total - a.total)

  if (rows.length === 0) {
    return <p className="empty-state">この月の経費はまだ登録されていません。</p>
  }

  const max = Math.max(...rows.map((row) => row.total))

  return (
    <div className="bar-chart" role="img" aria-label="費目別の内訳を金額の多い順に表示した棒グラフ">
      {rows.map((row) => (
        <div className="bar-chart-row" key={row.category_id}>
          <span className="bar-chart-label">{row.category_name}</span>
          <div className="bar-chart-track">
            <div className="bar-chart-fill" style={{ width: `${(row.total / max) * 100}%` }} />
          </div>
          <span className="bar-chart-value">{row.total.toLocaleString()}円</span>
        </div>
      ))}
    </div>
  )
}
