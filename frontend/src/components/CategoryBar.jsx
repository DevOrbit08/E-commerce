import { Link } from "react-router-dom";

const categories = [
  { name: "All Products", path: "/products" },
  { name: "Household Items", path: "/products/household" },
  { name: "Spices & Essential", path: "/products/spices" },
  { name: "Cold Drinks", path: "/products/drinks" },
  { name: "Instant Food", path: "/products/instant" },
  { name: "Dairy Products", path: "/products/dairy" },
  { name: "Bakery & Breads", path: "/products/bakery" },
  { name: "Grains & Cereals", path: "/products/grains" },
  
];

const CategoryBar = () => {
  return (
    <div className="border-t border-b bg-white">
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-2.5 sm:gap-6 sm:px-6 sm:py-3 md:px-16 lg:px-24">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.path}
            className="whitespace-nowrap text-xs font-medium hover:text-green-600 sm:text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
