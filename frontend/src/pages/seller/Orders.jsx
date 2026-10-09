import { useCallback, useEffect, useState } from 'react'
import { MapPin, Package, Phone, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'
import OrderStatusTracker from '../../components/OrderStatusTracker'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const nextStatus = {
  'Order Placed': { value: 'Processing', label: 'Start processing' },
}

const Orders = () => {
  const { currency } = useAppContext()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  const fetchOrders = useCallback(async (notifyFailure = true) => {
    try {
      const response = await fetch(`${API_URL}/api/order/seller`, { credentials: 'include' })
      const data = await response.json()
      if (data?.success) {
        setOrders(data.orders || [])
      } else {
        if (notifyFailure) toast.error(data?.message || 'Unable to load orders')
      }
    } catch {
      if (notifyFailure) toast.error('Unable to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = window.setInterval(() => fetchOrders(false), 15000)
    return () => window.clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (order) => {
    const transition = nextStatus[order.status || 'Order Placed']
    if (!transition) return

    try {
      setUpdatingOrder(order._id)
      const response = await fetch(`${API_URL}/api/order/seller/${order._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: transition.value }),
      })
      const data = await response.json()
      if (!data?.success) {
        toast.error(data?.message || 'Unable to update order status')
        return
      }
      setOrders((current) => current.map((item) => (
        item._id === order._id ? { ...item, status: data.order?.status || transition.value } : item
      )))
      toast.success(`Order ${transition.value.toLowerCase()}`)
    } catch {
      toast.error('Unable to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  return (
    <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto">
      <div className="space-y-5 p-3 sm:p-5 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Review orders and keep their delivery status up to date.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Package className="mx-auto text-gray-400" size={32} />
            <p className="mt-3 font-medium text-gray-700">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">New customer orders will appear here.</p>
          </div>
        ) : orders.map((order) => {
          const address = order.address || {}
          const transition = nextStatus[order.status || 'Order Placed']
          return (
            <article key={order._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#fffaf6] px-4 py-3 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Order ID</p>
                  <p className="mt-0.5 font-semibold text-gray-800">#{order._id?.slice(-8).toUpperCase()}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable'}
                </p>
              </header>

              <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-5">
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Items ordered</h2>
                    <div className="space-y-3">
                      {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                        <div key={item._id || `${item.product?._id}-${index}`} className="flex min-w-0 items-start justify-between gap-3 rounded-xl bg-[#faf8f5] p-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">{item.product?.name || 'Product'}</p>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {Array.isArray(item.product?.category) ? item.product.category.join(', ') : item.product?.category || 'Category unavailable'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-primary">× {item.quantity}</p>
                            <p className="text-sm text-gray-500">{currency}{item.product?.offerPrice || 0} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-100 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin size={16} className="text-primary" />
                      Delivery address
                    </div>
                    <p className="font-medium text-gray-800">{address.firstName} {address.lastName}</p>
                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      {[address.street, address.city, address.state, address.zipcode, address.country].filter(Boolean).join(', ') || 'Address unavailable'}
                    </p>
                    {address.phone && (
                      <a href={`tel:${address.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Phone size={14} />{address.phone}
                      </a>
                    )}
                  </section>
                </div>

                <aside className="flex min-w-0 flex-col rounded-xl border border-gray-200 bg-[#fffaf6] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-800">Order progress</h2>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                      {order.status || 'Order Placed'}
                    </span>
                  </div>
                  <div className="mt-5">
                    <OrderStatusTracker status={order.status || 'Order Placed'} />
                  </div>

                  <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                  {order.status === 'Delivered' && order.deliveredBy && (
                    <div className="flex justify-between gap-3 text-gray-500">
                      <span>Delivered by</span>
                      <span className="text-right font-medium text-gray-700">
                        {order.deliveredBy.name}
                        {order.deliveredBy.phone ? ` · ${order.deliveredBy.phone}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 text-gray-500">
                      <span>Payment method</span><span className="font-medium text-gray-700">{order.paymentType || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-gray-500">
                      <span>Payment status</span><span className={`font-medium ${order.isPaid ? 'text-green-700' : 'text-amber-700'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-gray-200 pt-3 text-base font-semibold text-gray-800">
                      <span>Total</span><span>{currency}{order.amount || 0}</span>
                    </div>
                  </div>

                  {transition && (
                    <button
                      type="button"
                      onClick={() => updateStatus(order)}
                      disabled={updatingOrder === order._id}
                      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingOrder === order._id && <RefreshCw size={15} className="animate-spin" />}
                      {updatingOrder === order._id ? 'Updating...' : transition.label}
                    </button>
                  )}
                </aside>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
