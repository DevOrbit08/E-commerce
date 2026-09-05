import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {

    const {products, navigate, currency, addToCart} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] =useState([]);
    const [thumbnail, setThumbnail] =useState(null);
    const [selectedUnit, setSelectedUnit] = useState("");

    const product = products.find((item)=> item._id === id);
    const variants = useMemo(() => {
      if (!product) return [];
      if (Array.isArray(product.variants) && product.variants.length) return product.variants;
      return [{ unit: product.unit || product.weight || "1 pack", price: product.price, offerPrice: product.offerPrice, inStock: product.inStock }];
    }, [product]);
    const selectedVariant = variants.find((variant) => variant.unit === selectedUnit) || variants[0];

    // safe images list with fallback
    const images = product
      ? (selectedVariant?.image
        ? [selectedVariant.image, ...(product.image || []).filter((image) => image !== selectedVariant.image)]
        : (product.image && product.image.length ? product.image : [assets.upload_area]))
      : [assets.upload_area];

    useEffect(()=> {
      if(products.length > 0 && product){
        let productsCopy = products.slice();
        productsCopy = productsCopy.filter((item)=> {
          const productCategories = Array.isArray(product.category) ? product.category : [product.category]
          const itemCategories = Array.isArray(item.category) ? item.category : [item.category]
          return productCategories.some((category) => itemCategories.includes(category))
        })
        setRelatedProducts(productsCopy.slice(0,5))
      }
    },[products, product])

    useEffect(()=> {
      setThumbnail(images[0] || assets.upload_area)
      setSelectedUnit(product?.variants?.[0]?.unit || product?.unit || "");
    },[product, selectedVariant?.image])

    return product && (
        <div className="mt-12">
            <p>
                <Link to={"/"}>Home</Link> /
                <Link to="/products"> Products</Link> /
                <Link to={`/products/${(Array.isArray(product.category) ? product.category[0] : product.category).toLowerCase()}`}> {Array.isArray(product.category) ? product.category.join(', ') : product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {images.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-500/30 bg-[var(--app-cream-strong)] cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-contain p-2" />
                            </div>
                        ))}
                    </div>

                    <div className="flex h-[420px] w-[min(420px,calc(100vw-150px))] items-center justify-center overflow-hidden rounded border border-gray-500/30 bg-[var(--app-cream-strong)]">
                        <img src={thumbnail} alt="Selected product" className="h-full w-full object-contain p-5" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                            
                              <img src={i<4 ? assets.star_icon : assets.star_dull_icon} alt="" className="md:w-4 w-3.5" />

                        ))}
                        <p className="text-base ml-2">(4)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{selectedVariant?.price}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{selectedVariant?.offerPrice}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    {variants.length > 1 && (
                      <div className="mt-5">
                        <p className="mb-2 text-base font-medium">Select pack size</p>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((variant) => (
                            <button
                              key={variant.unit}
                              type="button"
                              disabled={!variant.inStock}
                              onClick={() => setSelectedUnit(variant.unit)}
                              className={`rounded-lg border px-4 py-2 text-sm ${
                                selectedVariant?.unit === variant.unit
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : variant.inStock
                                    ? "border-gray-300 bg-white text-gray-700"
                                    : "cursor-not-allowed border-dashed border-gray-300 bg-gray-100 text-gray-400 line-through"
                              }`}
                            >
                              {variant.unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button disabled={!selectedVariant?.inStock} onClick={()=> addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition disabled:cursor-not-allowed disabled:opacity-50" >
                            Add to Cart
                        </button>
                        <button disabled={!selectedVariant?.inStock} onClick={()=> {addToCart(product._id); navigate("/cart")}} className="w-full py-3.5 cursor-pointer font-medium bg-primary-dull text-white hover:bg-primary transition disabled:cursor-not-allowed disabled:opacity-50" >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
            

           {/*--Related Product--*/}
            <div className="flex flex-col items-center mt-20">
              <div className="flex flex-col items-center w-max">
                <p className="text-3xl font-medium">Related product</p>
                <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                {relatedProducts.filter((product)=> product.inStock).map((product, index)=>(
                  <ProductCard key={index} product={product}/>
                  ))}
              </div>
              <button onClick={()=> {navigate('/products'); scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">See more</button>
            </div>


        </div>
    );
};

export default ProductDetails