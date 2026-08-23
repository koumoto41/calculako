import { useEffect, useState, type FormEvent } from 'react'
import * as categoriesApi from '../api/categories'
import * as vendorsApi from '../api/vendors'
import type { Category, Vendor } from '../types'

export function CategoryVendorPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newVendorNames, setNewVendorNames] = useState<Record<number, string>>({})

  async function reload() {
    const [categoryList, vendorList] = await Promise.all([
      categoriesApi.listCategories(),
      vendorsApi.listVendors(),
    ])
    setCategories(categoryList)
    setVendors(vendorList)
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleAddCategory(event: FormEvent) {
    event.preventDefault()
    if (!newCategoryName.trim()) return
    await categoriesApi.createCategory(newCategoryName.trim())
    setNewCategoryName('')
    await reload()
  }

  async function handleDeleteCategory(id: number) {
    if (!window.confirm('この費目を削除しますか？')) return
    await categoriesApi.deleteCategory(id)
    await reload()
  }

  async function handleAddVendor(categoryId: number, event: FormEvent) {
    event.preventDefault()
    const name = newVendorNames[categoryId]?.trim()
    if (!name) return
    await vendorsApi.createVendor(categoryId, name)
    setNewVendorNames({ ...newVendorNames, [categoryId]: '' })
    await reload()
  }

  async function handleDeleteVendor(id: number) {
    if (!window.confirm('この購入先を削除しますか？')) return
    await vendorsApi.deleteVendor(id)
    await reload()
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h1>費目・購入先登録</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>費目を追加</h2>
        </div>
        <form onSubmit={handleAddCategory} className="form-row">
          <div className="form-group">
            <label htmlFor="new-category">費目名</label>
            <input
              id="new-category"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              追加
            </button>
          </div>
        </form>
      </div>

      {categories.map((category) => (
        <div className="card" key={category.id}>
          <div className="card-header">
            <h2>{category.name}</h2>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(category.id)}>
              費目を削除
            </button>
          </div>

          {vendors.filter((vendor) => vendor.category_id === category.id).length > 0 ? (
            <ul style={{ listStyle: 'none', margin: '0 0 14px', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vendors
                .filter((vendor) => vendor.category_id === category.id)
                .map((vendor) => (
                  <li key={vendor.id} className="badge badge-closed" style={{ gap: 8 }}>
                    {vendor.name}
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                      aria-label={`${vendor.name}を削除`}
                    >
                      ×
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="empty-state" style={{ padding: '0 0 14px', textAlign: 'left' }}>
              購入先はまだありません。
            </p>
          )}

          <form onSubmit={(event) => handleAddVendor(category.id, event)} className="form-row">
            <div className="form-group">
              <label htmlFor={`new-vendor-${category.id}`}>購入先を追加</label>
              <input
                id={`new-vendor-${category.id}`}
                value={newVendorNames[category.id] ?? ''}
                onChange={(event) => setNewVendorNames({ ...newVendorNames, [category.id]: event.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-secondary">
                追加
              </button>
            </div>
          </form>
        </div>
      ))}
    </div>
  )
}
