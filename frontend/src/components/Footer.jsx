import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";


const Footer = () => {
    return (
        <footer className="px-6 pt-8 md:px-16 lg:px-36 w-full text-gray-500 mt-24 bg-primary/10">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
                <div className="md:max-w-96">
                    <img alt="logo" className="h-14" src={assets.logo} />
                    <p className="mt-6 text-sm">
                        We deliver fresh groceries and snacks straight to your door. Trusted by thousand, we aim to make your shopping experience simple and affordable. 
                        <br /><br /> Get the App                  
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg" alt="google play" className="h-10 w-auto border border-white rounded" />
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg" alt="app store" className="h-10 w-auto border border-white rounded" />
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-[160px_minmax(0,1fr)_180px] md:gap-10">
                    <div>
                        <h2 className="mb-5 font-semibold text-black">Shop</h2>
                        <ul className="text-sm space-y-2">
                            <li><Link to="/" className="hover:text-primary">Home</Link></li>
                            <li><Link to="/products" className="hover:text-primary">All Products</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-5 flex items-center gap-4">
                            <h2 className="font-semibold text-black">Categories</h2>
                            <Link to="/products" className="text-primary hover:text-primary-dull">see all</Link>
                        </div>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-3 md:gap-x-10">
                            {PRODUCT_CATEGORIES.map((category) => (
                                <li key={category} className="whitespace-nowrap">
                                    <Link to={`/products/${category.toLowerCase()}`} className="hover:text-primary">{category}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-5 font-semibold text-black">Contact</h2>
                        <div className="text-sm space-y-2">
                            <p>+91 8421725327</p>
                            <p>greencart@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} © <a href=" ">GreenCart</a>. All Right Reserved.
            </p>
        </footer>
    )
}

export default Footer;