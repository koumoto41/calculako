import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseEntryPage } from './pages/ExpenseEntryPage'
import { CategoryVendorPage } from './pages/CategoryVendorPage'
import { CardPage } from './pages/CardPage'
import { AllowancePage } from './pages/AllowancePage'
import { ImportPage } from './pages/ImportPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpenseEntryPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/categories" element={<CategoryVendorPage />} />
          <Route path="/cards" element={<CardPage />} />
          <Route path="/allowance" element={<AllowancePage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
