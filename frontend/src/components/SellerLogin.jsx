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
    const checkSellerAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/seller/is-auth`, { credentials: 'include' });
        const data = await response.json();
        if (data?.success) {
          setIsSeller(true);
        }
      } catch {
        setIsSeller(false);
      }
    };

    if (isSeller) {
      navigate("/seller");
      return;
    }

    checkSellerAuth();
  },[isSeller, navigate, setIsSeller])

  return !isSeller && (
    <form onSubmit={onSubmitHandler} className='flex min-h-screen items-center px-4 text-sm text-gray-600'>

       <div className='mx-auto flex w-full max-w-md flex-col items-start gap-5 rounded-lg border border-gray-200 p-6 py-10 shadow-xl sm:p-8 sm:py-12'>
        <p className='m-auto text-xl font-medium sm:text-2xl'><span className='text-primary'>Seller</span> Login</p>
        <div className='w-full'>
          <p>Email / Phone Number</p>
          <input onChange={(e)=>setIdentifier(e.target.value)} value={identifier}
          type="text" placeholder="Enter your email or phone number"
          className="mt-1 w-full rounded border border-gray-200 p-3 outline-primary"/>
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e)=>setPassword(e.target.value)} value={password}
          type="password"  placeholder="Enter Your Password"
           className="mt-1 w-full rounded border border-gray-200 p-3 outline-primary"/>
        </div>
        <button className="bg-primary tetx-white w-full py-2 rounded-md cursor-pointer">Login</button>
       </div>

    </form>
  )
}

export default SellerLogin
