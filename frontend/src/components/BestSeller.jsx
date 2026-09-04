import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();

  const featuredProducts = useMemo(() => {
    const availableProducts = products.filter((product) => product.inStock);
    const markedProducts = availableProducts.filter((product) => product.bestSeller);
    const productsToShow = markedProducts.length ? markedProducts : availableProducts;

    return [...productsToShow].sort(
      (first, second) =>
        (second.purchaseCount || second.totalPurchased || 0) -
        (first.purchaseCount || first.totalPurchased || 0)
    );
  }, [products]);

  const firstRow = featuredProducts.filter((_, index) => index % 2 === 0);
  const secondRow = featuredProducts.filter((_, index) => index % 2 === 1);

  const renderRow = (rowProducts, reverse = false) => {
    const productsForMarquee = rowProducts.length ? rowProducts : featuredProducts.slice(0, 1);
    const repeatedProducts = [...productsForMarquee, ...productsForMarquee];

    return (
      <div className="overflow-hidden">
        <div className={`flex w-max gap-5 py-1 ${reverse ? 'featured-marquee-reverse' : 'featured-marquee'}`}>
          {repeatedProducts.map((product, index) => (
            <div key={`${product._id}-${index}`} className="w-52 shrink-0 sm:w-56 md:w-60">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16">
      <div className="mb-6">
        <p className="text-2xl font-medium md:text-3xl">Featured Products</p>
        <p className="mt-1 text-sm text-gray-500">Popular picks purchased by our customers</p>
      </div>

      <div className="space-y-4 overflow-hidden px-3 pb-4">
        {renderRow(firstRow)}
        {renderRow(secondRow, true)}
      </div>

      <style>{`
        .featured-marquee,
        .featured-marquee-reverse {
          animation: featured-products-roll 28s linear infinite;
        }
        .featured-marquee-reverse {
          animation-direction: reverse;
          animation-duration: 34s;
        }
        .featured-marquee:hover,
        .featured-marquee-reverse:hover {
          animation-play-state: paused;
        }
        @keyframes featured-products-roll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default BestSeller;
