import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'
import { PRODUCT_CATEGORIES } from '../../constants/productCategories'
import CategoryMultiSelect from '../../components/CategoryMultiSelect'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LOW_STOCK_THRESHOLD = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50]
const ADD_PRODUCT_ROUTE = '/seller'

const UNIT_OPTIONS = ['g', 'kg', 'ml', 'L', 'pcs', 'pack']

const EMPTY_FORM = {
  name: '',
  description: '',
  category: [],
  brand: '',
  weight: '',
  unit: 'g',
  price: '',
  offerPrice: '',
}

const StatCard = ({
  icon,
  label,
  value,
  caption,
  tone = 'default',
}) => {
  const shortLabels = {
    'Total products': 'Total',
    'In stock': 'Stock',
    'Out of stock': 'Out',
    Categories: 'Categories',
  }
  const toneMap = {
    default: {
      bg: '#fff1ec',
      fg: '#f1683a',
    },
    amber: {
      bg: '#fff3e0',
      fg: '#c2760a',
    },
    red: {
      bg: '#fdecec',
      fg: '#d33',
    },
  }

  const colors = toneMap[tone] || toneMap.default

  return (
    <div className="min-w-0 rounded-lg border border-[#eadfd5] bg-[#fdfaf8] p-1.5 shadow-[0_6px_24px_rgba(25,19,15,0.03)] sm:rounded-2xl sm:p-4">
      <div className="flex min-w-0 flex-col items-center gap-0.5 text-center sm:flex-row sm:gap-3 sm:text-left">
        <div
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] sm:h-11 sm:w-11 sm:text-lg"
          style={{
            background: colors.bg,
            color: colors.fg,
          }}
        >
          {icon}
        </div>

        <div className="min-w-0 max-w-full">
          <p className="truncate text-[8px] leading-tight text-[#8a8079] sm:hidden">{shortLabels[label] || label}</p>
          <p className="hidden truncate text-sm leading-tight text-[#8a8079] sm:block">{label}</p>

          <p className="truncate text-sm font-semibold leading-tight text-[#1f1e1c] sm:text-2xl">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-1 hidden text-xs text-[#a9a09b] sm:block">
        {caption}
      </p>
    </div>
  )
}

