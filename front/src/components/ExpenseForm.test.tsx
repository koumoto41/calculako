import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from './ExpenseForm'
import type { Category, Vendor } from '../types'

const categories: Category[] = [
  { id: 1, name: 'スーパー', sort_order: 0 },
  { id: 2, name: 'コンビニ', sort_order: 1 },
]
const vendors: Vendor[] = [
  { id: 1, category_id: 1, name: 'イオン' },
  { id: 2, category_id: 2, name: 'セブンイレブン' },
]

test('vendor options are filtered by the selected category', async () => {
  const user = userEvent.setup()
  render(<ExpenseForm categories={categories} vendors={vendors} disabled={false} onSubmit={async () => {}} />)

  await user.selectOptions(screen.getByLabelText('費目'), '1')
  expect(screen.getByRole('option', { name: 'イオン' })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: 'セブンイレブン' })).not.toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText('費目'), '2')
  expect(screen.getByRole('option', { name: 'セブンイレブン' })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: 'イオン' })).not.toBeInTheDocument()
})

test('does not submit while the required category field is empty', async () => {
  const user = userEvent.setup()
  const onSubmit = jest.fn().mockResolvedValue(undefined)
  render(<ExpenseForm categories={categories} vendors={vendors} disabled={false} onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('金額（税込み）'), '1000')
  await user.click(screen.getByRole('button', { name: '追加する' }))

  expect(onSubmit).not.toHaveBeenCalled()
})

test('submits the entered values once required fields are filled', async () => {
  const user = userEvent.setup()
  const onSubmit = jest.fn().mockResolvedValue(undefined)
  render(<ExpenseForm categories={categories} vendors={vendors} disabled={false} onSubmit={onSubmit} />)

  await user.selectOptions(screen.getByLabelText('費目'), '1')
  await user.type(screen.getByLabelText('内容'), 'ランチ代')
  await user.clear(screen.getByLabelText('金額（税込み）'))
  await user.type(screen.getByLabelText('金額（税込み）'), '1500')
  await user.click(screen.getByRole('button', { name: '追加する' }))

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ category_id: 1, content: 'ランチ代', amount: 1500 }),
  )
})
