import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();
  const scrollRef = useRef(null);

  const bestSellers = products.filter(
  (product) => product.inStock && product.bestSeller
   );

  const scrollBy = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction * 350,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl md:text-3xl font-medium">
          Best Seller
        </p>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => scrollBy(1)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Products */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto px-3 pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {bestSellers.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 w-[260px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Hide scrollbar for Chrome, Safari */}
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default BestSeller;