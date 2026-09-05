import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MyOrders = () => {

  const [myOrders, setMyOrders] = useState([])
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const { currency } = useAppContext()

  const fetchOrders = async ()=>{
      try{
        const res = await fetch(`${API_URL}/api/order/user`, { credentials: 'include' });
        const data = await res.json();
        if(data && data.success){
          setMyOrders(data.orders || []);
        } else {
          setMyOrders([]);
        }
      }catch(err){
        setMyOrders([]);
        toast.error('Failed to load orders');
      }
  }

  useEffect(()=>{
    fetchOrders();
  },[])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingOrder(orderId);
      const res = await fetch(`${API_URL}/api/order/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Order cancelled');
        await fetchOrders();
      } else {
        toast.error(data?.message || 'Unable to cancel order');
      }
    } catch (err) {
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  }

  const getStatusDetails = (status) => {
    if (status === 'Delivered') {
      return { label: 'Arrived', color: 'border-green-500 bg-green-100', dot: 'bg-green-500' }
    }
    if (status === 'Cancelled') {
      return { label: 'Cancelled', color: 'border-red-500 bg-red-100', dot: 'bg-red-500' }
    }
    return { label: 'Arriving', color: 'border-gray-300 bg-gray-100', dot: 'bg-gray-400' }
  }

  return (
    <div className='mt-12 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {myOrders.length === 0 ? (
        <div className='text-center py-10 border border-gray-300 rounded-lg'>
          <p className='text-gray-500 text-lg'>No orders found</p>
        </div>
      ) : (
        myOrders.map((order, index) => (
          <div key={index} className='mb-7 rounded-2xl border border-gray-300 bg-[#fdfaf6] px-5 py-3 shadow-sm md:px-7'>
            {(() => {
              const status = getStatusDetails(order.status)
              const firstItem = (Array.isArray(order.items) ? order.items : [])[0]
              const prod = firstItem?.product || {}
              const productImages = prod.images || prod.image || []
              const imgSrc = productImages[0] || assets.upload_area
              const name = prod.name || 'Product'
              const category = Array.isArray(prod.category) ? prod.category.join(', ') : (prod.category || 'N/A')
              const qty = firstItem?.quantity || 1
              const unitPrice = prod.offerPrice || firstItem?.price || 0
              return (
            <div className='grid grid-cols-1 items-start gap-4 text-lg text-gray-800 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_0.8fr_0.7fr_auto] lg:gap-8'>
              <div>
                <p>Order ID :</p>
                <div className='mt-5 flex items-center gap-3'>
                  <div className='flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-lg bg-[#f8e9dc] p-3'>
                    <img src={imgSrc} alt="" className='h-full w-full object-contain' />
                  </div>
                  <div className='min-w-0'>
                    <h2 className='text-xl font-semibold text-gray-800'>{name}</h2>
                    <p className='truncate text-base text-gray-400'>Category: {category}</p>
                  </div>
                </div>
              </div>
              <div>
                <p>Payment: {order.paymentType}</p>
                <div className='mt-5'>
                  <p>Quantity: {qty}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p>Total Amount</p>
                <p className='mt-5 whitespace-nowrap font-bold'>Amount: {currency}{order.amount}</p>
              </div>
              <div className='flex flex-col items-center'>
                <p className='text-center'>Status</p>
                <span className='mt-5 text-center text-lg leading-none'>{status.label}</span>
                <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full border-[3px] ${status.color}`}>
                  <span className={`h-3 w-3 rounded-full ${status.dot}`} />
                </span>
              </div>
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <button
                  type='button'
                  onClick={() => cancelOrder(order._id)}
                  disabled={cancellingOrder === order._id}
                  className='mt-9 rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-lg text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
              )
            })()}

            {(Array.isArray(order.items) ? order.items : []).slice(1).map((item, index) => {
              const prod = item && item.product ? item.product : {};
              const productImages = prod.images || prod.image || [];
              const imgSrc = productImages[0] || assets.upload_area;
              const name = prod.name || 'Product';
              const category = Array.isArray(prod.category) ? prod.category.join(', ') : (prod.category || 'N/A');
              const unitPrice = prod.offerPrice ? prod.offerPrice : (item.price || 0);
              const qty = item.quantity || 1;
              return (
                <div key={index} className={`mt-4 grid grid-cols-1 items-center gap-4 border-t border-gray-200 pt-4 text-gray-500/80 md:grid-cols-[1.5fr_0.8fr_0.8fr] md:gap-8`}>
                  <div className='flex items-center'>
                    <div className='flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-lg bg-primary/10 p-3'>
                      <img
                        src={imgSrc}
                        alt=""
                        className='h-full w-full object-contain'
                      />
                    </div>

                    <div className='ml-4'>
                      <h2 className='text-lg font-semibold text-gray-800'>
                        {name}
                      </h2>
                      <p className='line-clamp-1 text-sm text-gray-400'>Category: {category}</p>
                    </div>
                  </div>

                  <div className='flex flex-col justify-center'>
                    <p>Quantity: {qty}</p>
                    <p>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className='text-lg font-bold text-gray-800'>
                    Amount: {currency}
                    {unitPrice * qty}
                  </p>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}

export default MyOrders