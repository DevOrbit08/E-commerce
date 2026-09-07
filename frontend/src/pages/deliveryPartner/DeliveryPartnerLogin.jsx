import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CheckCircle2, ClipboardList, LogOut, Truck } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const navigation = [
  { label: 'Orders', path: '/delivery-partner/orders', icon: ClipboardList },
  { label: 'Deliveries', path: '/delivery-partner/deliveries', icon: Truck },
  { label: 'Completed Orders', path: '/delivery-partner/completed-orders', icon: CheckCircle2 },
]

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
      navigate('/delivery-partner/orders')
    } catch (error) {
      toast.error(error.message || 'Unable to login')
    }
  }

  if (partner) {
    return (
      <main className="min-h-screen bg-[#f7f2ec]">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 md:px-10">
          <h1 className="text-xl font-semibold text-gray-800">Delivery Partner Portal</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">Hi, {partner.name}</span>
            <button
              onClick={() => { sessionStorage.removeItem('deliveryPartner'); setPartner(null); navigate('/delivery-partner') }}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-73px)]">
          <aside className="w-64 border-r border-gray-200 bg-white p-4">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Dashboard</p>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {React.createElement(item.icon, { size: 20 })}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <section className="flex-1 p-5 md:p-10">
            <Outlet />
          </section>
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
