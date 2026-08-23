import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryVendorPage } from './CategoryVendorPage'
import * as categoriesApi from '../api/categories'
import * as vendorsApi from '../api/vendors'

jest.mock('../api/categories')
jest.mock('../api/vendors')

const mockedCategoriesApi = categoriesApi as jest.Mocked<typeof categoriesApi>
const mockedVendorsApi = vendorsApi as jest.Mocked<typeof vendorsApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedCategoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'スーパー', sort_order: 0 }])
  mockedVendorsApi.listVendors.mockResolvedValue([])
})

test('adding a category calls the API and refreshes the list', async () => {
  const user = userEvent.setup()
  mockedCategoriesApi.createCategory.mockResolvedValue({ id: 2, name: '趣味', sort_order: 1 })

  render(<CategoryVendorPage />)

  await screen.findByText('スーパー')

  await user.type(screen.getByLabelText('費目名'), '趣味')
  await user.click(screen.getAllByRole('button', { name: '追加' })[0])

  expect(mockedCategoriesApi.createCategory).toHaveBeenCalledWith('趣味')
})

test('adding a vendor under a category calls the API with its category id', async () => {
  const user = userEvent.setup()
  mockedVendorsApi.createVendor.mockResolvedValue({ id: 1, category_id: 1, name: 'イオン' })

  render(<CategoryVendorPage />)

  await screen.findByText('スーパー')

  await user.type(screen.getByLabelText('購入先を追加'), 'イオン')
  await user.click(screen.getAllByRole('button', { name: '追加' })[1])

  expect(mockedVendorsApi.createVendor).toHaveBeenCalledWith(1, 'イオン')
})
