import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ProfileOverlay = ({ onClose, onLogout }) => {
  const { user, setUser } = useAppContext()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const saveChanges = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      toast.error('Name and email or phone are required')
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Unable to update profile')
      setUser(data.user)
      toast.success('Profile updated')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <form onSubmit={saveChanges} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-[#fdfaf8] p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#1f1e1c]">My Profile</h2>
          <button type="button" onClick={onClose} className="text-2xl text-[#8a8079]" aria-label="Close profile">×</button>
        </div>
        {[
          ['name', 'Full name', 'text'],
          ['phone', 'Phone number', 'tel'],
          ['email', 'Email address', 'email'],
        ].map(([key, label, type]) => (
          <label key={key} className="mb-4 block text-sm font-medium text-[#3f3935]">
            {label}
            <input type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1.5 w-full rounded-xl border border-[#d9cfc4] bg-white p-3 outline-none focus:border-[#f1683a]" />
          </label>
        ))}
        <button disabled={saving} className="w-full rounded-xl bg-primary py-3 font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button>
        <button type="button" onClick={onLogout} className="mt-3 w-full rounded-xl border border-red-200 py-3 font-medium text-red-500">Logout</button>
      </form>
    </div>
  )
}

export default ProfileOverlay
