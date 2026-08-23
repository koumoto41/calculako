import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseTable } from './ExpenseTable'
import type { Category, Expense, Vendor } from '../types'

const categories: Category[] = [{ id: 1, name: 'スーパー', sort_order: 0 }]
const vendors: Vendor[] = [{ id: 1, category_id: 1, name: 'イオン' }]
const expenses: Expense[] = [
  {
    id: 1,
    date: '2026-08-01',
    settlement_year: 2026,
    settlement_month: 8,
    category_id: 1,
    vendor_id: 1,
    content: 'ランチ代',
    amount: 1500,
    memo: null,
  },
  {
    id: 2,
    date: '2026-08-02',
    settlement_year: 2026,
    settlement_month: 8,
    category_id: 1,
    vendor_id: 1,
    content: '飲み物',
    amount: 300,
    memo: null,
  },
]

test('renders expense rows with category and vendor names', () => {
  render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      checkedIds={new Set()}
      onToggleChecked={() => {}}
      onToggleCheckAll={() => {}}
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

test('hides edit/delete controls and checkboxes when the month is closed', () => {
  render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={true}
      checkedIds={new Set()}
      onToggleChecked={() => {}}
      onToggleCheckAll={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
})

test('checking a row calls onToggleChecked with its id', async () => {
  const user = userEvent.setup()
  const onToggleChecked = jest.fn()
  render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      checkedIds={new Set()}
      onToggleChecked={onToggleChecked}
      onToggleCheckAll={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  await user.click(screen.getByLabelText('2026-08-01 ランチ代を選択'))

  expect(onToggleChecked).toHaveBeenCalledWith(1)
})

test('shows the settlement month only when it differs from the date', () => {
  const mixedExpenses: Expense[] = [
    ...expenses,
    {
      id: 3,
      date: '2026-07-04',
      settlement_year: 2026,
      settlement_month: 8,
      category_id: 1,
      vendor_id: null,
      content: 'サンエー',
      amount: 4417,
      memo: null,
    },
  ]

  render(
    <ExpenseTable
      expenses={mixedExpenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      checkedIds={new Set()}
      onToggleChecked={() => {}}
      onToggleCheckAll={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.getByText('精算: 2026年8月')).toBeInTheDocument()
})

test('the select-all checkbox is checked only when every row is checked', () => {
  const { rerender } = render(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      checkedIds={new Set([1])}
      onToggleChecked={() => {}}
      onToggleCheckAll={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.getByLabelText('すべて選択')).not.toBeChecked()

  rerender(
    <ExpenseTable
      expenses={expenses}
      categories={categories}
      vendors={vendors}
      disabled={false}
      checkedIds={new Set([1, 2])}
      onToggleChecked={() => {}}
      onToggleCheckAll={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />,
  )

  expect(screen.getByLabelText('すべて選択')).toBeChecked()
})
