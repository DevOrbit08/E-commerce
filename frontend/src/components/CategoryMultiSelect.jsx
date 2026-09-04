import React, { useState } from 'react'

const asCategories = (value) => {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

const CategoryMultiSelect = ({ value, options, onChange, compact = false }) => {
  const [open, setOpen] = useState(false)
  const selected = asCategories(value)

  const toggleCategory = (category) => {
    onChange(
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category]
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border border-[#d9cfc4] bg-white text-left outline-none transition focus:border-[#f1683a] ${compact ? 'p-3 text-sm' : 'px-4 py-3 text-base'}`}
        aria-expanded={open}
      >
        <span className={selected.length ? 'text-[#2a2724]' : 'text-[#a9a09b]'}>
          {selected.length ? selected.join(', ') : 'Select category'}
        </span>
        <span className={`ml-2 text-[#8a8079] transition ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {open && (
        <div className="absolute bottom-full z-20 mb-2 max-h-96 w-full overflow-y-auto rounded-xl border border-[#eadfd5] bg-[#fdfaf8] p-2 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#5f5751] hover:bg-[#fff1ec]">
              <input
                type="checkbox"
                checked={selected.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 accent-[#f1683a]"
              />
              {category}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryMultiSelect
