import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Navbar = () => {
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
  } = useAppContext();

  const logout = async () => {
    try{
      await fetch(`${API_URL}/api/user/logout`, { method: 'GET', credentials: 'include' });
      setUser(null);
      toast.success('Logged out');
      navigate("/");
    }catch(err){
      setUser(null);
      toast.error('Logout failed');
      navigate("/");
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="border-b bg-white">
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4">
        
        {/* Logo - Left */}
        <NavLink to="/" className="flex-shrink-0">
          <img src={assets.logo} alt="logo" className="h-8 w-auto" />
        </NavLink>

        {/* Right Side Menu */}
        <div className="flex items-center gap-6">
          
          {/* Desktop Menu Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <NavLink to="/" className="hover:text-primary">Home</NavLink>
            <NavLink to="/products" className="hover:text-primary">All Products</NavLink>
            <NavLink to="/contact" className="hover:text-primary">Contact</NavLink>
          </div>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-3 border px-4 py-2 rounded-full">
            <input
              type="text"
              placeholder="Search products"
              className="outline-none bg-transparent text-sm w-40"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img src={assets.search_icon} className="w-5" />
          </div>

          {/* Cart */}
          <div
            onClick={() => {
              if (!user) {
                setShowUserLogin(true);
                toast.error('Please login to view cart');
              } else {
                navigate('/cart');
              }
            }}
            className="relative cursor-pointer"
          >
            <img src={assets.nav_cart_icon} className="w-6 opacity-80" />
            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          </div>

          {/* User Section */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="bg-primary text-white px-6 py-2 rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <div className="relative group cursor-pointer">
              {/* Profile Circle */}
              <img
                src={assets.profile_icon}
                alt="profile"
                className="w-10 h-10 rounded-full border"
              />

              {/* Hover Dropdown */}
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => navigate("/my-orders")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  My Orders
                </button>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
