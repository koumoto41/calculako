import type { CategoryBreakdown } from '../types'

export function CategoryBreakdownTable({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>費目</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row) => (
            <tr key={row.category_id}>
              <td>{row.category_name}</td>
              <td>{row.total.toLocaleString()}円</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
