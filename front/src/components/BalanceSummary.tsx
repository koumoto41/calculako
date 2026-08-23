interface BalanceSummaryProps {
  allowance: number
  expenseTotal: number
  cardBillTotal: number
}

export function BalanceSummary({ allowance, expenseTotal, cardBillTotal }: BalanceSummaryProps) {
  const balance = allowance + expenseTotal - cardBillTotal

  return (
    <div className="balance-card">
      <p className="balance-formula">
        お小遣い {allowance.toLocaleString()}円 + 今月の経費 {expenseTotal.toLocaleString()}円 − カード請求合計{' '}
        {cardBillTotal.toLocaleString()}円
      </p>
      <div className="balance-value">{balance.toLocaleString()}円</div>
    </div>
  )
}
