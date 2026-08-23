import { ImportPage } from './ImportPage'
import { parseAmazonCsv } from '../utils/amazonCsv'

export function AmazonImportPage() {
  return <ImportPage title="AmazonカードCSVインポート" descriptionLabel="商品名" parseCsv={parseAmazonCsv} />
}
