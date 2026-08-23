import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'ダッシュボード' },
  { to: '/expenses', label: '経費入力' },
  { to: '/import', label: 'CSVインポート' },
  { to: '/categories', label: '費目・購入先' },
  { to: '/cards', label: 'カード' },
  { to: '/allowance', label: 'お小遣い' },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">計</span>
          calculako
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user && <p style={{ color: 'var(--sidebar-text)', fontSize: '0.8rem', marginBottom: 8 }}>{user.email}</p>}
          <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => logout()}>
            ログアウト
          </button>
        </div>
      </aside>
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}
