import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';
import ProfileOverlay from './ProfileOverlay';
import { Menu, X } from 'lucide-react';

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

  const [showProfile, setShowProfile] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

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
    if (typeof searchQuery === 'string' && searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b bg-white">
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-16 lg:px-24 xl:px-32">
        
        {/* Logo - Left */}
        <NavLink to="/" className="flex-shrink-0">
          <img src={assets.logo} alt="logo" className="h-7 w-auto sm:h-8" />
        </NavLink>

        {/* Right Side Menu */}
        <div className="flex items-center gap-3 lg:gap-6">
          
          {/* Desktop Menu Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <NavLink to="/" className="hover:text-primary">Home</NavLink>
            <NavLink to="/products" className="hover:text-primary">All Products</NavLink>
            {user && (
              <NavLink to="/my-orders" className="hover:text-primary">My Orders</NavLink>
            )}
          </div>

          <button
            type="button"
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-gray-600 hover:bg-primary/10 lg:hidden"
            onClick={() => setShowMobileMenu((open) => !open)}
          >
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Search */}
          <div className="hidden lg:absolute lg:left-1/2 lg:top-1/2 lg:flex w-[520px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-xl border border-gray-300 bg-[#fffdfa] px-5 py-3 xl:w-[620px]">
            <img src={assets.search_icon} className="w-5 shrink-0 opacity-70" alt="Search" />
            <input
              type="text"
              placeholder="Search Producct here..."
              value={typeof searchQuery === 'string' ? searchQuery : ''}
              className="w-full bg-transparent text-sm outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
            <img src={assets.nav_cart_icon} className="w-6 opacity-80" alt="Cart" />
            <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {getCartCount()}
            </span>
          </div>

          {/* User Section */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-dull sm:px-6"
            >
              Login
            </button>
          ) : (
            <button type="button" onClick={() => setShowProfile(true)} className="cursor-pointer">
              {/* Profile Circle */}
              <img
                src={assets.profile_icon}
                alt="profile"
                className="w-10 h-10 rounded-full border"
              />

            </button>
          )}
        </div>
      </div>
      {showMobileMenu && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-3 lg:hidden">
          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-[#fffdfa] px-4 py-2.5">
            <img src={assets.search_icon} className="w-5 shrink-0 opacity-70" alt="Search" />
            <input
              type="text"
              placeholder="Search products"
              value={typeof searchQuery === 'string' ? searchQuery : ''}
              className="w-full bg-transparent text-sm outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-1 text-sm">
            <NavLink onClick={() => setShowMobileMenu(false)} to="/" className="rounded-lg px-3 py-2.5 hover:bg-primary/10">Home</NavLink>
            <NavLink onClick={() => setShowMobileMenu(false)} to="/products" className="rounded-lg px-3 py-2.5 hover:bg-primary/10">All Products</NavLink>
            {user && <NavLink onClick={() => setShowMobileMenu(false)} to="/my-orders" className="rounded-lg px-3 py-2.5 hover:bg-primary/10">My Orders</NavLink>}
          </div>
        </div>
      )}
      {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} onLogout={logout} />}
    </nav>
  );
};

export default Navbar;
