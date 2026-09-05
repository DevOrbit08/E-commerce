import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SellerProfileOverlay = ({ profile, onClose, onLogout, onUpdated }) => {
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      newPassword: '',
      confirmPassword: '',
    })
  }, [profile])

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const saveChanges = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/seller/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Unable to update profile')
      onUpdated(data.seller)
      toast.success('Profile updated')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form onSubmit={saveChanges} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-[#fdfaf8] p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#1f1e1c]">Seller Profile</h2>
          <button type="button" onClick={onClose} className="text-2xl text-[#8a8079]" aria-label="Close profile">×</button>
        </div>
        {[
          ['name', 'Full Name', 'text'],
          ['email', 'Email', 'email'],
          ['phone', 'Phone Number', 'tel'],
          ['newPassword', 'Set New Password', 'password'],
          ['confirmPassword', 'Confirm Password', 'password'],
        ].map(([name, label, type]) => (
          <label key={name} className="mb-4 block text-sm font-medium text-[#3f3935]">
            {label}
            <input name={name} type={type} value={form[name]} onChange={updateField} placeholder={name.includes('Password') ? 'Leave blank to keep current password' : ''} className="mt-1.5 w-full rounded-xl border border-[#d9cfc4] bg-white p-3 outline-none focus:border-[#f1683a]" />
          </label>
        ))}
        <button disabled={saving} className="w-full rounded-xl bg-primary py-3 font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
        <button type="button" onClick={onLogout} className="mt-3 w-full rounded-xl border border-red-200 py-3 font-medium text-red-500">Logout</button>
      </form>
    </div>
  )
}

export default SellerProfileOverlay
