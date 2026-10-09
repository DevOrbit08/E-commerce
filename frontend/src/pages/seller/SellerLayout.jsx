import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { Menu, Users, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SellerProfileOverlay from "../../components/SellerProfileOverlay";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SellerLayout = () => {

  const {setIsSeller} = useAppContext();
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/seller/profile`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setProfile(data.seller);
      })
      .catch(() => toast.error('Unable to load seller profile'));
  }, []);

    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
        { name: "Customers", path: "/seller/customers", icon: null, component: Users },
        { name: "Delivery Partner", path: "/seller/delivery-partners", icon: null, component: Truck },
    ];

    const logout = async ()=>{
        try {
            await fetch(`${API_URL}/api/seller/logout`, { credentials: 'include' });
        } finally {
            setIsSeller(false);
        }
    }

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 flex h-[58px] min-w-0 items-center justify-between gap-2 overflow-hidden border-b border-gray-300 bg-white px-3 py-2.5 sm:px-5 sm:py-3 md:h-[73px] md:px-8">
                <Link to='/' className="min-w-0 shrink">
                <img src={assets.logo} alt="Logo" className="h-9 w-auto cursor-pointer sm:h-12" />
                </Link>
                <div className="flex items-center gap-1.5 text-gray-500 sm:gap-4">
                        <p className="hidden max-w-40 truncate text-sm sm:block">Hi! {profile?.name || 'Admin'}</p>
                        <button type="button" aria-label="Open seller menu" onClick={() => setShowSidebar(true)} className="rounded-lg p-2 hover:bg-primary/10 md:hidden">
                            <Menu size={20} />
                        </button>
                        <button onClick={() => setShowProfile(true)} className='rounded-full border px-3 py-1 text-xs sm:px-4 sm:text-sm'>Profile</button>
                    </div>
            </header>

                <div className="flex min-h-screen items-start pt-[58px] md:pt-[73px]">
                    {showSidebar && <button type="button" aria-label="Close seller menu" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setShowSidebar(false)} />}
                    <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-300 bg-white pt-16 text-base shadow-xl transition-transform md:fixed md:inset-y-auto md:top-[73px] md:bottom-0 md:z-10 md:h-auto md:w-64 md:translate-x-0 md:overflow-y-auto md:pt-4 md:shadow-none`}>
                    <button type="button" aria-label="Close seller menu" onClick={() => setShowSidebar(false)} className="absolute right-3 top-4 rounded-lg p-2 text-gray-500 hover:bg-primary/10 md:hidden"><X size={20} /></button>
                    {sidebarLinks.map((item) => (
                        <NavLink onClick={() => setShowSidebar(false)} to={item.path} key={item.name} end={item.path === "/seller"}
                            className={({isActive})=>`flex items-center py-3 px-4 gap-3
                                ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                    : "hover:bg-gray-100/90 border-white "
                            }`
                        }
                    >
                        {item.icon ? <img src={item.icon} alt="" className="w-7 h-7"/> : <item.component size={27} />}
                        <p className="block text-center">{item.name}</p>
                    </NavLink>
                ))}
            </aside>
            <main className="min-w-0 flex-1 md:ml-64"><Outlet/></main>
            </div>
            {showProfile && <SellerProfileOverlay profile={profile} onClose={() => setShowProfile(false)} onUpdated={setProfile} onLogout={logout} />}
            
        </>
    );
};
export default SellerLayout;