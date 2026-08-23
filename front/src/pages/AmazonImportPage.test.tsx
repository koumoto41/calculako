import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmazonImportPage } from './AmazonImportPage'
import * as categoriesApi from '../api/categories'
import * as vendorsApi from '../api/vendors'
import * as csv from '../utils/csv'
import * as amazonCsv from '../utils/amazonCsv'

jest.mock('../api/categories')
jest.mock('../api/vendors')
jest.mock('../api/expenses')
jest.mock('../utils/csv')
jest.mock('../utils/amazonCsv')

const mockedCategoriesApi = categoriesApi as jest.Mocked<typeof categoriesApi>
const mockedVendorsApi = vendorsApi as jest.Mocked<typeof vendorsApi>
const mockedCsv = csv as jest.Mocked<typeof csv>
const mockedAmazonCsv = amazonCsv as jest.Mocked<typeof amazonCsv>

beforeEach(() => {
  jest.resetAllMocks()
  mockedCategoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'スーパー', sort_order: 0 }])
  mockedVendorsApi.listVendors.mockResolvedValue([])
  mockedCsv.readCsvFile.mockResolvedValue('dummy csv text')
  mockedAmazonCsv.parseAmazonCsv.mockReturnValue([
    { id: 'row-1', date: '2026-07-11', content: 'AMAZON.CO.JP', memo: '', amount: 5159, settlementDate: null },
  ])
})

test('shows the Amazon-specific column label and pre-fills content (not memo) from the CSV', async () => {
  const user = userEvent.setup()
  render(<AmazonImportPage />)

  const file = new File(['dummy'], 'amazon.csv', { type: 'text/csv' })
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, file)

  expect(await screen.findByText('商品名')).toBeInTheDocument()
  await user.click(screen.getByLabelText('2026-07-11 AMAZON.CO.JPを選択'))
  await user.click(screen.getByRole('button', { name: /確認する/ }))

  // Unlike PayPay (which leaves 内容 blank), Amazon's item description
  // is known up front, so it should already be in the 内容 field.
  expect(screen.getByLabelText('内容')).toHaveValue('AMAZON.CO.JP')
  expect(screen.getByLabelText('メモ')).toHaveValue('')
})
