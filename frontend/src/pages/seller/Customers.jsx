import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/user/customers`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setCustomers(data.customers || [])
        else setMessage(data.message || 'Unable to load customers')
      })
      .catch(() => setMessage('Unable to load customers'))
  }, [])

  return (
    <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-10">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-[#1f1e1c] sm:text-3xl">Customers</h1>
        <p className="mt-1 text-[#8a8079]">View customers registered on your store.</p>
      </div>
      {message && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{message}</p>}
      <div className="overflow-hidden rounded-2xl border border-[#eadfd5] bg-[#fdfaf8]">
        <div className="hidden grid-cols-[1.3fr_1fr_1.2fr] gap-4 border-b border-[#eadfd5] px-5 py-4 text-sm font-semibold text-[#5f5751] sm:grid">
          <span>Customer</span><span>Phone</span><span>Email</span>
        </div>
        {customers.length ? customers.map((customer) => (
          <div key={customer._id} className="grid gap-2 border-b border-[#eadfd5] px-3 py-3 text-sm text-[#5f5751] last:border-0 sm:grid-cols-[1.3fr_1fr_1.2fr] sm:gap-4 sm:px-5 sm:py-4">
            <span className="flex items-center gap-2 font-medium text-[#2a2724]"><Users size={17} className="text-primary" />{customer.name}</span>
            <span><span className="mr-2 text-xs text-[#8a8079] sm:hidden">Phone:</span>{customer.phone || '—'}</span>
            <span className="break-all"><span className="mr-2 text-xs text-[#8a8079] sm:hidden">Email:</span>{customer.email || '—'}</span>
          </div>
        )) : <p className="p-8 text-center text-[#8a8079]">No registered customers found.</p>}
      </div>
    </main>
  )
}

export default Customers
