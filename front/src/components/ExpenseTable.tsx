import type { Category, Expense, Vendor } from '../types'

interface ExpenseTableProps {
  expenses: Expense[]
  categories: Category[]
  vendors: Vendor[]
  disabled: boolean
  checkedIds: Set<number>
  onToggleChecked: (id: number) => void
  onToggleCheckAll: () => void
  onEdit: (expense: Expense) => void
  onDelete: (id: number) => void
}

export function ExpenseTable({
  expenses,
  categories,
  vendors,
  disabled,
  checkedIds,
  onToggleChecked,
  onToggleCheckAll,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const categoryName = (id: number) => categories.find((category) => category.id === id)?.name ?? ''
  const vendorName = (id: number | null) => vendors.find((vendor) => vendor.id === id)?.name ?? ''
  const isSettlementDifferent = (expense: Expense) => {
    const [year, month] = expense.date.split('-').map(Number)
    return year !== expense.settlement_year || month !== expense.settlement_month
  }

  if (expenses.length === 0) {
    return <p className="empty-state">この月の経費はまだ登録されていません。</p>
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const allChecked = expenses.every((expense) => checkedIds.has(expense.id))

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {!disabled && (
              <th>
                <input type="checkbox" aria-label="すべて選択" checked={allChecked} onChange={onToggleCheckAll} />
              </th>
            )}
            <th>日付</th>
            <th>費目</th>
            <th>購入先</th>
            <th>内容</th>
            <th>金額</th>
            <th>メモ</th>
            {!disabled && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              {!disabled && (
                <td>
                  <input
                    type="checkbox"
                    aria-label={`${expense.date} ${expense.content || expense.memo || ''}を選択`}
                    checked={checkedIds.has(expense.id)}
                    onChange={() => onToggleChecked(expense.id)}
                  />
                </td>
              )}
              <td>
                {expense.date}
                {isSettlementDifferent(expense) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    精算: {expense.settlement_year}年{expense.settlement_month}月
                  </div>
                )}
              </td>
              <td>{categoryName(expense.category_id)}</td>
              <td>{vendorName(expense.vendor_id)}</td>
              <td>{expense.content}</td>
              <td>{expense.amount.toLocaleString()}円</td>
              <td>{expense.memo}</td>
              {!disabled && (
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(expense)}>
                    編集
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(expense.id)}>
                    削除
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {!disabled && <td />}
            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>
              合計
            </td>
            <td style={{ fontWeight: 700 }}>{total.toLocaleString()}円</td>
            <td />
            {!disabled && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
