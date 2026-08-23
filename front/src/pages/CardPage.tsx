import { isAxiosError } from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import * as cardsApi from '../api/cards'
import type { Card } from '../types'

function errorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }
  return fallback
}

export function CardPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [newCardName, setNewCardName] = useState('')
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setCards(await cardsApi.listCards())
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!newCardName.trim()) return
    setError(null)
    try {
      await cardsApi.createCard(newCardName.trim())
      setNewCardName('')
      await reload()
    } catch (err) {
      setError(errorMessage(err, 'カードの追加に失敗しました。'))
    }
  }

  function startEditing(card: Card) {
    setError(null)
    setEditingCard(card)
    setEditName(card.name)
  }

  function cancelEditing() {
    setEditingCard(null)
    setEditName('')
  }

  async function handleUpdate(event: FormEvent) {
    event.preventDefault()
    if (!editingCard || !editName.trim()) return
    setError(null)
    try {
      await cardsApi.updateCard(editingCard.id, editName.trim())
      cancelEditing()
      await reload()
    } catch (err) {
      setError(errorMessage(err, 'カード名の更新に失敗しました。'))
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('このカードを削除しますか？')) return
    setError(null)
    try {
      await cardsApi.deleteCard(id)
      await reload()
    } catch (err) {
      setError(errorMessage(err, 'カードの削除に失敗しました。'))
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>カード登録画面</h1>
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="card">
        <div className="card-header">
          <h2>カードを追加</h2>
        </div>
        <form onSubmit={handleAdd} className="form-row">
          <div className="form-group">
            <label htmlFor="new-card">カード名</label>
            <input id="new-card" value={newCardName} onChange={(event) => setNewCardName(event.target.value)} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              追加
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>登録済みのカード</h2>
        </div>
        {cards.length === 0 ? (
          <p className="empty-state">カードはまだ登録されていません。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>カード名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    {editingCard?.id === card.id ? (
                      <td colSpan={2}>
                        <form onSubmit={handleUpdate} className="form-row" style={{ alignItems: 'center' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor={`edit-card-${card.id}`}>カード名</label>
                            <input
                              id={`edit-card-${card.id}`}
                              value={editName}
                              onChange={(event) => setEditName(event.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn btn-primary btn-sm">
                              保存
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEditing}>
                              キャンセル
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td>{card.name}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditing(card)}>
                            編集
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(card.id)}>
                            削除
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
