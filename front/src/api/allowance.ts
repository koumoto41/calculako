import { apiClient } from './client'
import type { Allowance } from '../types'

export async function getAllowance(): Promise<Allowance> {
  const { data } = await apiClient.get<Allowance>('/allowance')
  return data
}

export async function updateAllowance(amount: number): Promise<Allowance> {
  const { data } = await apiClient.put<Allowance>('/allowance', { amount })
  return data
}
