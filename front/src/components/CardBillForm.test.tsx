import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardBillForm } from './CardBillForm'
import type { Card } from '../types'

const cards: Card[] = [{ id: 1, name: '楽天カード' }]

test('typing digits updates the amount', async () => {
  const user = userEvent.setup()
  render(<CardBillForm cards={cards} bills={[]} disabled={false} onSave={async () => {}} />)

  const input = screen.getByLabelText('楽天カード')
  await user.clear(input)
  await user.type(input, '5000')

  expect(input).toHaveValue('5000')
})

test('typing full-width digits (as an IME in full-width mode would send) still updates the amount', async () => {
  const user = userEvent.setup()
  render(<CardBillForm cards={cards} bills={[]} disabled={false} onSave={async () => {}} />)

  const input = screen.getByLabelText('楽天カード')
  await user.clear(input)
  // A native <input type="number"> silently rejects these characters,
  // which is exactly what made the field look like it wasn't accepting
  // input at all when an IME was left in full-width mode.
  await user.type(input, '５０００')

  expect(input).toHaveValue('5000')
})
