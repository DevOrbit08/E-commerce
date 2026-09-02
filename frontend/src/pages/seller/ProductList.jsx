import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const LOW_STOCK_THRESHOLD = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50]
// Update this to match the actual route that renders AddProduct.jsx in your router setup
const ADD_PRODUCT_ROUTE = '/seller'

const StatCard = ({ icon, label, value, caption, tone = 'default' }) => {
  const toneMap = {
    default: { bg: '#fff1ec', fg: '#f1683a' },
    amber: { bg: '#fff3e0', fg: '#c2760a' },
    red: { bg: '#fdecec', fg: '#d33' },
  }
  const colors = toneMap[tone] || toneMap.default

  return (
    <div className="rounded-[18px] border border-[#eadfd5] bg-[#fdfaf8] p-4 shadow-[0_6px_24px_rgba(25,19,15,0.03)]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ background: colors.bg, color: colors.fg }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-[#8a8079]">{label}</p>
          <p className="text-2xl font-semibold text-[#1f1e1c]">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[#a9a09b]">{caption}</p>
    </div>
  )
}

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

const ProductList = () => {
  const { products, currency, fetchProducts } = useAppContext()
  const navigate = useNavigate()

  const [loadingId, setLoadingId] = useState(null)
  const [editing, setEditing] = useState(null) // product id being edited
  const [form, setForm] = useState({ name: '', description: '', price: '', offerPrice: '', category: '' })

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category).filter(Boolean))
    return Array.from(set)
  }, [products])

  const stats = useMemo(() => {
    const list = products || []
    const total = list.length
    const outOfStock = list.filter((p) => !p.inStock || Number(p.quantity) === 0).length
    const lowStock = list.filter(
      (p) => p.inStock && Number(p.quantity) > 0 && Number(p.quantity) <= LOW_STOCK_THRESHOLD
    ).length
    return { total, outOfStock, lowStock, categories: categories.length }
  }, [products, categories])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (products || []).filter((p) => {
      const matchesSearch =
        !q || p.name?.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const startEdit = (product) => {
    setEditing(product._id)
    setForm({
      name: product.name || '',
      description: Array.isArray(product.description) ? product.description.join('\n') : (product.description || ''),
      price: product.price || '',
      offerPrice: product.offerPrice || '',
      category: product.category || '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', offerPrice: '', category: '' })
  }

  const submitEdit = async (id) => {
    try {
      setLoadingId(id)
      const payload = {
        id,
        name: form.name,
        description: form.description.split('\n').map((s) => s.trim()).filter(Boolean),
        price: Number(form.price),
        offerPrice: Number(form.offerPrice),
        category: form.category,
      }
      const res = await fetch(`${API_URL}/api/product/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data && data.success) {
        toast.success('Product updated')
        if (fetchProducts) fetchProducts()
        cancelEdit()
      } else {
        toast.error((data && data.message) || 'Failed to update product')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error')
    } finally {
      setLoadingId(null)
    }
  }

  const toggleStock = async (product) => {
    try {
      setLoadingId(product._id)
      const newQuantity = product.inStock ? 0 : (product.quantity && product.quantity > 0 ? product.quantity : 1)
      const res = await fetch(`${API_URL}/api/product/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: product._id, quantity: newQuantity }),
      })
      const data = await res.json()
      if (data && data.success) {
        toast.success(product.inStock ? 'Marked out of stock' : 'Marked in stock')
        if (fetchProducts) fetchProducts()
      } else {
        toast.error((data && data.message) || 'Failed to update stock')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error while updating stock')
    } finally {
      setLoadingId(null)
    }
  }

  const deleteProduct = async (product) => {
    if (!confirm('Delete this product?')) return
    try {
      const res = await fetch(`${API_URL}/api/product/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: product._id }),
      })
      const data = await res.json()
      if (data && data.success) {
        toast.success('Product deleted')
        if (fetchProducts) fetchProducts()
      } else {
        toast.error((data && data.message) || 'Failed to delete')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error')
    }
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-[#fbf7f0]">
      <div className="mx-auto w-full max-w-[1400px] p-4 md:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-[#1f1e1c]">Products</h1>
          <p className="mt-1 text-sm text-[#8a8079]">Manage your product inventory, pricing and availability.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon="🛍️" label="Total products" value={stats.total} caption="All active products" />
          <StatCard icon="⬇️" label="In stock" value={stats.lowStock} caption="Require attention" tone="amber" />
          <StatCard icon="⨯" label="Out of stock" value={stats.outOfStock} caption="Not available" tone="red" />
          <StatCard icon="🗂️" label="Categories" value={stats.categories} caption="Product groups" />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a9a09b]">🔍</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search products, SKU..."
              className="w-full rounded-xl border border-[#d9cfc4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2a2724] outline-none transition focus:border-[#f1683a]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#d9cfc4] bg-white px-4 py-2.5 text-sm text-[#2a2724] outline-none transition focus:border-[#f1683a]"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => navigate(ADD_PRODUCT_ROUTE)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#f1683a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(241,104,58,0.25)] transition hover:bg-[#e95d2f]"
          >
            <span>+</span> Add product
          </button>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#eadfd5] bg-white">
          <table className="w-full min-w-[640px] table-fixed">
            <thead className="bg-[#fdfaf8] text-left text-sm text-[#5a514d]">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">MRP ({currency})</th>
                <th className="px-4 py-3 font-semibold">Selling price ({currency})</th>
                <th className="px-4 py-3 font-semibold">In Stock</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#4f4845]">
              {paginated.map((product) => (
                <tr key={product._id} className="border-t border-[#eee3d8]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#eadfd5] bg-[#f6f0ec]">
                        <img
                          src={(product.image && product.image[0]) || assets.upload_area}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#2a2724]">{product.name}</p>
                        {product.sku && <p className="text-xs text-[#a9a09b]">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {currency}
                    {product.price}
                  </td>
                  <td className="px-4 py-3">
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!product.inStock}
                      disabled={loadingId === product._id}
                      onClick={() => toggleStock(product)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
                        product.inStock ? 'bg-[#f1683a]' : 'bg-[#d8cfc8]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          product.inStock ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="rounded-lg border border-[#d9cfc4] bg-white px-3 py-1.5 text-xs font-medium text-[#2a2724] transition hover:bg-[#fdfaf8]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="rounded-lg border border-[#f3c9c9] bg-[#fdecec] px-3 py-1.5 text-xs font-medium text-[#d33] transition hover:bg-[#ffe0e0]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#a9a09b]">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8a8079]">
            <p>
              Showing {(currentPage - 1) * pageSize + 1} to {(currentPage - 1) * pageSize + paginated.length} of{' '}
              {filtered.length} products
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9cfc4] bg-white text-[#2a2724] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {getPageNumbers(currentPage, totalPages).map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-[#c9bfb2]">…</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                      p === currentPage
                        ? 'bg-[#f1683a] text-white'
                        : 'border border-[#d9cfc4] bg-white text-[#2a2724] hover:bg-[#fdfaf8]'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9cfc4] bg-white text-[#2a2724] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-lg border border-[#d9cfc4] bg-white px-2 py-1.5 text-sm text-[#2a2724] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6">
            <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-[#1f1e1c]">Edit product</h3>
              <div className="flex flex-col gap-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-[#d9cfc4] p-2.5 text-sm outline-none focus:border-[#f1683a]"
                  placeholder="Name"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="rounded-xl border border-[#d9cfc4] p-2.5 text-sm outline-none focus:border-[#f1683a]"
                  placeholder="Description (one per line)"
                />
                <div className="flex gap-3">
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="flex-1 rounded-xl border border-[#d9cfc4] p-2.5 text-sm outline-none focus:border-[#f1683a]"
                    placeholder="Price"
                  />
                  <input
                    value={form.offerPrice}
                    onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                    className="flex-1 rounded-xl border border-[#d9cfc4] p-2.5 text-sm outline-none focus:border-[#f1683a]"
                    placeholder="Offer Price"
                  />
                </div>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl border border-[#d9cfc4] p-2.5 text-sm outline-none focus:border-[#f1683a]"
                  placeholder="Category"
                />

                <div className="mt-2 flex justify-end gap-3">
                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-[#d9cfc4] px-4 py-2 text-sm font-medium text-[#2a2724]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitEdit(editing)}
                    disabled={loadingId === editing}
                    className="rounded-xl bg-[#f1683a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e95d2f] disabled:opacity-60"
                  >
                    {loadingId === editing ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList