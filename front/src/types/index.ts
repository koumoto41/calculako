export interface User {
  id: number
  name: string
  email: string
}

export interface Category {
  id: number
  name: string
  sort_order: number
}

export interface Vendor {
  id: number
  category_id: number
  name: string
}

export interface Expense {
  id: number
  date: string
  category_id: number
  vendor_id: number | null
  content: string
  amount: number
  memo: string | null
}

export interface ExpenseInput {
  date: string
  category_id: number
  vendor_id: number | null
  content: string
  amount: number
  memo: string
}

export interface Card {
  id: number
  name: string
}

export interface CardBill {
  card_id: number
  year: number
  month: number
  amount: number
}

export interface Allowance {
  amount: number
}

export interface CategoryBreakdown {
  category_id: number
  category_name: string
  total: number
}

export interface MonthSummary {
  year: number
  month: number
  is_closed: boolean
  expense_total: number
  category_breakdown: CategoryBreakdown[]
  card_bill_total: number
  allowance: number
  balance: number
}
