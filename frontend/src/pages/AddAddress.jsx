import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Reusable Input Component
const InputField = ({
  label,
  name,
  type = "text",
  value,
  handleChange,
  placeholder,
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="px-3 py-2 border border-gray-300 rounded outline-none focus:border-primary"
      required
    />
  </div>
);

const AddAddress = () => {
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  const { setShowUserLogin } = useAppContext();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const payload = { address };
    const tryPost = async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      return res;
    };

    try{
      // First try the configured API_URL
      let res;
      try{
        res = await tryPost(`${API_URL}/api/address/add`);
      }catch(networkErr){
        console.error('Primary API request failed:', networkErr.message);
        // Fallback: try same-origin relative path (in case a dev proxy is used)
        try{
          res = await tryPost('/api/address/add');
        }catch(fallbackErr){
          console.error('Fallback API request failed:', fallbackErr.message);
          throw new Error('Network request failed. Check server is running and CORS settings.');
        }
      }

      let data;
      try{
        data = await res.json();
      }catch(parseErr){
        console.error('Failed to parse JSON:', parseErr.message);
        throw new Error('Invalid response from server');
      }

      if(data && data.success){
        toast.success('Address saved');
        navigate('/cart');
      } else {
        if(data && data.message && data.message.toLowerCase().includes('not authorized')){
          setShowUserLogin(true);
          navigate('/');
        } else {
          toast.error((data && data.message) || 'Failed to save address');
        }
      }
    }catch(err){
      console.error('Add address error:', err.message);
      toast.error(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8">
        Add Shipping Address
      </p>

      <div className="flex flex-col-reverse md:flex-row gap-12 items-start">

    
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-xl space-y-4"
        >
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="firstName"
              value={address.firstName}
              handleChange={handleChange}
              placeholder="Firts Name"
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={address.lastName}
              handleChange={handleChange}
              placeholder="Last Name"
            />
          </div>

      
          <InputField
            label="Email"
            name="email"
            type="email"
            value={address.email}
            handleChange={handleChange}
            placeholder="xyz@example.com"
          />

       
          <InputField
            label="Street Address"
            name="street"
            value={address.street}
            handleChange={handleChange}
            placeholder="Street"
          />

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="City"
              name="city"
              value={address.city}
              handleChange={handleChange}
              placeholder="City"
            />
            <InputField
              label="State"
              name="state"
              value={address.state}
              handleChange={handleChange}
              placeholder="State"
            />
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Zip Code"
              name="zip"
              type="number"
              value={address.zip}
              handleChange={handleChange}
              placeholder="Zip Code"
            />
            <InputField
              label="Country"
              name="country"
              value={address.country}
              handleChange={handleChange}
              placeholder="Country"
            />
          </div>
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={address.phone}
            handleChange={handleChange}
            placeholder="Phone Number"
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded mt-4 hover:opacity-90 transition cursor-pointer"
          >
            Save Address
          </button>
        </form>

        {/* IMAGE */}
        <img
          src={assets.add_address_iamge}
          alt="Add Address"
          className="w-full md:mr-16 mb-16 md:mt-0"
        />
      </div>
    </div>
  );
};

export default AddAddress;
