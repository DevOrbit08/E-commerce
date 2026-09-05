import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SellerLogin = () => {
  const {isSeller, setIsSeller, navigate} = useAppContext()
  const[identifier, setIdentifier] = useState("");
  const[password, setPassword] = useState("");

  const onSubmitHandler = async (event)=>{
    event.preventDefault();
    try{
      const res = await fetch(`${API_URL}/api/seller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });
      const data = await res.json();
      if(data && data.success){
        setIsSeller(true)
        toast.success('Seller logged in')
      } else {
        toast.error((data && data.message) || 'Invalid credentials')
      }
    }catch(err){
      toast.error(err.message || 'Network error')
    }
  }

  useEffect(()=>{
    if(isSeller){
      navigate("/seller")
    }
  },[isSeller])

  return !isSeller && (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600'>

       <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounsed-lg shadow-xl border border-gray-200'>
        <p className='text-2xl font-medium m-auto'><span className='text-primary'>Seller</span> Login</p>
        <div className='w-full'>
          <p>Email / Phone Number</p>
          <input onChange={(e)=>setIdentifier(e.target.value)} value={identifier}
          type="text" placeholder="Enter your email or phone number"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"/>
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e)=>setPassword(e.target.value)} value={password}
          type="password"  placeholder="Enter Your Password"
           className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"/>
        </div>
        <button className="bg-primary tetx-white w-full py-2 rounded-md cursor-pointer">Login</button>
       </div>

    </form>
  )
}

export default SellerLogin
