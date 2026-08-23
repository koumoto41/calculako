import { apiClient } from './client'
import type { Expense, ExpenseInput } from '../types'

export async function listExpenses(year: number, month: number): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>('/expenses', { params: { year, month } })
  return data
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const { data } = await apiClient.post<Expense>('/expenses', input)
  return data
}

export async function updateExpense(id: number, input: ExpenseInput): Promise<Expense> {
  const { data } = await apiClient.put<Expense>(`/expenses/${id}`, input)
  return data
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`)
}
