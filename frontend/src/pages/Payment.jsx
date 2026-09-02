import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

// Clean, attractive payment UI inspired by provided mockups.
const Payment = () => {
  const { currency, navigate } = useAppContext()
  const location = useLocation()
  const { paymentOption, selectedAddress, cartArray, amount } = location.state || {}

  const [method, setMethod] = useState(paymentOption === 'COD' ? 'COD' : (paymentOption || 'UPI'))

  const confirmOrder = () => {
    // Replace with real order creation / payment verification in production
    navigate('/my-orders')
    scrollTo(0,0)
  }

  // Small SVG that resembles a QR for demo purposes
  const DemoQR = () => (
    <svg width="170" height="170" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg" className="block">
      <rect width="100%" height="100%" fill="#ffffff" />
      {/* corner squares */}
      <rect x="10" y="10" width="40" height="40" fill="#111" />
      <rect x="20" y="20" width="20" height="20" fill="#fff" />
      <rect x="110" y="10" width="50" height="50" fill="#111" />
      <rect x="120" y="20" width="30" height="30" fill="#fff" />
      <rect x="10" y="110" width="50" height="50" fill="#111" />
      <rect x="20" y="120" width="30" height="30" fill="#fff" />
      {/* random blocks to make it look like a QR */}
      {Array.from({length:40}).map((_,i)=>{
        const x = 10 + ((i*7) % 140)
        const y = 70 + Math.floor((i*7)/140)*7
        return <rect key={i} x={x} y={y} width="6" height="6" fill={i%3===0? '#111' : '#222'} />
      })}
    </svg>
  )

  return (
    <div className="mt-16 px-6">
      <div className="max-w-[1150px] mx-auto grid grid-cols-12 gap-6">
        {/* left column - options */}
        <aside className="col-span-4 bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <button onClick={() => navigate(-1)} className="text-sm text-gray-600">← Back</button>
            <h2 className="mt-2 text-xl font-semibold">Complete Payment</h2>
          </div>

          <div className="p-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${method==='UPI' ? 'border-primary bg-primary/5' : 'border-gray-100'} cursor-pointer`} onClick={() => setMethod('UPI')}>
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow">UPI</div>
              <div>
                <div className="font-medium">UPI</div>
                <div className="text-sm text-gray-500">Pay using any UPI app (scan QR)</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 mt-3 rounded-lg border ${method==='card' ? 'border-primary bg-primary/5' : 'border-gray-100'} cursor-pointer`} onClick={() => setMethod('card')}>
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow">💳</div>
              <div>
                <div className="font-medium">Credit / Debit / ATM Card</div>
                <div className="text-sm text-gray-500">Secure card payments</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 mt-3 rounded-lg border ${method==='COD' ? 'border-primary bg-primary/5' : 'border-gray-100'} cursor-pointer`} onClick={() => setMethod('COD')}>
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow">💵</div>
              <div>
                <div className="font-medium">Cash on Delivery</div>
                <div className="text-sm text-gray-500">Pay with cash when your order arrives</div>
              </div>
            </div>
          </div>
        </aside>

        {/* center column - QR / payment card */}
        <main className="col-span-5 bg-white rounded-lg border shadow-sm p-6 flex flex-col items-center">
          {method === 'COD' ? (
            <div className="text-center w-full">
              <h3 className="text-xl font-semibold mb-2">Cash on Delivery</h3>
              <p className="text-gray-600 mb-4">Pay the exact amount to the delivery partner.</p>
              <button onClick={confirmOrder} className="px-5 py-2 bg-primary text-white rounded-md shadow">Place Order (COD)</button>
            </div>
          ) : method === 'card' ? (
            <div className="w-full text-center">
              <h3 className="text-xl font-semibold mb-2">Card Payment</h3>
              <p className="text-gray-600 mb-4">Card form integration placeholder — add card details here.</p>
              <button onClick={confirmOrder} className="px-5 py-2 bg-primary text-white rounded-md shadow">Pay with Card</button>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Scan QR and Pay</h3>
                <p className="text-sm text-gray-500">Open your UPI app and scan to pay</p>
              </div>

              <div className="mx-auto bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-inner">
                <div className="w-[190px] h-[190px] bg-white rounded-lg mx-auto flex items-center justify-center border">
                  <DemoQR />
                </div>

                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="text-2xl font-semibold">{currency}{amount ?? 0}</div>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <div className="px-3 py-1 bg-white rounded shadow text-sm">UPI</div>
                  <div className="px-3 py-1 bg-white rounded shadow text-sm">or any UPI app</div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">Do not press back or close this screen until the transaction completes.</p>

                <div className="mt-6 flex justify-center">
                  <button onClick={confirmOrder} className="px-4 py-2 bg-primary text-white rounded-md shadow">I have paid</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* right column - order summary */}
        <aside className="col-span-3 bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Price Details</h4>
            <div className="text-sm text-gray-500">100% Secure</div>
          </div>

          <div className="mt-4 text-sm text-gray-600 space-y-3">
            <div className="flex justify-between"><span>Price</span><span>{currency}{amount ?? 0}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between"><span>Tax (2%)</span><span>{currency}{Math.round((amount ?? 0) * 2) / 100}</span></div>
            <hr className="my-3" />
            <div className="flex justify-between font-semibold text-lg"><span>Total Amount</span><span>{currency}{amount ?? 0}</span></div>
          </div>

          <div className="mt-5 bg-green-50 border border-green-100 p-3 rounded">
            <div className="font-medium text-green-700">5% Cashback</div>
            <div className="text-xs text-green-700">Claim now with payment offers</div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <div className="font-medium">Deliver To</div>
            <div className="mt-1">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : 'No address selected'}</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Payment
