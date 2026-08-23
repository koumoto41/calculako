import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { MonthSelector } from './MonthSelector'
import { useSelectedMonth } from '../hooks/useSelectedMonth'

function Harness() {
  const selectedMonth = useSelectedMonth()
  const [searchParams] = useSearchParams()

  return (
    <div>
      <MonthSelector {...selectedMonth} />
      <p>query: {searchParams.toString()}</p>
    </div>
  )
}

test('moving to the next month updates the URL search params', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/?year=2026&month=8']}>
      <Routes>
        <Route path="/" element={<Harness />} />
      </Routes>
    </MemoryRouter>,
  )

  expect(screen.getByText('2026年8月')).toBeInTheDocument()

  await user.click(screen.getByLabelText('次の月'))

  expect(screen.getByText('2026年9月')).toBeInTheDocument()
  expect(screen.getByText('query: year=2026&month=9')).toBeInTheDocument()
})
