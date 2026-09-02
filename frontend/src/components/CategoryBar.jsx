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
      <div className="flex gap-6 px-6 md:px-16 lg:px-24 py-3 overflow-x-auto">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.path}
            className="whitespace-nowrap text-sm font-medium hover:text-green-600"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
