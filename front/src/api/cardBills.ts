import { apiClient } from './client'
import type { CardBill } from '../types'

export async function listCardBills(year: number, month: number): Promise<CardBill[]> {
  const { data } = await apiClient.get<CardBill[]>('/card-bills', { params: { year, month } })
  return data
}

export async function saveCardBills(
  year: number,
  month: number,
  bills: { card_id: number; amount: number }[],
): Promise<void> {
  await apiClient.put('/card-bills', { year, month, bills })
}
