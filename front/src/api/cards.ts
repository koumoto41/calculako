import { apiClient } from './client'
import type { Card } from '../types'

export async function listCards(): Promise<Card[]> {
  const { data } = await apiClient.get<Card[]>('/cards')
  return data
}

export async function createCard(name: string): Promise<Card> {
  const { data } = await apiClient.post<Card>('/cards', { name })
  return data
}

export async function updateCard(id: number, name: string): Promise<Card> {
  const { data } = await apiClient.put<Card>(`/cards/${id}`, { name })
  return data
}

export async function deleteCard(id: number): Promise<void> {
  await apiClient.delete(`/cards/${id}`)
}
