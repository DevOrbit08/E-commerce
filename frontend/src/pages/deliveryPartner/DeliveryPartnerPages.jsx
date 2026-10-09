import { useCallback, useEffect, useState } from 'react';
import { MapPin, Package, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderStatusTracker from '../../components/OrderStatusTracker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PartnerOrderList = ({ completed = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = completed ? 'Completed Orders' : 'Orders';

  const fetchOrders = useCallback(async () => {
    try {
      const query = completed ? '?status=completed' : '';
      const response = await fetch(`${API_URL}/api/delivery-partner/orders${query}`, { credentials: 'include' });
      const data = await response.json();
      if (data?.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data?.message || 'Unable to load orders');
      }
    } catch {
      toast.error('Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, [completed]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            {completed ? 'Your successfully completed deliveries.' : 'Order details and customer addresses for your deliveries.'}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <Package className="mx-auto text-gray-400" size={32} />
          <p className="mt-3 font-medium text-gray-700">{completed ? 'No completed orders yet' : 'No orders available'}</p>
          <p className="mt-1 text-sm text-gray-500">Orders and their delivery details will appear here.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((order) => {
            const address = order.address || {};
            return (
              <article key={order._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#fffaf6] px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Order ID</p>
                    <p className="mt-0.5 font-semibold text-gray-800">#{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable'}
                  </p>
                </header>

                <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0 space-y-4">
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Items to deliver</h3>
                      <div className="space-y-2">
                        {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                          <div key={item._id || `${item.product?._id}-${index}`} className="flex min-w-0 justify-between gap-3 rounded-xl bg-[#faf8f5] p-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-800">{item.product?.name || 'Product'}</p>
                              <p className="text-sm text-gray-500">
                                {Array.isArray(item.product?.category) ? item.product.category.join(', ') : item.product?.category || 'Category unavailable'}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-semibold text-primary">× {item.quantity}</p>
                              <p className="text-sm text-gray-500">₹{item.product?.offerPrice || 0} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-gray-100 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin size={16} className="text-primary" />Customer & delivery address
                      </h3>
                      <p className="font-medium text-gray-800">
                        {address.firstName} {address.lastName}
                        {order.userId?.name && order.userId.name !== `${address.firstName} ${address.lastName}` && ` (${order.userId.name})`}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        {[address.street, address.city, address.state, address.zipcode, address.country].filter(Boolean).join(', ') || 'Address unavailable'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {address.phone && (
                          <a href={`tel:${address.phone}`} className="inline-flex items-center gap-1.5 font-medium text-primary">
                            <Phone size={14} />{address.phone}
                          </a>
                        )}
                        {(order.userId?.email || address.email) && (
                          <a href={`mailto:${order.userId?.email || address.email}`} className="break-all text-gray-500">
                            {order.userId?.email || address.email}
                          </a>
                        )}
                      </div>
                    </section>
                  </div>

                  <aside className="flex min-w-0 flex-col rounded-xl border border-gray-200 bg-[#fffaf6] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-800">Order progress</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                        {order.status || 'Order Placed'}
                      </span>
                    </div>
                    <div className="mt-5">
                      <OrderStatusTracker status={order.status || 'Order Placed'} />
                    </div>
                    <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                      {completed && order.deliveredBy && (
                        <div className="flex justify-between gap-3 text-gray-500">
                          <span>Delivered by</span>
                          <span className="text-right font-medium text-gray-700">
                            {order.deliveredBy.name}
                            {order.deliveredBy.phone ? ` · ${order.deliveredBy.phone}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between gap-3 text-gray-500">
                        <span>Payment</span><span className="font-medium text-gray-700">{order.paymentType || '—'} · {order.isPaid ? 'Paid' : 'Pending'}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-base font-semibold text-gray-800">
                        <span>Order total</span><span>₹{order.amount || 0}</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PaymentQrCode = () => (
  <svg viewBox="0 0 210 210" className="aspect-square h-64 w-64 max-h-[40vh] max-w-full rounded-lg bg-white p-2" role="img" aria-label="Payment QR code">
    <rect width="210" height="210" fill="white" />
    <path fill="#111827" d="M10 10h60v60H10zM20 20v40h40V20zM32 32h16v16H32zM140 10h60v60h-60zM150 20v40h40V20zM162 32h16v16h-16zM10 140h60v60H10zM20 150v40h40v-40zM32 162h16v16H32zM85 10h15v15H85zM110 10h15v30h-15zM85 35h15v15H85zM105 55h20v15h-20zM80 80h20v20H80zM110 80h15v15h-15zM135 80h15v30h-15zM165 80h20v15h-20zM190 85h10v30h-10zM80 110h15v30H80zM105 110h30v15h-30zM150 115h15v25h-15zM175 120h25v15h-25zM85 150h20v15H85zM115 145h15v30h-15zM140 150h20v15h-20zM170 150h15v15h-15zM90 180h15v20H90zM130 180h30v15h-30zM175 175h25v25h-25z" />
  </svg>
);

export const DeliveryPartnerOrders = () => <PartnerOrderList />;

export const DeliveryPartnerDeliveries = () => {
  const [otp, setOtp] = useState('');
  const [paymentType, setPaymentType] = useState('COD');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isDone, setIsDone] = useState(false);

  const fetchDeliveryOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/orders?status=delivery`, { credentials: 'include' });
      const data = await response.json();
      if (!data?.success) {
        toast.error(data?.message || 'Unable to load delivery orders');
        return;
      }
      const deliveryOrders = data.orders || [];
      setOrders(deliveryOrders);
      setSelectedOrderId((current) => deliveryOrders.some((order) => order._id === current)
        ? current
        : deliveryOrders[0]?._id || '');
    } catch {
      toast.error('Unable to load delivery orders');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryOrders();
  }, [fetchDeliveryOrders]);

  const selectedOrder = orders.find((order) => order._id === selectedOrderId);

  const completeDelivery = async (event) => {
    event.preventDefault();

    if (!selectedOrder) {
      toast.error('Select an order before completing delivery');
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) {
      toast.error('Enter a valid 4 to 6 digit OTP');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/delivery-partner/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Delivered' }),
      });
      const data = await response.json();
      if (!data?.success) {
        toast.error(data?.message || 'Unable to complete delivery');
        return;
      }
      const remainingOrders = orders.filter((order) => order._id !== selectedOrder._id);
      setIsDone(false);
      setOrders(remainingOrders);
      setSelectedOrderId(remainingOrders[0]?._id || '');
      setOtp('');
      toast.success('Delivery marked as completed');
    } catch {
      toast.error('Unable to complete delivery');
    }
  };

  return (
    <div className="flex min-w-0 flex-col md:h-[calc(100dvh-145px)] md:min-h-[560px]">
      <div className="shrink-0">
        <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">Deliveries</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 sm:text-base">Verify the customer OTP and payment to complete a delivery.</p>
      </div>

      <form onSubmit={completeDelivery} className="mt-3 grid min-h-0 w-full flex-1 gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex shrink-0 flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Customer delivery</h3>
              <p className="mt-0.5 text-sm text-gray-500">Confirm the order and enter the customer OTP.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {isDone ? 'Completed' : 'In progress'}
            </span>
          </div>

          <div className="mt-3 min-h-0 rounded-xl border border-gray-200 bg-[#fffaf6] p-3">
            <label htmlFor="delivery-order" className="block text-sm font-medium text-gray-700">Select order</label>
            {loadingOrders ? (
              <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No orders are ready for delivery. Start processing an order from the Orders page first.</p>
            ) : (
              <>
                <select
                  id="delivery-order"
                  value={selectedOrderId}
                  onChange={(event) => {
                    setSelectedOrderId(event.target.value);
                    setIsDone(false);
                    const order = orders.find((item) => item._id === event.target.value);
                    if (order?.paymentType) setPaymentType(order.paymentType === 'COD' ? 'COD' : 'Online');
                  }}
                  disabled={isDone}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary"
                >
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      #{order._id.slice(-8).toUpperCase()} · {order.address?.firstName} {order.address?.lastName} · ₹{order.amount}
                    </option>
                  ))}
                </select>
                {selectedOrder && (
                  <div className="mt-2 grid gap-x-4 gap-y-1 text-sm text-gray-600 sm:grid-cols-2">
                    <p className="truncate font-medium text-gray-800">
                      {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
                      {selectedOrder.address?.phone && ` · ${selectedOrder.address.phone}`}
                    </p>
                    <p className="truncate sm:text-right">{[
                      selectedOrder.address?.street,
                      selectedOrder.address?.city,
                      selectedOrder.address?.state,
                      selectedOrder.address?.zipcode,
                      selectedOrder.address?.country,
                    ].filter(Boolean).join(', ')}</p>
                    <p className="line-clamp-2 sm:col-span-2">
                      {(selectedOrder.items || []).map((item) => `${item.product?.name || 'Product'} × ${item.quantity}`).join(' · ')}
                    </p>
                    <p className="font-semibold text-gray-800">Total: ₹{selectedOrder.amount || 0}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <label className="mt-3 block shrink-0 text-sm font-medium text-gray-700">
            Delivery OTP
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              disabled={isDone}
              placeholder="Enter OTP"
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-primary"
            />
          </label>

          <fieldset className="mt-3 shrink-0">
            <legend className="text-sm font-medium text-gray-700">Payment type</legend>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {['Online', 'COD', 'Card'].map((type) => (
                <label
                  key={type}
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    paymentType === type ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value={type}
                    checked={paymentType === type}
                    onChange={(event) => setPaymentType(event.target.value)}
                    disabled={isDone}
                    className="accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isDone || !selectedOrder || loadingOrders}
            className="mt-3 w-full shrink-0 rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {isDone ? 'Done' : 'Mark as Done'}
          </button>
        </div>

        <aside className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-gray-200 bg-[#fffaf6] p-4 text-center sm:p-5">
          <h3 className="font-semibold text-gray-800">Payment</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            For COD orders, customers can scan to pay online.
          </p>
          <div className="mt-2 max-w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <PaymentQrCode />
          </div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Scan to pay</p>
          <p className="mt-1 text-[11px] text-gray-500">Confirm payment before completing.</p>
        </aside>
      </form>
    </div>
  );
};

export const DeliveryPartnerCompletedOrders = () => <PartnerOrderList completed />;
