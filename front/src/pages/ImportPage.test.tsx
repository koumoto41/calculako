import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayPayImportPage } from './PayPayImportPage'
import * as categoriesApi from '../api/categories'
import * as vendorsApi from '../api/vendors'
import * as expensesApi from '../api/expenses'
import * as csv from '../utils/csv'
import * as paypayCsv from '../utils/paypayCsv'

jest.mock('../api/categories')
jest.mock('../api/vendors')
jest.mock('../api/expenses')
jest.mock('../utils/csv')
jest.mock('../utils/paypayCsv')

const mockedCategoriesApi = categoriesApi as jest.Mocked<typeof categoriesApi>
const mockedVendorsApi = vendorsApi as jest.Mocked<typeof vendorsApi>
const mockedExpensesApi = expensesApi as jest.Mocked<typeof expensesApi>
const mockedCsv = csv as jest.Mocked<typeof csv>
const mockedPaypayCsv = paypayCsv as jest.Mocked<typeof paypayCsv>

beforeEach(() => {
  jest.resetAllMocks()
  jest.useFakeTimers().setSystemTime(new Date(2026, 7, 23)) // "today" = 2026-08-23, so the working month is August
  mockedCategoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'スーパー', sort_order: 0 }])
  mockedVendorsApi.listVendors.mockResolvedValue([])
  mockedExpensesApi.createExpense.mockResolvedValue({
    id: 1,
    date: '2026-07-04',
    settlement_year: 2026,
    settlement_month: 8,
    category_id: 1,
    vendor_id: null,
    content: '',
    amount: 4417,
    memo: 'サンエー',
  })
  mockedCsv.readCsvFile.mockResolvedValue('dummy csv text')
  mockedPaypayCsv.parsePayPayCsv.mockReturnValue([
    { id: 'row-1', date: '2026-07-04', content: '', memo: 'サンエー', amount: 4417, settlementDate: '2026-08-27' },
  ])
})

afterEach(() => {
  jest.useRealTimers()
})

async function uploadAndConfirmFirstRow(user: ReturnType<typeof userEvent.setup>) {
  const file = new File(['dummy'], 'paypay.csv', { type: 'text/csv' })
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, file)

  await screen.findByText('サンエー')
  await user.click(screen.getByLabelText('2026-07-04 サンエーを選択'))
  await user.click(screen.getByRole('button', { name: /確認する/ }))
}

test('the date field always shows the CSV date, and the settlement month defaults to the working month', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  render(<PayPayImportPage />)

  await uploadAndConfirmFirstRow(user)

  // The CSV row is dated in July, but "today" is August, so the settlement
  // month must default to August (the working month), not July.
  expect(await screen.findByText('2026年8月')).toBeInTheDocument()
  expect(screen.getByLabelText('日付')).toHaveValue('2026-07-04')
})

test('changing the settlement month does not touch the date field', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  render(<PayPayImportPage />)

  await uploadAndConfirmFirstRow(user)
  await user.click(screen.getByLabelText('次の月'))

  expect(screen.getByText('2026年9月')).toBeInTheDocument()
  expect(screen.getByLabelText('日付')).toHaveValue('2026-07-04')
})

test('the select table is sorted by date regardless of the CSV\'s original row order', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  mockedPaypayCsv.parsePayPayCsv.mockReturnValue([
    { id: 'row-1', date: '2026-07-20', content: '', memo: '後の店', amount: 1000, settlementDate: null },
    { id: 'row-2', date: '2026-07-04', content: '', memo: '先の店', amount: 2000, settlementDate: null },
  ])
  render(<PayPayImportPage />)

  const file = new File(['dummy'], 'paypay.csv', { type: 'text/csv' })
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, file)

  const dateCells = await screen.findAllByText(/^2026-07-(04|20)$/)
  expect(dateCells.map((cell) => cell.textContent)).toEqual(['2026-07-04', '2026-07-20'])
})

test('importing sends the CSV date unchanged plus the settlement month as separate fields', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  render(<PayPayImportPage />)

  await uploadAndConfirmFirstRow(user)
  await user.selectOptions(screen.getByLabelText('費目'), '1')
  await user.click(screen.getByRole('button', { name: 'インポート' }))

  expect(mockedExpensesApi.createExpense).toHaveBeenCalledWith(
    expect.objectContaining({ date: '2026-07-04', settlement_year: 2026, settlement_month: 8 }),
  )
})
