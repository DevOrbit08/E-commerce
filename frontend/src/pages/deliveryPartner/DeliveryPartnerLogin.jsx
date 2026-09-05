import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DeliveryPartnerLogin = () => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [partner, setPartner] = useState(null)

  useEffect(() => {
    const savedPartner = sessionStorage.getItem('deliveryPartner')
    if (!savedPartner) return
    fetch(`${API_URL}/api/delivery-partner/is-auth`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.setItem('deliveryPartner', JSON.stringify(data.partner))
          setPartner(data.partner)
        } else {
          sessionStorage.removeItem('deliveryPartner')
        }
      })
      .catch(() => sessionStorage.removeItem('deliveryPartner'))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      })
      const data = await response.json()
      if (!data.success) {
        toast.error(data.message || 'Unable to login')
        return
      }
      sessionStorage.setItem('deliveryPartner', JSON.stringify(data.partner))
      setPartner(data.partner)
      toast.success('Login successful')
    } catch (error) {
      toast.error(error.message || 'Unable to login')
    }
  }

  if (partner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f2ec] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-semibold">Welcome, {partner.name}</h1>
          <p className="mt-2 text-gray-500">You are logged in as a delivery partner.</p>
          <button onClick={() => { sessionStorage.removeItem('deliveryPartner'); setPartner(null); navigate('/delivery-partner') }} className="mt-6 rounded-xl border border-red-200 px-6 py-3 text-red-500">Logout</button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ec] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">Delivery Partner Login</h1>
        <label className="mb-4 block text-sm font-medium">Email / Phone Number
          <input required type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-2 w-full rounded-xl border p-3 outline-primary" placeholder="Enter your email or phone number" />
        </label>
        <label className="mb-6 block text-sm font-medium">Password
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border p-3 outline-primary" placeholder="Enter your password" />
        </label>
        <button className="w-full rounded-xl bg-primary py-3 font-medium text-white">Login</button>
      </form>
    </main>
  )
}

export default DeliveryPartnerLogin
