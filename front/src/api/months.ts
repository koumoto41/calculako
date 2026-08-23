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
