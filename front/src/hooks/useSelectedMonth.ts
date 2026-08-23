import { useSearchParams } from 'react-router-dom'

export interface SelectedMonth {
  year: number
  month: number
  setMonth: (year: number, month: number) => void
}

export function useSelectedMonth(): SelectedMonth {
  const [searchParams, setSearchParams] = useSearchParams()

  const now = new Date()
  const year = Number(searchParams.get('year')) || now.getFullYear()
  const month = Number(searchParams.get('month')) || now.getMonth() + 1

  function setMonth(nextYear: number, nextMonth: number) {
    setSearchParams({ year: String(nextYear), month: String(nextMonth) })
  }

  return { year, month, setMonth }
}
