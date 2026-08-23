import { apiClient, ensureCsrfCookie } from './client'
import type { User } from '../types'

export async function login(email: string, password: string): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await apiClient.post<{ user: User }>('/login', { email, password })
  return data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout')
}

export async function currentUser(): Promise<User | null> {
  try {
    const { data } = await apiClient.get<User>('/user')
    return data
  } catch {
    return null
  }
}
