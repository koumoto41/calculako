import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import * as authApi from '../api/auth'

jest.mock('../api/auth')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

function Consumer() {
  const { user, isLoading, login, logout } = useAuth()

  if (isLoading) return <p>loading</p>

  return (
    <div>
      <p>user: {user ? user.email : 'none'}</p>
      <button onClick={() => login('admin@example.com', 'secret')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

test('bootstraps the user from /api/user on mount', async () => {
  mockedAuthApi.currentUser.mockResolvedValue({ id: 1, name: 'Admin', email: 'admin@example.com' })

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )

  expect(await screen.findByText('user: admin@example.com')).toBeInTheDocument()
})

test('login and logout update the authenticated user', async () => {
  const user = userEvent.setup()
  mockedAuthApi.currentUser.mockResolvedValue(null)
  mockedAuthApi.login.mockResolvedValue({ id: 2, name: 'Someone', email: 'someone@example.com' })
  mockedAuthApi.logout.mockResolvedValue(undefined)

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )

  await waitFor(() => expect(screen.getByText('user: none')).toBeInTheDocument())

  await act(() => user.click(screen.getByText('login')))
  expect(screen.getByText('user: someone@example.com')).toBeInTheDocument()

  await act(() => user.click(screen.getByText('logout')))
  expect(screen.getByText('user: none')).toBeInTheDocument()
})
