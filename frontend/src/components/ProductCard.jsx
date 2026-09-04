import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";


const ProductCard = ({product, compact = false}) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate} = useAppContext()

    
    return product && ( 
        <div onClick={()=> {navigate(`/products/${(Array.isArray(product.category) ? product.category[0] : product.category).toLowerCase()}/${product._id}`); scrollTo(0,0)}} className={`w-full border border-[#e5d8cc] rounded-xl bg-[var(--app-cream)] px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compact ? 'flex h-[315px] min-w-0 max-w-none flex-col' : 'md:px-4 min-w-56 max-w-56'}`}>
            <div className={`group cursor-pointer flex items-center justify-center overflow-hidden rounded-lg bg-[var(--app-cream-strong)] px-2 ${compact ? 'h-36' : 'h-48'}`}>
                <img className="max-h-full max-w-full object-contain transition group-hover:scale-105" src={(product.image && product.image[0]) ? product.image[0] : assets.upload_area} alt={product.name} />
            </div>
            <div className={`text-gray-500/60 ${compact ? 'flex min-h-0 flex-1 flex-col text-xs' : 'text-sm'}`}>
                <p className="mt-2 truncate">{Array.isArray(product.category) ? product.category.join(', ') : product.category}</p>
                <p className={`w-full truncate font-medium text-gray-700 ${compact ? 'text-sm' : 'text-lg'}`}>{product.name}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                      <img key={i} className={compact ? 'h-3 w-3' : 'md:w-3.5 w3'} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt=""/>
                    ))}
                    <p>(4)</p>
                </div>
                <div className={`flex items-end justify-between gap-2 ${compact ? 'mt-auto pt-3' : 'mt-3'}`}>
                    <p className={`flex min-w-0 flex-col font-medium text-primary ${compact ? 'text-sm' : 'md:text-xl text-base'}`}>
                        <span>{currency}{product.offerPrice}</span>
                        <span className="text-xs text-gray-500/60 line-through md:text-sm">{currency}{product.price}</span>
                    </p>
                    <div onClick={(e) => {e.stopPropagation(); }} className="text-primary">
                        {!cartItems[product._id] ? (
                            <button className={`flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 rounded cursor-pointer ${compact ? 'h-8 w-[58px] text-xs' : 'md:w-[80px] w-[64px] h-[34px]'}`} onClick={() => addToCart(product._id)} >
                                <img className={compact ? 'h-4 w-4' : ''} src={assets.cart_icon} alt="cart_icon" />
                                Add
                            </button>
                        ) : (
                            <div className={`flex items-center justify-center gap-2 bg-primary/25 rounded select-none ${compact ? 'h-8 w-[58px] text-xs' : 'md:w-20 w-16 h-[34px]'}`}>
                                <button onClick={() => {removeFromCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() => {addToCart(product._id)}} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;