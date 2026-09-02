import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { MapPin, Home, Briefcase, Tag } from 'lucide-react';

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
    <label className="text-gray-700 text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
      required
    />
  </div>
);

const ADDRESS_TYPES = [
  { key: "home", label: "Home", icon: Home },
  { key: "work", label: "Work", icon: Briefcase },
  { key: "other", label: "Other", icon: Tag },
];

const AddAddress = () => {
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    houseFlat: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    addressType: "home",
    isDefault: true,
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
      <div className="flex flex-col-reverse md:flex-row gap-12 items-start">

        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-xl space-y-5"
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="bg-orange-50 text-primary rounded-full p-2.5 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Where should we deliver?</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Add your shipping address for a faster checkout experience.
              </p>
            </div>
          </div>

          <InputField
            label="Full name"
            name="fullName"
            value={address.fullName}
            handleChange={handleChange}
            placeholder="Enter full name"
          />

          <div className="flex flex-col gap-1">
            <label className="text-gray-700 text-sm font-medium">Mobile number</label>
            <div className="flex">
              <span className="px-3 py-2.5 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 text-sm text-gray-600">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={address.phone}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-r-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                required
              />
            </div>
          </div>

          <InputField
            label="House / Flat / Building"
            name="houseFlat"
            value={address.houseFlat}
            handleChange={handleChange}
            placeholder="e.g., Flat 101, Wing A, Green Valley Apartments"
          />

          <InputField
            label="Street and landmark"
            name="street"
            value={address.street}
            handleChange={handleChange}
            placeholder="e.g., 12th Main Road, Near Apollo Pharmacy"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="City"
              name="city"
              value={address.city}
              handleChange={handleChange}
              placeholder="Enter city"
            />
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 text-sm font-medium">State</label>
              <select
                name="state"
                value={address.state}
                onChange={handleChange}
                className="px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm bg-white"
                required
              >
                <option value="">Select state</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
            <InputField
              label="PIN code"
              name="zip"
              value={address.zip}
              handleChange={handleChange}
              placeholder="Enter PIN code"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm font-medium">Address type</label>
            <div className="flex gap-3">
              {ADDRESS_TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAddress((prev) => ({ ...prev, addressType: key }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${
                    address.addressType === key
                      ? "border-primary text-primary bg-orange-50"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          

          {/* Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg mt-2 hover:opacity-90 transition cursor-pointer font-medium"
          >
            <MapPin size={16} />
            Save address
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