const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, index) => index + 1
    )
  }

  const pages = new Set([
    1,
    2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
}

const ProductList = () => {
  const {
    products,
    currency,
    fetchProducts,
  } = useAppContext()

  const navigate = useNavigate()

  const [loadingId, setLoadingId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] =
    useState('all')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const categories = useMemo(() => {
    const categorySet = new Set(
      (products || [])
        .flatMap((product) => Array.isArray(product.category) ? product.category : [product.category])
        .filter(Boolean)
    )

    return Array.from(categorySet)
  }, [products])

  const editCategoryOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...PRODUCT_CATEGORIES,
        ...categories,
      ])
    )
  }, [categories])

  const brandOptions = useMemo(() => {
    return Array.from(
      new Set(
        (products || [])
          .map((product) => product.brand)
          .filter(Boolean)
      )
    )
  }, [products])

  const stats = useMemo(() => {
    const productList = products || []

    const total = productList.length

    const outOfStock = productList.filter(
      (product) => product.inStock === false
    ).length

    const lowStock = productList.filter(
      (product) =>
        product.inStock &&
        (
          (Number(product.quantity) > 0 &&
            Number(product.quantity) <= LOW_STOCK_THRESHOLD) ||
          (Array.isArray(product.variants) &&
            product.variants.some(
              (variant) =>
                variant.inStock &&
                Number(variant.quantity) > 0 &&
                Number(variant.quantity) <= LOW_STOCK_THRESHOLD
            ))
        )
    ).length

    return {
      total,
      outOfStock,
      lowStock,
      categories: categories.length,
    }
  }, [products, categories])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (products || []).filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          ?.toLowerCase()
          .includes(query) ||
        product.sku
          ?.toLowerCase()
          .includes(query) ||
        product.brand
          ?.toLowerCase()
          .includes(query)

      const matchesCategory =
        categoryFilter === 'all' ||
        (Array.isArray(product.category) ? product.category.includes(categoryFilter) : product.category === categoryFilter)

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  )

  const currentPage = Math.min(page, totalPages)

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const discountPercentage = useMemo(() => {
    const mrp = Number(form.price)
    const offerPrice = Number(form.offerPrice)

    if (
      !Number.isFinite(mrp) ||
      !Number.isFinite(offerPrice) ||
      mrp <= 0 ||
      offerPrice <= 0 ||
      offerPrice > mrp
    ) {
      return null
    }

    return (
      ((mrp - offerPrice) / mrp) *
      100
    ).toFixed(1)
  }, [form.price, form.offerPrice])

  const startEdit = (product) => {
    setEditing(product._id)

    setForm({
      name: product.name || '',

      description: Array.isArray(
        product.description
      )
        ? product.description.join('\n')
        : product.description || '',

      category: Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []),
      brand: product.brand || '',

      weight:
        product.weight ||
        product.unitWeight ||
        '',

      unit: product.unit || 'g',

      price: product.price || '',
      offerPrice: product.offerPrice || '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const submitEdit = async (productId) => {
    const mrp = Number(form.price)
    const offerPrice = Number(form.offerPrice)
    const weight = Number(form.weight)

    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }

    if (!form.description.trim()) {
      toast.error('Product description is required')
      return
    }

    if (!form.category.length) {
      toast.error('Please select a category')
      return
    }

    if (!form.brand.trim()) {
      toast.error('Brand name is required')
      return
    }

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      toast.error('Enter a valid unit/weight')
      return
    }

    if (
      !Number.isFinite(mrp) ||
      mrp <= 0
    ) {
      toast.error('Enter a valid MRP')
      return
    }

    if (
      !Number.isFinite(offerPrice) ||
      offerPrice <= 0
    ) {
      toast.error('Enter a valid offer price')
      return
    }

    if (offerPrice > mrp) {
      toast.error(
        'Offer price cannot be greater than MRP'
      )
      return
    }

    try {
      setLoadingId(productId)

      const payload = {
        id: productId,
        name: form.name.trim(),

        description: form.description
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),

        category: form.category,
        brand: form.brand.trim(),
        weight,
        unit: form.unit,
        price: mrp,
        offerPrice,
      }

      const response = await fetch(
        `${API_URL}/api/product/update`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data?.success) {
        toast.success(
          'Product updated successfully'
        )

        if (fetchProducts) {
          await fetchProducts()
        }

        cancelEdit()
      } else {
        toast.error(
          data?.message ||
            'Failed to update product'
        )
      }
    } catch (error) {
      console.error(error)

      toast.error(
        'Network error while updating product'
      )
    } finally {
      setLoadingId(null)
    }
  }

  const toggleStock = async (product) => {
    try {
      setLoadingId(product._id)

      const newQuantity = product.inStock
        ? 0
        : product.quantity &&
            Number(product.quantity) > 0
          ? Number(product.quantity)
          : 1

      const response = await fetch(
        `${API_URL}/api/product/stock`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify({
            id: product._id,
            quantity: newQuantity,
          }),
        }
      )

      const data = await response.json()

      if (data?.success) {
        toast.success(
          product.inStock
            ? 'Marked out of stock'
            : 'Marked in stock'
        )

        if (fetchProducts) {
          await fetchProducts()
        }

      } else {
        toast.error(
          data?.message ||
            'Failed to update stock'
        )
      }

      const toggleVariantStock = async (product, variant) => {
        try {
          setLoadingId(`${product._id}-${variant.unit}`)
          const quantity = variant.inStock ? 0 : (Number(variant.quantity) > 0 ? Number(variant.quantity) : 1)
          const response = await fetch(`${API_URL}/api/product/stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: product._id, variantUnit: variant.unit, quantity }),
          })
          const data = await response.json()
          if (data?.success) {
            toast.success(`${variant.unit} marked ${variant.inStock ? 'out of' : 'in'} stock`)
            if (fetchProducts) await fetchProducts()
          } else {
            toast.error(data?.message || 'Failed to update variant stock')
          }
        } catch (error) {
          console.error(error)
          toast.error('Network error while updating variant stock')
        } finally {
          setLoadingId(null)
        }
      }
    } catch (error) {
      console.error(error)

      toast.error(
        'Network error while updating stock'
      )
    } finally {
      setLoadingId(null)
    }
  }

  const deleteProduct = async (product) => {
    const shouldDelete = window.confirm(
      `Delete "${product.name}"?`
    )

    if (!shouldDelete) {
      return
    }

    try {
      setLoadingId(product._id)

      const response = await fetch(
        `${API_URL}/api/product/delete`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify({
            id: product._id,
          }),
        }
      )

      const data = await response.json()

      if (data?.success) {
        toast.success(
          'Product deleted successfully'
        )

        if (fetchProducts) {
          await fetchProducts()
        }
      } else {
        toast.error(
          data?.message ||
            'Failed to delete product'
        )
      }
    } catch (error) {
      console.error(error)

      toast.error(
        'Network error while deleting product'
      )
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="no-scrollbar min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-[#fbf7f0]">
      <div className="mx-auto w-full max-w-[1400px] min-w-0 p-2.5 sm:p-5 md:p-10">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1f1e1c] sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-[#8a8079]">
            Manage your product inventory,
            pricing and availability.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-3 grid grid-cols-4 gap-1 sm:mb-6 sm:gap-4">
          <StatCard
            icon="🛍️"
            label="Total products"
            value={stats.total}
            caption="All active products"
          />

          <StatCard
            icon="⬇️"
            label="In stock"
            value={stats.lowStock}
            caption="Require attention"
            tone="amber"
          />

          <StatCard
            icon="⨯"
            label="Out of stock"
            value={stats.outOfStock}
            caption="Not available"
            tone="red"
          />

          <StatCard
            icon="🗂️"
            label="Categories"
            value={stats.categories}
            caption="Product groups"
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-3 flex flex-col items-stretch gap-2 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a9a09b]">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search products..."
              className="w-full min-w-0 rounded-xl border border-[#d9cfc4] bg-white py-2.5 pl-10 pr-2 text-xs text-[#2a2724] outline-none transition placeholder:text-[#8a8079] focus:border-[#f1683a] sm:pr-4 sm:text-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(
                event.target.value
              )

              setPage(1)
            }}
            className="w-full rounded-xl border border-[#d9cfc4] bg-white px-4 py-2.5 text-sm text-[#2a2724] outline-none transition focus:border-[#f1683a] sm:w-auto"
          >
            <option value="all">
              All categories
            </option>

            {editCategoryOptions.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={() =>
              navigate(ADD_PRODUCT_ROUTE)
            }
            className="inline-flex w-fit self-end items-center justify-center gap-1.5 rounded-lg bg-[#f1683a] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(241,104,58,0.22)] transition hover:bg-[#e95d2f] sm:ml-auto sm:self-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span>+</span>
            Add product
          </button>
        </div>

        {/* Mobile product cards */}
        <div className="space-y-3 md:hidden">
          {paginated.map((product) => (
            <article key={product._id} className="rounded-xl border border-[#eadfd5] bg-white p-2.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#eadfd5] bg-[#f6f0ec]">
                  <img src={product.image?.[0] || assets.upload_area} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#2a2724]">{product.name}</h2>
                  <p className="mt-1 truncate text-xs text-[#8a8079]">{Array.isArray(product.category) ? product.category.join(', ') : product.category}</p>
                  {product.sku && <p className="mt-1 text-[11px] text-[#a9a09b]">SKU: {product.sku}</p>}
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-lg bg-[#fdfaf8] p-2 text-[11px]">
                <div><p className="text-[#8a8079]">MRP</p><p className="mt-0.5 font-semibold text-[#2a2724]">{currency}{product.price}</p></div>
                <div><p className="text-[#8a8079]">Offer price</p><p className="mt-0.5 font-semibold text-primary">{currency}{product.offerPrice}</p></div>
                <div className="min-w-0">
                  <p className="truncate text-[#8a8079]">Stock</p>
                  {Array.isArray(product.variants) && product.variants.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                    {product.variants.map((variant) => (
                      <button key={variant.unit} type="button" onClick={() => toggleVariantStock(product, variant)} disabled={loadingId === `${product._id}-${variant.unit}`} className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium disabled:opacity-60 ${variant.inStock ? 'border-[#b8e8cd] bg-[#e8f7ef] text-[#218b52]' : 'border-[#e0d6cf] bg-[#f3eeea] text-[#8a8079]'}`}>
                        {variant.unit}: {variant.inStock ? 'On' : 'Off'}
                      </button>
                    ))}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1.5">
                    <button type="button" aria-label="Toggle stock status" onClick={() => toggleStock(product)} disabled={loadingId === product._id} className={`stock-toggle relative block h-5 w-8 min-h-0 shrink-0 rounded-full p-0 transition disabled:opacity-60 ${product.inStock ? 'bg-[#f1683a]' : 'bg-[#d8cfc8]'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${product.inStock ? 'left-3.5' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-[9px] font-medium ${product.inStock ? 'text-[#218b52]' : 'text-[#8a8079]'}`}>
                      {product.inStock ? 'On' : 'Off'}
                    </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2.5 flex gap-2 border-t border-[#eee3d8] pt-2.5">
                <button type="button" onClick={() => startEdit(product)} className="product-action-button min-h-0 flex-1 rounded border border-[#d9cfc4] px-1.5 py-0.5 text-[9px] font-medium leading-4 text-[#2a2724]">Edit</button>
                <button type="button" disabled={loadingId === product._id} onClick={() => deleteProduct(product)} className="product-action-button min-h-0 flex-1 rounded border border-[#f3c9c9] bg-[#fdecec] px-1.5 py-0.5 text-[9px] font-medium leading-4 text-[#d33] disabled:opacity-60">Delete</button>
              </div>
            </article>
          ))}
          {paginated.length === 0 && <div className="rounded-2xl border border-dashed border-[#eadfd5] bg-white px-4 py-10 text-center text-sm text-[#a9a09b]">No products match your filters.</div>}
        </div>

        {/* Desktop product table */}
        <div className="hidden overflow-x-auto rounded-[18px] border border-[#eadfd5] bg-white md:block">
          <table className="w-full min-w-[760px] table-fixed">
            <thead className="bg-[#fdfaf8] text-left text-sm text-[#5a514d]">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  Product
                </th>

                <th className="px-4 py-3 font-semibold">
                  Category
                </th>

                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  MRP ({currency})
                </th>

                <th className="px-4 py-3 font-semibold">
                  Offer price ({currency})
                </th>

                <th className="px-4 py-3 font-semibold">
                  In Stock
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-sm text-[#4f4845]">
              {paginated.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-[#eee3d8]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#eadfd5] bg-[#f6f0ec]">
                        <img
                          src={
                            product.image?.[0] ||
                            assets.upload_area
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#2a2724]">
                          {product.name}
                        </p>

                        {product.brand && (
                          <p className="text-xs text-[#8a8079]">
                            {product.brand}
                          </p>
                        )}

                        {product.sku && (
                          <p className="text-xs text-[#a9a09b]">
                            SKU: {product.sku}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                  </td>

                  <td className="hidden px-4 py-3 md:table-cell">
                    {currency}
                    {product.price}
                  </td>

                  <td className="px-4 py-3">
                    {currency}
                    {product.offerPrice}
                  </td>

                  <td className="px-4 py-3">
                    {Array.isArray(product.variants) && product.variants.length ? (
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.unit}
                            type="button"
                            role="switch"
                            aria-checked={Boolean(variant.inStock)}
                            disabled={loadingId === `${product._id}-${variant.unit}`}
                            onClick={() => toggleVariantStock(product, variant)}
                            className={`rounded-lg border px-2 py-1 text-xs font-medium transition disabled:opacity-60 ${
                              variant.inStock
                                ? 'border-[#b8e8cd] bg-[#e8f7ef] text-[#218b52]'
                                : 'border-[#e0d6cf] bg-[#f3eeea] text-[#8a8079]'
                            }`}
                          >
                            {variant.unit}: {variant.inStock ? 'In stock' : 'Out'}
                          </button>
                        ))}
                      </div>
                    ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-label={`Change stock status for ${product.name}`}
                      aria-checked={
                        Boolean(product.inStock)
                      }
                      disabled={
                        loadingId === product._id
                      }
                      onClick={() =>
                        toggleStock(product)
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        product.inStock
                          ? 'bg-[#f1683a]'
                          : 'bg-[#d8cfc8]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          product.inStock
                            ? 'left-6'
                            : 'left-1'
                        }`}
                      />
                    </button>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(product)
                        }
                        className="rounded-lg border border-[#d9cfc4] bg-white px-3 py-1.5 text-xs font-medium text-[#2a2724] transition hover:border-[#f1683a] hover:text-[#f1683a]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          loadingId === product._id
                        }
                        onClick={() =>
                          deleteProduct(product)
                        }
                        className="rounded-lg border border-[#f3c9c9] bg-[#fdecec] px-3 py-1.5 text-xs font-medium text-[#d33] transition hover:bg-[#ffe0e0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-[#a9a09b]"
                  >
                    No products match your
                    filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8a8079]">
            <p>
              Showing{' '}
              {(currentPage - 1) *
                pageSize +
                1}{' '}
              to{' '}
              {(currentPage - 1) *
                pageSize +
                paginated.length}{' '}
              of {filtered.length} products
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((previousPage) =>
                    Math.max(
                      1,
                      previousPage - 1
                    )
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9cfc4] bg-white text-[#2a2724] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {getPageNumbers(
                currentPage,
                totalPages
              ).map(
                (
                  pageNumber,
                  index,
                  pageNumbers
                ) => (
                  <React.Fragment
                    key={pageNumber}
                  >
                    {index > 0 &&
                      pageNumbers[index - 1] !==
                        pageNumber - 1 && (
                        <span className="px-1 text-[#c9bfb2]">
                          …
                        </span>
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        setPage(pageNumber)
                      }
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                        pageNumber === currentPage
                          ? 'bg-[#f1683a] text-white'
                          : 'border border-[#d9cfc4] bg-white text-[#2a2724] hover:bg-[#fdfaf8]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </React.Fragment>
                )
              )}

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage((previousPage) =>
                    Math.min(
                      totalPages,
                      previousPage + 1
                    )
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9cfc4] bg-white text-[#2a2724] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(event.target.value)
                  )

                  setPage(1)
                }}
                className="rounded-lg border border-[#d9cfc4] bg-white px-2 py-1.5 text-sm text-[#2a2724] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size} / page
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                cancelEdit()
              }
            }}
          >
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#eadfd5] bg-[#fffaf5] p-4 shadow-[0_24px_70px_rgba(31,30,28,0.22)] sm:p-6 md:p-7">
              {/* Modal Header */}
              <div className="mb-5 flex items-start justify-between border-b border-[#eadfd5] pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#1f1e1c]">
                    Edit product
                  </h3>

                  <p className="mt-1 text-sm text-[#8a8079]">
                    Update product information
                    and pricing
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEdit}
                  aria-label="Close edit product form"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6f655f] transition hover:bg-[#f3e8df]"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-[#1f1e1c]">
                  Product information
                </h4>

                {/* Product Name */}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                  Product name

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter product name"
                    className="rounded-xl border border-[#d9cfc4] bg-white p-3 text-sm font-normal outline-none transition focus:border-[#f1683a] focus:ring-2 focus:ring-[#f1683a]/10"
                  />
                </label>

                {/* Description */}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                  Description

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description:
                          event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Enter product description"
                    className="resize-none rounded-xl border border-[#d9cfc4] bg-white p-3 text-sm font-normal outline-none transition focus:border-[#f1683a] focus:ring-2 focus:ring-[#f1683a]/10"
                  />
                </label>

                {/* Category and Brand */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                    Category

                    <CategoryMultiSelect
                      value={form.category}
                      options={editCategoryOptions}
                      compact
                      onChange={(category) =>
                        setForm({
                          ...form,
                          category,
                        })
                      }
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                    Brand name

                    <input
                      type="text"
                      value={form.brand}
                      list="product-brand-options"
                      onChange={(event) =>
                        setForm({
                          ...form,
                          brand:
                            event.target.value,
                        })
                      }
                      placeholder="Enter brand name"
                      className="rounded-xl border border-[#d9cfc4] bg-white p-3 text-sm font-normal outline-none transition focus:border-[#f1683a]"
                    />

                    <datalist id="product-brand-options">
                      {brandOptions.map(
                        (brand) => (
                          <option
                            key={brand}
                            value={brand}
                          />
                        )
                      )}
                    </datalist>
                  </label>
                </div>

                {/* Weight and Unit */}
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                  Unit / Weight

                  <div className="grid grid-cols-[1fr_140px] gap-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.weight}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          weight:
                            event.target.value,
                        })
                      }
                      placeholder="Enter weight"
                      className="min-w-0 rounded-xl border border-[#d9cfc4] bg-white p-3 text-sm font-normal outline-none transition focus:border-[#f1683a]"
                    />

                    <select
                      value={form.unit}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          unit:
                            event.target.value,
                        })
                      }
                      className="rounded-xl border border-[#d9cfc4] bg-white p-3 text-sm font-normal outline-none transition focus:border-[#f1683a]"
                    >
                      {UNIT_OPTIONS.map(
                        (unit) => (
                          <option
                            key={unit}
                            value={unit}
                          >
                            {unit}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </label>

                {/* Pricing */}
                <div className="mt-1 border-t border-[#eadfd5] pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-[#1f1e1c]">
                    Pricing
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* MRP */}
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                      MRP (incl. of all taxes)

                      <div className="flex overflow-hidden rounded-xl border border-[#d9cfc4] bg-white focus-within:border-[#f1683a] focus-within:ring-2 focus-within:ring-[#f1683a]/10">
                        <span className="flex items-center border-r border-[#eadfd5] px-3 text-[#8a8079]">
                          {currency}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              price:
                                event.target.value,
                            })
                          }
                          placeholder="0.00"
                          className="min-w-0 flex-1 p-3 text-sm font-normal outline-none"
                        />
                      </div>
                    </label>

                    {/* Offer Price */}
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3f3935]">
                      Offer price

                      <div className="flex overflow-hidden rounded-xl border border-[#d9cfc4] bg-white focus-within:border-[#f1683a] focus-within:ring-2 focus-within:ring-[#f1683a]/10">
                        <span className="flex items-center border-r border-[#eadfd5] px-3 text-[#8a8079]">
                          {currency}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.offerPrice}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              offerPrice:
                                event.target.value,
                            })
                          }
                          placeholder="0.00"
                          className="min-w-0 flex-1 p-3 text-sm font-normal outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  
                </div>

                {/* Buttons */}
                <div className="mt-1 flex justify-end gap-3 border-t border-[#eadfd5] pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl border border-[#d9cfc4] bg-white px-5 py-2.5 text-sm font-medium text-[#2a2724] transition hover:bg-[#fdfaf8]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      submitEdit(editing)
                    }
                    disabled={
                      loadingId === editing
                    }
                    className="rounded-xl bg-[#f1683a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(241,104,58,0.22)] transition hover:bg-[#e95d2f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingId === editing
                      ? 'Saving...'
                      : 'Save changes'}
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