import React, { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicle: '' })

  const fetchPartners = async () => {
    const response = await fetch(`${API_URL}/api/delivery-partner/list`, { credentials: 'include' })
    const data = await response.json()
    if (data.success) setPartners(data.partners || [])
    else toast.error(data.message || 'Unable to load delivery partners')
  }

  useEffect(() => { fetchPartners().catch((error) => toast.error(error.message || 'Unable to load delivery partners')) }, [])

  const addPartner = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!data.success) {
        toast.error(data.message || 'Unable to add delivery partner')
        return
      }
      toast.success('Delivery partner added')
      setForm({ name: '', phone: '', email: '', vehicle: '' })
      fetchPartners().catch((error) => toast.error(error.message || 'Unable to refresh delivery partners'))
    } catch (error) {
      toast.error(error.message || 'Unable to add delivery partner')
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-10">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold text-[#1f1e1c]">Delivery Partners</h1>
        <p className="mt-1 text-[#8a8079]">Add and manage delivery partners for your orders.</p>
      </div>
      <form onSubmit={addPartner} className="mb-8 grid gap-3 rounded-2xl border border-[#eadfd5] bg-[#fdfaf8] p-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['name', 'Full name', true],
          ['phone', 'Phone number', true],
          ['email', 'Email address', false],
          ['vehicle', 'Vehicle details', false],
        ].map(([key, placeholder, required]) => (
          <input key={key} type={key === 'email' ? 'email' : 'text'} required={required} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} className="rounded-xl border border-[#d9cfc4] bg-white p-3 outline-none focus:border-primary" />
        ))}
        <button className="rounded-xl bg-primary px-5 py-3 font-medium text-white hover:bg-primary-dull md:col-span-2 xl:col-span-4">Add delivery partner</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <div key={partner._id} className="rounded-2xl border border-[#eadfd5] bg-[#fdfaf8] p-5">
            <div className="flex items-center gap-3"><Truck className="text-primary" /><h2 className="font-semibold text-[#2a2724]">{partner.name}</h2></div>
            <p className="mt-4 text-sm text-[#5f5751]">{partner.phone}</p>
            <p className="text-sm text-[#8a8079]">{partner.email || 'No email provided'}</p>
            <p className="mt-2 text-sm text-[#8a8079]">{partner.vehicle || 'Vehicle details not provided'}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default DeliveryPartners
