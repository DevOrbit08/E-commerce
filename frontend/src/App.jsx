import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Customers from './pages/seller/Customers';
import DeliveryPartners from './pages/seller/DeliveryPartners';
import DeliveryPartnerLogin from './pages/deliveryPartner/DeliveryPartnerLogin';
import { DeliveryPartnerCompletedOrders, DeliveryPartnerDeliveries, DeliveryPartnerOrders } from './pages/deliveryPartner/DeliveryPartnerPages';
import NotFound from './pages/NotFound';


const App = () => {

  const currentPath = useLocation().pathname;
  const isSellerPath = currentPath.includes("seller") || currentPath.startsWith("/delivery-partner");
  const {showUserLogin, isSeller} = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>

      {isSellerPath ? null : <Navbar/>} 
      {showUserLogin ? <Login/> : null}

      <Toaster />

      {!isSellerPath && <div aria-hidden="true" className="h-[66px] sm:h-[68px]" />}
      <div className={`${isSellerPath ? "" : "min-w-0 px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12"}`}>
        <Routes>

          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<AllProducts/>} />
          <Route path='/products/:category' element={<ProductCategory/>} />
          <Route path='/products/:category/:id' element={<ProductDetails/>} />
          <Route path='/Cart' element={<Cart/>} />
          <Route path='/add-address' element={<AddAddress/>} />
          <Route path='/my-orders' element={<MyOrders/>} />
          <Route path='/delivery-partner' element={<DeliveryPartnerLogin/>}>
            <Route index element={<DeliveryPartnerOrders />} />
            <Route path='orders' element={<DeliveryPartnerOrders />} />
            <Route path='deliveries' element={<DeliveryPartnerDeliveries />} />
            <Route path='completed-orders' element={<DeliveryPartnerCompletedOrders />} />
          </Route>
          <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin/>}>
          <Route index element={isSeller ? <AddProduct/> : null}/>
          <Route path='product-list' element={<ProductList/>}/>
          <Route path='orders' element={<Orders/>}/>
          <Route path='customers' element={<Customers/>}/>
          <Route path='delivery-partners' element={<DeliveryPartners/>}/>
          </Route>
          <Route path='*' element={<NotFound/>} />
        </Routes>
      </div>
       {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App
