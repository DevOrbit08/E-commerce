import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { assets, dummyAddress } from "../assets/assets"
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Cart = () => {
  const {products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, clearCart} = useAppContext()
  const [cartArray, setCartArray] = useState([])
  const [addresses, setAddresses] = useState(dummyAddress)
  const [showAddress, setShowAddress] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(dummyAddress[0])

  // fetch saved addresses when user is authenticated
  useEffect(()=>{
    const fetchAddresses = async ()=>{
      try{
        const res = await fetch(`${API_URL}/api/address/get`, { credentials: 'include' });
        const data = await res.json();
        if(data && data.success && Array.isArray(data.addresses) && data.addresses.length > 0){
          setAddresses(data.addresses);
          setSelectedAddress(data.addresses[0]);
        }
      }catch(err){
        console.error('Fetching addresses failed:', err.message);
        // try fallback same-origin
        try{
          const res2 = await fetch('/api/address/get', { credentials: 'include' });
          const data2 = await res2.json();
          if(data2 && data2.success && Array.isArray(data2.addresses) && data2.addresses.length > 0){
            setAddresses(data2.addresses);
            setSelectedAddress(data2.addresses[0]);
          }
        }catch(err2){
          console.error('Fallback fetch addresses failed:', err2.message);
          // keep dummy
        }
      }
    }
    fetchAddresses();
  },[])
  const [paymentOption, setPaymentOption] = useState("COD")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD')
  const [cardDetails, setCardDetails] = useState({number:'', expiry:'', cvv:''})
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const getCart =  ()=> {
    let tempArray = []
    for(const key in cartItems){
      const product = products.find((item)=>item._id === key)
      product.quantity = cartItems[key]
      tempArray.push(product)
    }
    setCartArray(tempArray)
  }

  const totalAmount = getCartAmount() + getCartAmount() * 2 / 100

  const PlaceOrder = async ()=> {
    setIsPlacingOrder(true)
    try{
      const itemsPayload = cartArray.map(p => ({ product: p._id, quantity: p.quantity }));
      if (selectedPaymentMethod === 'COD' || paymentOption === 'COD'){
        const res = await fetch(`${API_URL}/api/order/cod`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address: selectedAddress, items: itemsPayload })
        });
        const data = await res.json();
        if(data && data.success){
          toast.success('Order placed successfully');
          clearCart();
          navigate('/my-orders');
          scrollTo(0,0);
        } else {
          toast.error((data && data.message) || 'Order failed');
        }
      } else {
        const res = await fetch(`${API_URL}/api/order/stripe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address: selectedAddress, items: itemsPayload })
        });
        const data = await res.json();
        if(data && data.success && data.url){
          window.location.href = data.url;
        } else {
          toast.error((data && data.message) || 'Payment initialization failed');
        }
      }
    }catch(err){
      toast.error(err.message);
    } finally {
      setIsPlacingOrder(false)
    }
  }

  useEffect(()=>{
    if(products.length > 0 && cartItems){
      getCart()
    }
  },[products, cartItems])

  const paymentMethods = [
    { key: 'UPI', label: 'UPI', sub: 'Any UPI app', icon: '' },
    { key: 'CARD', label: 'Card', sub: 'Credit / Debit', icon: '' },
    { key: 'COD', label: 'COD', sub: 'Pay on delivery', icon: '' },
  ]

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-6 gap-8">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-2xl font-medium mb-4">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-sm font-medium pb-2">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm font-medium pt-2">
                        <div className="flex items-center md:gap-4 gap-3">
                            <div onClick={()=>{
                              navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)
                            }} className="cursor-pointer w-16 h-16 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                                <img className="max-w-full h-full object-cover" src={(product.image && product.image[0]) ? product.image[0] : assets.upload_area} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))} value={cartItems[product._id]} className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={()=> removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-5 h-5" />
                        </button>
                    </div>)
                )}

                <button onClick={()=>{navigate("/products"); scrollTo(0,0)}} className="group cursor-pointer flex items-center mt-6 gap-2 text-primary font-medium text-sm">
                    <img className="group-hover:-translate-x-1 transition w-4" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[560px] w-full bg-white p-5 max-md:mt-8 border border-gray-300/70 rounded-lg shadow-sm h-fit">
                <h2 className="text-lg font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-3" />

                <div className="mb-3">
                    {/* Delivery Address */}
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700">Delivery Address</p>
                    <div className="relative flex justify-between items-center gap-3 mt-1.5 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                        <p className="text-gray-500 text-xs leading-snug">
                          {selectedAddress
                            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                            : "No address found"}
                        </p>
                        <button onClick={() => setShowAddress(!showAddress)} className="shrink-0 text-primary text-xs font-medium hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-11 left-0 z-10 py-1 bg-white border border-gray-300 rounded-md shadow-lg text-xs w-full">
                                {addresses.map((address, index)=> (
                                    <p key={index} onClick={() => {setSelectedAddress(address); setShowAddress(false)}} className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer transition-colors">
                                    {address.street}, {address.city}, {address.state}, {address.country}
                                </p>
                            )) }
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10 border-t border-gray-100 font-medium transition-colors">
                                    + Add new address
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Method — fully horizontal: methods stacked narrow on left, details wide on right */}
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700 mt-3 mb-1.5">Payment Method</p>

                    <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-md p-2.5">
                      {/* left: method list, narrow */}
                      <div className="flex flex-col gap-1.5 w-[130px] shrink-0">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.key}
                            onClick={() => {
                              setSelectedPaymentMethod(method.key)
                              setPaymentOption(method.key === 'COD' ? 'COD' : 'Online')
                            }}
                            className={`relative flex items-center gap-2 text-left py-2 px-2.5 border rounded-md transition-all
                              ${selectedPaymentMethod === method.key
                                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            <span className="text-sm shrink-0">{method.icon}</span>
                            <span className="min-w-0">
                              <span className="block font-medium text-xs text-gray-800 truncate">{method.label}</span>
                              <span className="block text-[10px] text-gray-400 leading-tight truncate">{method.sub}</span>
                            </span>
                            {selectedPaymentMethod === method.key && (
                              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center leading-none">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* right: details panel, wide */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-md p-3">
                        {selectedPaymentMethod === 'UPI' && (
                          <div className="flex items-center gap-4">
                            <div className="shrink-0 inline-flex items-center justify-center bg-white p-1.5 border border-gray-200 rounded-md shadow-sm">
                              <img src={assets.upload_area} alt="qr" className="w-16 h-16 object-cover rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 font-medium">Scan with any UPI app</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">GPay · PhonePe · Paytm</p>
                              <p className="text-xs text-gray-700 mt-1.5">
                                Amount: <span className="font-semibold text-gray-900">{currency}{Math.floor(totalAmount * 100)/100}</span>
                              </p>
                              <button
                                onClick={PlaceOrder}
                                disabled={isPlacingOrder}
                                className="mt-2 w-full py-2 bg-primary text-white font-medium rounded-md hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 text-xs"
                              >
                                {isPlacingOrder ? 'Processing…' : `Pay ${currency}${Math.floor(totalAmount * 100)/100}`}
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedPaymentMethod === 'CARD' && (
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <input
                                value={cardDetails.number}
                                onChange={e => setCardDetails(prev => ({...prev, number: e.target.value}))}
                                placeholder="Card Number"
                                maxLength={19}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                              />
                              <div className="flex gap-1.5">
                                <input
                                  value={cardDetails.expiry}
                                  onChange={e => setCardDetails(prev => ({...prev, expiry: e.target.value}))}
                                  placeholder="MM / YY"
                                  className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                                />
                                <input
                                  value={cardDetails.cvv}
                                  onChange={e => setCardDetails(prev => ({...prev, cvv: e.target.value}))}
                                  placeholder="CVV"
                                  type="password"
                                  maxLength={3}
                                  className="w-16 p-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                                />
                              </div>
                              <p className="text-[10px] text-gray-400">🔒 Secured as per RBI guidelines</p>
                            </div>
                            <button
                              onClick={PlaceOrder}
                              disabled={isPlacingOrder}
                              className="shrink-0 self-stretch px-5 bg-primary text-white font-medium rounded-md hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 text-xs whitespace-nowrap"
                            >
                              {isPlacingOrder ? 'Processing…' : `Pay ${currency}${Math.floor(totalAmount * 100)/100}`}
                            </button>
                          </div>
                        )}

                        {selectedPaymentMethod === 'COD' && (
                          <div className="flex items-center gap-4">
                            <p className="flex-1 text-xs text-gray-600">
                              Cash on Delivery (COD) is available for this order. You will pay the amount to the delivery agent upon receiving your order.
                            </p>
                            <button
                              onClick={PlaceOrder}
                              disabled={isPlacingOrder}
                              className="shrink-0 px-5 py-2 bg-primary text-white font-medium rounded-md hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 text-xs whitespace-nowrap"
                            >
                              {isPlacingOrder ? 'Placing Order…' : 'Place Order'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-3 space-y-1.5 text-xs">
                    <p className="flex justify-between">
                        <span>Price</span><span className="text-gray-700">{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600 font-medium">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span className="text-gray-700">{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <hr className="border-gray-200 !my-2" />
                    <p className="flex justify-between text-base font-semibold text-gray-900">
                        <span>Total Amount</span>
                        <span>{currency}{totalAmount}</span>
                    </p>
                </div>
            </div>
        </div>
    ) : null
}

export default Cart;