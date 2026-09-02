import React, { useMemo, useState } from 'react';
import { assets, categories } from '../../assets/assets';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const UNIT_OPTIONS = ['kg', 'g', 'l', 'ml', 'pcs'];

const QUALITY_TIPS = [
  'Use clear, front-facing images',
  'Write accurate product details',
  'Keep pricing competitive',
];

const AddProduct = () => {
  // files[0] is the cover image, files[1..4] are the supporting shots
  const [files, setFiles] = useState([null, null, null, null, null]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [unitValue, setUnitValue] = useState('1');
  const [unitType, setUnitType] = useState('kg');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [gstRate, setGstRate] = useState('5%');

  const uploadedCount = files.filter(Boolean).length;

  const coverPreview = useMemo(() => {
    if (files[0] instanceof File) return URL.createObjectURL(files[0]);
    return assets.upload_area;
  }, [files]);

  const setSlot = (index, file) => {
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (uploadedCount < 1) {
        alert('Please upload at least one product image before publishing.');
        return;
      }

      if (!name || !category || !price || !offerPrice) {
        alert('Please fill required fields');
        return;
      }

      const formData = new FormData();
      const productData = {
        name,
        description: [description || ''],
        price: Number(price),
        offerPrice: Number(offerPrice),
        mrp: Number(price || 0),
        category,
        brand,
        sku,
        unit: `${unitValue}${unitType}`,
        gstRate,
        inStock: true,
      };

      formData.append('productData', JSON.stringify(productData));
      files.forEach((file) => {
        if (file) formData.append('images', file);
      });

      const res = await fetch(`${API_URL}/api/product/add`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (data && data.success) {
        alert('Product added');
        setFiles([null, null, null, null, null]);
        setName('');
        setDescription('');
        setCategory('');
        setBrand('');
        setSku('');
        setUnitValue('1');
        setUnitType('kg');
        setPrice('');
        setOfferPrice('');
        setGstRate('5%');
      } else {
        alert((data && data.message) || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Network error');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold text-[#1f1e1c]">Add a new product</h1>
              
            </div>
            <p className="mt-2 text-sm text-[#8a8079]">
              Add accurate details to help customers find and trust your products.
            </p>
          </div>
          
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          {/* ---------------- LEFT COLUMN ---------------- */}
          <div className="space-y-6">
            {/* Product images */}
            <div className="rounded-[22px] border border-[#eadfd5] bg-[#fdfaf8] p-5 shadow-[0_6px_24px_rgba(25,19,15,0.03)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-[28px] font-semibold text-[#1f1e1c]">Product images</h2>
                <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-sm font-medium text-[#f1683a]">
                  {uploadedCount} / 5
                </span>
              </div>

              <p className={`mb-4 text-sm ${uploadedCount >= 1 ? 'text-[#2ab673]' : 'text-[#f1683a]'}`}>
                {uploadedCount >= 1 ? 'Image uploaded. Ready to publish.' : 'Minimum 1 image is required before publishing.'}
              </p>

              <div className="grid gap-5 sm:grid-cols-[190px_1fr]">
                <label
                  htmlFor="cover-upload"
                  className="group relative flex h-[190px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-[#d7c8bc] bg-[#f6f0ec] transition hover:border-[#f1683a] hover:bg-[#fff9f6]"
                >
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) setSlot(0, selected);
                    }}
                  />
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className={files[0] ? 'h-full w-full object-cover' : 'h-14 w-14 opacity-40'}
                  />
                  <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#f1683a] text-xs text-white shadow-sm">
                    ★
                  </span>
                  <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-md transition group-hover:scale-105">
                    ✎
                  </span>
                </label>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-[#2a2724]">Drag &amp; drop or click to upload</p>
                    <p className="mt-1 text-sm text-[#8a8079]">
                      JPG, PNG or WebP &nbsp;•&nbsp; Max size 2MB &nbsp;•&nbsp; Min 500x500px
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((index) => (
                      <label
                        key={index}
                        htmlFor={`image-upload-${index}`}
                        className="group relative flex min-h-[86px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-dashed border-[#d7c8bc] bg-[#f6f0ec] text-center transition hover:border-[#f1683a] hover:bg-[#fff9f6]"
                      >
                        <input
                          id={`image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) setSlot(index, selected);
                          }}
                        />
                        {files[index] ? (
                          <img
                            src={URL.createObjectURL(files[index])}
                            alt={`Product ${index}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                              ⬆
                            </div>
                            <span className="text-[11px] font-medium text-[#8a8079]">Upload image</span>
                          </>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product information */}
            <div className="rounded-[22px] border border-[#eadfd5] bg-[#fdfaf8] p-5 shadow-[0_6px_24px_rgba(25,19,15,0.03)]">
              <h2 className="mb-5 text-[28px] font-semibold text-[#1f1e1c]">Product information</h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="product-name" className="mb-2 block text-base font-medium text-[#2a2724]">
                    Product name <span className="text-[#f1683a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="product-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Product Name "
                      className="w-full rounded-xl border border-[#d9cfc4] bg-white px-4 py-3 pr-10 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                      required
                    />
                    {name && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2ab673]">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="product-description" className="mb-2 block text-base font-medium text-[#2a2724]">
                    Description <span className="text-[#f1683a]">*</span>
                  </label>
                  <textarea
                    id="product-description"
                    rows={5}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add product description here..."
                    className="w-full resize-none rounded-xl border border-[#d9cfc4] bg-white px-4 py-3 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                  />
                  <p className="mt-1 text-right text-xs text-[#a9a09b]">{description.length} / 500 characters</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="mb-2 block text-base font-medium text-[#2a2724]">
                      Category <span className="text-[#f1683a]">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#d9cfc4] bg-white px-4 py-3 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                    >
                      <option value="">Select category</option>
                      {categories.map((item, index) => (
                        <option key={index} value={item.path}>
                          {item.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand" className="mb-2 block text-base font-medium text-[#2a2724]">
                      Brand
                    </label>
                    <input
                      id="brand"
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Product Brand"
                      className="w-full rounded-xl border border-[#d9cfc4] bg-white px-4 py-3 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  

                  <div>
                    <label htmlFor="unit-value" className="mb-2 block text-base font-medium text-[#2a2724]">
                      Unit / Weight
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="unit-value"
                        type="number"
                        min="0"
                        value={unitValue}
                        onChange={(e) => setUnitValue(e.target.value)}
                        className="w-full rounded-xl border border-[#d9cfc4] bg-white px-4 py-3 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                      />
                      <select
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value)}
                        className="w-24 shrink-0 rounded-xl border border-[#d9cfc4] bg-white px-3 py-3 text-base text-[#2a2724] outline-none transition focus:border-[#f1683a]"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-[#e7d7ce] bg-[#fffaf7] px-4 py-3 text-sm text-[#4f4845]">
                  {QUALITY_TIPS.map((tip) => (
                    <span key={tip} className="inline-flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f7ef] text-[#2ab673]">
                        ✓
                      </span>
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ---------------- RIGHT COLUMN ---------------- */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="rounded-[22px] border border-[#eadfd5] bg-[#fdfaf8] p-5 shadow-[0_6px_24px_rgba(25,19,15,0.03)]">
              <h2 className="mb-5 text-[28px] font-semibold text-[#1f1e1c]">Pricing</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="price" className="mb-2 block text-base font-medium text-[#2a2724]">
                    MRP (incl. of all taxes) <span className="text-[#f1683a]">*</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-[#d9cfc4] bg-white">
                    <span className="px-3 text-[#7d756f]">₹</span>
                    <input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-3 text-base text-[#2a2724] outline-none"
                      required
                    />
                  </div>
                </div>

                

                <div>
                  <label htmlFor="offer-price" className="mb-2 block text-base font-medium text-[#2a2724]">
                    Offer price
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-[#d9cfc4] bg-white">
                    <span className="px-3 text-[#7d756f]">₹</span>
                    <input
                      id="offer-price"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-3 text-base text-[#2a2724] outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#a9a09b]">Customers will see the lower price.</p>
                </div>

                
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#f1683a] px-5 py-4 text-lg font-semibold text-white shadow-[0_12px_24px_rgba(241,104,58,0.25)] transition hover:bg-[#e95d2f]"
              >
                Publish product
              </button>
             
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;