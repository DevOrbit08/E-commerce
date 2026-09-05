import React, { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicle: '', password: '' })
  const [editingPartner, setEditingPartner] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', vehicle: '', newPassword: '', confirmPassword: '' })

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
      setForm({ name: '', phone: '', email: '', vehicle: '', password: '' })
      fetchPartners().catch((error) => toast.error(error.message || 'Unable to refresh delivery partners'))
    } catch (error) {
      toast.error(error.message || 'Unable to add delivery partner')
    }
  }

  const removePartner = async (partner) => {
    if (!window.confirm(`Remove ${partner.name}'s login credentials?`)) return
    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/remove/${partner._id}`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }))
      if (!response.ok || !data.success) {
        toast.error(data.message || 'Unable to remove delivery partner')
        return
      }
      setPartners((currentPartners) => currentPartners.filter((item) => item._id !== partner._id))
      toast.success('Delivery partner credentials removed')
    } catch (error) {
      toast.error(error.message || 'Unable to remove delivery partner')
    }
  }

  const startEditing = (partner) => {
    setEditingPartner(partner)
    setEditForm({
      name: partner.name,
      phone: partner.phone,
      email: partner.email,
      vehicle: partner.vehicle || '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const updatePartner = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/${editingPartner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      })
      const data = await response.json()
      if (!data.success) {
        toast.error(data.message || 'Unable to update delivery partner')
        return
      }
      setPartners((currentPartners) => currentPartners.map((partner) => partner._id === data.partner._id ? data.partner : partner))
      setEditingPartner(null)
      toast.success('Delivery partner updated')
    } catch (error) {
      toast.error(error.message || 'Unable to update delivery partner')
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
          ['password', 'Password', true],
        ].map(([key, placeholder, required]) => (
          <input key={key} type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'} required={required} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} className="rounded-xl border border-[#d9cfc4] bg-white p-3 outline-none focus:border-primary" />
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
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => startEditing(partner)} className="rounded-lg border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10">Edit</button>
              <button type="button" onClick={() => removePartner(partner)} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Remove</button>
            </div>
          </div>
        ))}
      </div>
      {editingPartner && (
        <div onClick={() => setEditingPartner(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={updatePartner} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-[#fdfaf8] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#1f1e1c]">Edit Delivery Partner</h2>
              <button type="button" onClick={() => setEditingPartner(null)} className="text-2xl text-[#8a8079]">×</button>
            </div>
            {[
              ['name', 'Full Name', 'text'],
              ['phone', 'Phone Number', 'tel'],
              ['email', 'Email', 'email'],
              ['vehicle', 'Vehicle Details', 'text'],
              ['newPassword', 'Change Password', 'password'],
              ['confirmPassword', 'Confirm Password', 'password'],
            ].map(([key, label, type]) => (
              <label key={key} className="mb-3 block text-sm font-medium text-[#3f3935]">{label}
                <input name={key} type={type} value={editForm[key]} onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })} placeholder={key.includes('Password') ? 'Leave blank to keep current password' : ''} className="mt-1.5 w-full rounded-xl border border-[#d9cfc4] bg-white p-3 outline-none focus:border-primary" />
              </label>
            ))}
            <button className="mt-2 w-full rounded-xl bg-primary py-3 font-medium text-white">Save</button>
          </form>
        </div>
      )}
    </main>
  )
}

export default DeliveryPartners
