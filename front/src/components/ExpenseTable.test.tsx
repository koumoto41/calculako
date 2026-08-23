import { render, screen } from '@testing-library/react'
import { ExpenseTable } from './ExpenseTable'
import type { Category, Expense, Vendor } from '../types'

const categories: Category[] = [{ id: 1, name: 'スーパー', sort_order: 0 }]
const vendors: Vendor[] = [{ id: 1, category_id: 1, name: 'イオン' }]
const expenses: Expense[] = [
  { id: 1, date: '2026-08-01', category_id: 1, vendor_id: 1, content: 'ランチ代', amount: 1500, memo: null },
  { id: 2, date: '2026-08-02', category_id: 1, vendor_id: 1, content: '飲み物', amount: 300, memo: null },
]

test('renders expense rows with category and vendor names', () => {
  render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.getAllByText('スーパー')).toHaveLength(2)
  expect(screen.getAllByText('イオン')).toHaveLength(2)
  expect(screen.getByText('1,500円')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '編集' })).toHaveLength(2)
  expect(screen.getByText('合計')).toBeInTheDocument()
  expect(screen.getByText('1,800円')).toBeInTheDocument()
})

test('hides edit/delete controls when the month is closed', () => {
  render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={true}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
})
