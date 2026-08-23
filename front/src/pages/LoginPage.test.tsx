import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { useAuth } from '../context/AuthContext'

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockedUseAuth = useAuth as jest.Mock

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>ダッシュボード</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

test('shows an error message when login fails', async () => {
  const user = userEvent.setup()
  const login = jest.fn().mockRejectedValue(new Error('failed'))
  mockedUseAuth.mockReturnValue({ user: null, isLoading: false, login, logout: jest.fn() })

  renderLoginPage()

  await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
  await user.type(screen.getByLabelText('パスワード'), 'wrong-password')
  await user.click(screen.getByRole('button', { name: 'ログイン' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('メールアドレスまたはパスワードが正しくありません。')
  expect(login).toHaveBeenCalledWith('test@example.com', 'wrong-password')
})

test('redirects to the dashboard once a user is present', () => {
  mockedUseAuth.mockReturnValue({
    user: { id: 1, name: 'Admin', email: 'admin@example.com' },
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  })

  renderLoginPage()

  expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
})
