import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast  from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null)
  const [isSeller, setIsSeller] = useState(false)
  const [showUserLogin, setShowUserLogin] = useState(false)
  const [products, setProducts] = useState([])
                                               
  const [cartItems, setCartItems] = useState({})
  const [searchQuery, setSearchQuery] = useState({})

  // Fetch All Products
  const fetchProducts = async ()=>{
    try{
      const res = await fetch(`${API_URL}/api/product/list`);
      const data = await res.json();
      if(data && data.success){
        // normalize backend product fields to match frontend (image, description array)
        const normalized = data.products.map(p => ({
          ...p,
          image: p.images || p.image || [],
          description: Array.isArray(p.description) ? p.description : (p.description ? [p.description] : [])
        }));
        setProducts(normalized);
      } else {
        setProducts(dummyProducts);
      }
    }catch(err){
      setProducts(dummyProducts);
    }
  }
  
  // Add Product to Cart
  const addToCart = (itemId)=>{
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]){
        cartData[itemId] += 1;
    }else{
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
  }

  //Update Cart Item Quantity
  const updateCartItem = (itemId, quantity)=>{
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

  //Remove Product From Cart
  const removeFromCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
      cartData[itemId] -= 1;
      if(cartData[itemId] === 0){
       delete cartData[itemId];
      }
    }
    toast.success("Remove from cart")
    setCartItems(cartData)
  } 

  // Get Cart Item Count
  const getCartCount = ()=> {
    let totalCount = 0;
    for(const item in cartItems){
      totalCount += cartItems[item];
    }
    return totalCount;
  }

  // Get Cart Total Amount //
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems){
      let itemInfo = products.find((product)=> product._id === items);
      if(cartItems[items] > 0){
        totalAmount += itemInfo.offerPrice * cartItems[items]
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  }

  useEffect(()=>{
    fetchProducts()
  },[])

  // Check authentication on app load
  useEffect(()=>{
    const checkAuth = async ()=>{
      try{
        const res = await fetch(`${API_URL}/api/user/is-auth`, { credentials: 'include' });
        const data = await res.json();
        if(data && data.success){
          setUser(data.user);
        } else {
          setUser(null);
        }
      }catch(err){
        setUser(null);
      }
    }
    checkAuth();
  },[])

  const clearCart = ()=> setCartItems({});

  const value = {navigate, user, setUser, setIsSeller, isSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, clearCart, searchQuery, setSearchQuery, getCartAmount, getCartCount, fetchProducts}

  return <AppContext.Provider value={value}>
    {children}
  </AppContext.Provider>
}

export const useAppContext = ()=>{
  return useContext(AppContext)
}