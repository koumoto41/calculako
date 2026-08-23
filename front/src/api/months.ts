import { apiClient } from './client'
import type { MonthSummary } from '../types'

export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
  const { data } = await apiClient.get<MonthSummary>(`/months/${year}/${month}/summary`)
  return data
}

export async function closeMonth(year: number, month: number): Promise<void> {
  await apiClient.post(`/months/${year}/${month}/close`)
}

export async function reopenMonth(year: number, month: number): Promise<void> {
  await apiClient.delete(`/months/${year}/${month}/close`)
}

export interface MonthPoint {
  year: number
  month: number
  expenseTotal: number
}

// The `count` months ending at (year, month), oldest first - for a trend
// chart. There's no bulk endpoint for this; count is kept small (a default
// of 6) since each point is its own request.
export async function getExpenseTrend(year: number, month: number, count = 6): Promise<MonthPoint[]> {
  const targets: { year: number; month: number }[] = []
  let y = year
  let m = month
  for (let i = 0; i < count; i++) {
    targets.unshift({ year: y, month: m })
    m -= 1
    if (m === 0) {
      m = 12
      y -= 1
    }
  }

  const summaries = await Promise.all(targets.map((target) => getMonthSummary(target.year, target.month)))
  return targets.map((target, index) => ({
    year: target.year,
    month: target.month,
    expenseTotal: summaries[index].expense_total,
  }))
}
