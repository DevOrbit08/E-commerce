import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Orders = () => {
  const {currency} = useAppContext()
  const [orders, setOrders] = useState([])

  const fetchOrders = async () =>{
    try {
      const response = await fetch(`${API_URL}/api/order/seller`, { credentials: 'include' });
      const data = await response.json();

      if (data?.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        toast.error(data?.message || 'Unable to load orders');
      }
    } catch {
      setOrders([]);
      toast.error('Unable to load orders');
    }
  };

  useEffect(()=>{
    fetchOrders();
  },[])

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
    <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders.length === 0 ? (
                <p className="rounded-md border border-gray-300 p-5 text-sm text-black/60">No orders found.</p>
            ) : orders.map((order) => (
                <div key={order._id} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 ">
                    <div className="min-w-0 md:max-w-80">
                        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-black/50">Products ordered</p>
                        <div>
                            {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                                <div key={index} className="mb-3 flex flex-col last:mb-0">
                                    <p className="font-semibold text-black/80">
                                        {item.product?.name || 'Product'} {" "}
                                        <span className="text-primary">x {item.quantity}</span>
                                    </p>
                                    <p className="text-sm text-black/50">
                                        {Array.isArray(item.product?.category)
                                            ? item.product.category.join(', ')
                                            : 'Category unavailable'}
                                    </p>
                                    <p className="text-sm text-black/60">
                                        Unit price: {currency}{item.product?.offerPrice || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm md:text-base text-black/60">
                        <p className='text-black/80'>{order.address?.firstName} {order.address?.lastName}</p>

                        <p>{order.address?.street}, {order.address?.city}</p>
                        <p>{order.address?.state}, {order.address?.zipcode}, {order.address?.country}</p>
                        <p>{order.address?.phone}</p>
                    </div>

                    <p className="font-medium text-lg my-auto ">{currency}{order.amount}</p>

                    <div className="flex flex-col text-sm mg:text-base text-black/60">
                        <p>Method: {order.paymentType}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                    </div>
                </div>
            ))}
        </div> 
        </div>
  )
}

export default Orders
