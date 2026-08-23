import { ImportPage } from './ImportPage'
import { parsePayPayCsv } from '../utils/paypayCsv'

export function PayPayImportPage() {
  return (
    <ImportPage title="PayPayカードCSVインポート" descriptionLabel="利用店名・商品名" parseCsv={parsePayPayCsv} />
  )
}
