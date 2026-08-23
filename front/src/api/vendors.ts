import { apiClient } from './client'
import type { Vendor } from '../types'

export async function listVendors(categoryId?: number): Promise<Vendor[]> {
  const { data } = await apiClient.get<Vendor[]>('/vendors', {
    params: categoryId ? { category_id: categoryId } : undefined,
  })
  return data
}

export async function createVendor(categoryId: number, name: string): Promise<Vendor> {
  const { data } = await apiClient.post<Vendor>('/vendors', { category_id: categoryId, name })
  return data
}

export async function updateVendor(id: number, name: string): Promise<Vendor> {
  const { data } = await apiClient.put<Vendor>(`/vendors/${id}`, { name })
  return data
}

export async function deleteVendor(id: number): Promise<void> {
  await apiClient.delete(`/vendors/${id}`)
}
