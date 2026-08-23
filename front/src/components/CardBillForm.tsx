import { useEffect, useState, type FormEvent } from 'react'
import { parseAmountInput } from '../utils/numeric'
import type { Card, CardBill } from '../types'

interface CardBillFormProps {
  cards: Card[]
  bills: CardBill[]
  disabled: boolean
  onSave: (bills: { card_id: number; amount: number }[]) => Promise<void>
}

export function CardBillForm({ cards, bills, disabled, onSave }: CardBillFormProps) {
  const [amounts, setAmounts] = useState<Record<number, number>>({})

  useEffect(() => {
    const next: Record<number, number> = {}
    for (const card of cards) {
      next[card.id] = bills.find((bill) => bill.card_id === card.id)?.amount ?? 0
    }
    setAmounts(next)
  }, [cards, bills])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSave(cards.map((card) => ({ card_id: card.id, amount: amounts[card.id] ?? 0 })))
  }

  if (cards.length === 0) {
    return <p className="empty-state">カードが登録されていません。「カード」画面から登録してください。</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        {cards.map((card) => (
          <div className="form-group" key={card.id}>
            <label htmlFor={`card-bill-${card.id}`}>{card.name}</label>
            <input
              id={`card-bill-${card.id}`}
              type="text"
              inputMode="numeric"
              disabled={disabled}
              value={amounts[card.id] ?? 0}
              onChange={(event) => setAmounts({ ...amounts, [card.id]: parseAmountInput(event.target.value) })}
            />
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={disabled}>
          カード請求額を保存
        </button>
      </div>
    </form>
  )
}
