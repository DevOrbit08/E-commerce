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
        <header className="fixed inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5 sm:h-[68px] sm:px-5 sm:py-4 md:h-[65px] md:px-10">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 sm:text-xl">Delivery Partner Portal</p>
            <span className="block truncate text-[11px] text-gray-500 sm:hidden">Hi, {partner.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden max-w-48 truncate text-sm text-gray-500 sm:block">Hi, {partner.name}</span>
            <button
              onClick={() => { sessionStorage.removeItem('deliveryPartner'); setPartner(null); navigate('/delivery-partner') }}
              className="delivery-logout flex h-5 min-h-0 items-center gap-0.5 rounded border border-red-200 px-1 text-[8px] text-red-500 hover:bg-red-50 sm:gap-1 sm:px-2 sm:text-[10px]"
            >
              <LogOut size={9} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="flex min-h-screen flex-col pt-[54px] sm:pt-[68px] md:flex-row md:pt-[65px]">
          <aside className="w-full shrink-0 border-b border-gray-200 bg-white p-2 md:fixed md:inset-y-auto md:top-[65px] md:bottom-0 md:z-10 md:w-64 md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 md:mb-4 md:px-3 md:text-xs">Dashboard</p>
            <nav className="grid grid-cols-3 gap-1.5 md:block md:space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-center text-[10px] font-medium leading-tight transition sm:text-xs md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-4 md:py-3 md:text-sm md:text-left ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {React.createElement(item.icon, { size: 19, className: 'shrink-0' })}
                  <span className="break-words">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <section className="min-w-0 flex-1 p-2.5 sm:p-5 md:ml-64 md:p-10">
            <Outlet />
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ec] px-4 py-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-8">
        <h1 className="mb-5 text-xl font-semibold text-gray-800 sm:mb-6 sm:text-2xl">Delivery Partner Login</h1>
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
