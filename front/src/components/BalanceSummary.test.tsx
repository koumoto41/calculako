import { render, screen } from '@testing-library/react'
import { BalanceSummary } from './BalanceSummary'

test('displays allowance + expense total - card bill total', () => {
  render(<BalanceSummary allowance={35000} expenseTotal={10000} cardBillTotal={5000} />)

  expect(screen.getByText('40,000円')).toBeInTheDocument()
})
