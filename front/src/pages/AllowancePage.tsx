import { useEffect, useState, type FormEvent } from 'react'
import { getAllowance, updateAllowance } from '../api/allowance'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function AllowancePage() {
  useDocumentTitle('お小遣い登録')
  const [amount, setAmount] = useState(35000)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    getAllowance().then((allowance) => setAmount(allowance.amount))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await updateAllowance(amount)
    setSavedMessage(true)
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>お小遣い登録</h1>
      </div>

      <div className="card" style={{ maxWidth: 360 }}>
        <form onSubmit={handleSubmit} className="form-group">
          <label htmlFor="allowance-amount">お小遣い（円）</label>
          <input
            id="allowance-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(event) => {
              setAmount(Number(event.target.value))
              setSavedMessage(false)
            }}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
          {savedMessage && (
            <p className="status-message" role="status">
              保存しました。
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
