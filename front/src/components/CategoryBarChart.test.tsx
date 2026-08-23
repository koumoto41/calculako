import { render, screen } from '@testing-library/react'
import { CategoryBarChart } from './CategoryBarChart'
import type { CategoryBreakdown } from '../types'

test('renders bars sorted by amount, descending, skipping zero-amount categories', () => {
  const breakdown: CategoryBreakdown[] = [
    { category_id: 1, category_name: 'スーパー', total: 3000 },
    { category_id: 2, category_name: 'コンビニ', total: 8000 },
    { category_id: 3, category_name: '通販', total: 0 },
  ]

  render(<CategoryBarChart breakdown={breakdown} />)

  const labels = screen.getAllByText(/スーパー|コンビニ|通販/)
  expect(labels.map((el) => el.textContent)).toEqual(['コンビニ', 'スーパー'])
  expect(screen.getByText('8,000円')).toBeInTheDocument()
  expect(screen.getByText('3,000円')).toBeInTheDocument()
  expect(screen.queryByText('通販')).not.toBeInTheDocument()
})

test('shows an empty state when every category is zero', () => {
  render(
    <CategoryBarChart
      breakdown={[
        { category_id: 1, category_name: 'スーパー', total: 0 },
        { category_id: 2, category_name: 'コンビニ', total: 0 },
      ]}
    />,
  )

  expect(screen.getByText('この月の経費はまだ登録されていません。')).toBeInTheDocument()
})
