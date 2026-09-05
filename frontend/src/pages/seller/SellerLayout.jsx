import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { Users, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SellerProfileOverlay from "../../components/SellerProfileOverlay";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SellerLayout = () => {

  const {setIsSeller} = useAppContext();
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

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
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to='/'>
                <img src={assets.logo} alt="Logo" className="cursor-pointer h-14 w-auto" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! {profile?.name || 'Admin'}</p>
                    <button onClick={() => setShowProfile(true)} className='border rounded-full text-sm px-4 py-1'>Profile</button>
                </div>
            </div>

            <div className="flex">
                <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col ">
                {sidebarLinks.map((item) => (
                    <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                        className={({isActive})=>`flex items-center py-3 px-4 gap-3 
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white "
                            }`
                        }
                    >
                        {item.icon ? <img src={item.icon} alt="" className="w-7 h-7"/> : <item.component size={27} />}
                        <p className="md:block hidden text-center">{item.name}</p>
                    </NavLink>
                ))}
            </div>
            <Outlet/>
            </div>
            {showProfile && <SellerProfileOverlay profile={profile} onClose={() => setShowProfile(false)} onUpdated={setProfile} onLogout={logout} />}
            
        </>
    );
};
export default SellerLayout;