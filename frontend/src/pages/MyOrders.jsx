import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MyOrders = () => {

  const [myOrders, setMyOrders] = useState([])
  const { currency } = useAppContext()

  useEffect(()=>{
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
    fetchOrders();
  },[])

  return (
    <div className='mt-16 pb-16'>
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
          <div
            key={index}
            className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'
          >
            <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col'>
              <span>OrderId : {order._id}</span>
              <span>Payment : {order.paymentType}</span>
              <span>Total Amount : {currency}{order.amount}</span>
            </p>

            {(Array.isArray(order.items) ? order.items : []).map((item, index) => {
              const prod = item && item.product ? item.product : {};
              const imgSrc = (prod.image && prod.image[0]) ? prod.image[0] : assets.upload_area;
              const name = prod.name || 'Product';
              const category = prod.category || 'N/A';
              const unitPrice = prod.offerPrice ? prod.offerPrice : (item.price || 0);
              const qty = item.quantity || 1;
              return (
                <div
                  key={index}
                  className={`relative bg-white text-gray-500/70 ${
                    (Array.isArray(order.items) && order.items.length !== index + 1) ? "border-b" : ""
                  } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}>
                  <div className='flex items-center mb-4 md:mb-0'>
                    <div className='bg-primary/10 p-4 rounded-lg'>
                      <img
                        src={imgSrc}
                        alt=""
                        className='w-16 h-16'
                      />
                    </div>

                    <div className='ml-4'>
                      <h2 className='text-xl font-medium text-gray-800'>
                        {name}
                      </h2>
                      <p>Category: {category}</p>
                    </div>
                  </div>

                  <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                    <p>Quantity: {qty}</p>
                    <p>Status: {order.status}</p>
                    <p>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className='text-primary text-lg font-medium'>
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