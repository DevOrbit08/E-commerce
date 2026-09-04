import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { PRODUCT_CATEGORIES } from '../constants/productCategories'

const AllProducts = () => {
  const { products, searchQuery } = useAppContext()
  const [selectedCategory, setSelectedCategory] = useState('All categories')
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    const query = typeof searchQuery === 'string' ? searchQuery.trim().toLowerCase() : ''
    setFilteredProducts(products.filter((product) => {
      const matchesSearch = !query || product.name?.toLowerCase().includes(query)
      const matchesCategory = selectedCategory === 'All categories' || (Array.isArray(product.category) ? product.category.includes(selectedCategory) : product.category === selectedCategory)
      return product.inStock && matchesSearch && matchesCategory
    }))
  }, [products, searchQuery, selectedCategory])

  return (
    <div className='mt-16'>
      <div className='mb-8'>
        <p className='text-2xl font-medium uppercase md:text-3xl'>
          {selectedCategory === 'All categories' ? 'All Products' : selectedCategory}
        </p>
        <div className='mt-1 h-0.5 w-16 rounded-full bg-primary'></div>
      </div>

      <div className='grid gap-8 lg:grid-cols-[240px_1fr]'>
        <aside className='h-fit max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 lg:sticky lg:top-6'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='font-semibold text-primary'>Categories</h2>
            <span className='text-xs text-primary'>⌃</span>
          </div>
          <div
            className='category-list-scroll max-h-[calc(100vh-13rem)] space-y-1 overflow-y-auto rounded-lg bg-orange-50 p-2 pr-1'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              type='button'
              onClick={() => setSelectedCategory('All categories')}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedCategory === 'All categories' ? 'bg-orange-50 font-medium text-primary' : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              <span>All categories</span>
            </button>
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category}
                type='button'
                onClick={() => setSelectedCategory(category)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedCategory === category ? 'bg-orange-50 font-medium text-primary' : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>
          <style>{`
            .category-list-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </aside>

        <section>
          <div className='mb-4 flex items-center justify-between'>
            <p className='text-sm text-gray-500'>
              Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5'>
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!filteredProducts.length && (
            <div className='rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500'>
              No products found in this category.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AllProducts
