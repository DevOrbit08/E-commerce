import React from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const normalizedCategory = category.toLowerCase();

  const currentCategory = categories.find(
    (item) => item.path.toLowerCase() === normalizedCategory
  );

  const filteredProducts = products.filter(
    (product) =>
      (Array.isArray(product.category) ? product.category : [product.category]).some((item) => item.toLowerCase() === normalizedCategory) &&
      product.inStock
  );

  return (
    <div className="mt-16 flex flex-col">
      {/* Heading section – SAME AS All Products */}
      {currentCategory && (
        <div className="flex flex-col items-start w-max">
          <p className="text-2xl font-medium uppercase">
            {currentCategory.text}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductCategory;
