import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CreditCard,
  Gift,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wallet,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const paymentMethods = [
  { key: "COD", label: "COD", desc: "Pay on delivery" },
  { key: "UPI", label: "UPI", desc: "Scan & pay" },
  { key: "CARD", label: "Card", desc: "Credit / Debit" },
];

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    clearCart,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const scannerVideoRef = useRef(null);
  const scannerStreamRef = useRef(null);

  const getCart = () => {
    const tempArray = [];
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);
      if (!product) continue;
      tempArray.push({ ...product, quantity: cartItems[key] });
    }
    setCartArray(tempArray);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/address/get`, { credentials: "include" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setAddresses(data.addresses);
          setSelectedAddress(data.addresses[0]);
        }
      } catch (err) {
        console.error("Fetching addresses failed:", err.message);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  const subtotal = getCartAmount();
  const deliveryFee = 0;
  const tax = subtotal * 0.02;
  const totalAmount = subtotal + deliveryFee + tax;

  const stopScanner = () => {
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    }
    setIsScanning(false);
  };

  const PlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (selectedPaymentMethod === "CARD") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error("Please complete all card details");
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      const itemsPayload = cartArray.map((p) => ({ product: p._id, quantity: p.quantity }));
      
      if (selectedPaymentMethod === "COD") {
        const res = await fetch(`${API_URL}/api/order/cod`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ address: selectedAddress, items: itemsPayload }),
        });
        const data = await res.json();
        if (data && data.success) {
          toast.success("Order placed successfully");
          clearCart();
          navigate("/my-orders");
          window.scrollTo(0, 0);
        } else {
          toast.error((data && data.message) || "Order failed");
        }
      } else {
        const res = await fetch(`${API_URL}/api/order/stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ address: selectedAddress, items: itemsPayload, paymentMethod: selectedPaymentMethod }),
        });
        const data = await res.json();
        if (data && data.success) {
          toast.success("Order placed successfully");
          clearCart();
          navigate("/my-orders");
          window.scrollTo(0, 0);
        } else {
          toast.error((data && data.message) || "Payment processing failed");
        }
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    if (!("BarcodeDetector" in window)) {
      setScannerMessage("QR scanning is not supported in this browser. Please use the payment button below.");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      scannerStreamRef.current = stream;
      scannerVideoRef.current.srcObject = stream;
      await scannerVideoRef.current.play();
      setIsScanning(true);
      setScannerMessage("Point your camera at the payment QR code.");

      const scan = async () => {
        if (!scannerVideoRef.current || !scannerStreamRef.current) return;
        const codes = await detector.detect(scannerVideoRef.current);
        if (codes.length > 0) {
          stopScanner();
          await PlaceOrder();
          return;
        }
        window.requestAnimationFrame(scan);
      };

      scan();
    } catch (err) {
      setScannerMessage(err.message || "Unable to access the camera.");
      stopScanner();
    }
  };

  if (!(products.length > 0 && cartItems)) return null;

  if (cartArray.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <div className="rounded-[22px] border border-[#ecdccf] bg-[#f8f4f0] p-10">
          <ShoppingBag size={44} className="mx-auto text-[#f1683a]" />
          <h2 className="mt-4 text-2xl font-semibold text-[#1f1e1c]">Your basket is empty</h2>
          <p className="mt-2 text-sm text-[#7d756f]">Add products to your basket to continue checkout.</p>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 rounded-xl bg-[#f1683a] px-6 py-3 font-semibold text-white hover:bg-[#e95d2f]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[22px] border border-[#ecdccf] bg-[#f7f3ef] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[26px] font-semibold text-[#1f1e1c]">Your basket</h2>
              <span className="rounded-full bg-[#fff1eb] px-2.5 py-1 text-xs font-semibold text-[#f1683a]">
                {getCartCount()} items
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {cartArray.map((product) => {
              const currentQty = cartItems[product._id] || 0;
              const unitPrice = Number(product.offerPrice || product.price || 0);
              const lineTotal = unitPrice * currentQty;

              return (
                <div key={product._id} className="flex items-center gap-4 rounded-[20px] border border-[#ebddd2] bg-white p-3 shadow-[0_8px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-[16px] bg-[#f6efe9] p-2">
                    <img
                      src={(product.image && product.image[0]) ? product.image[0] : assets.upload_area}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-[#1f1e1c]">{product.name}</h3>
                      <p className="mt-1 text-sm text-[#7d756f]">
                        {product.weight || product.unit || "1 pack"}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#fff1eb] px-2 py-1 text-[11px] font-semibold text-[#f1683a]">
                          {product.discount || "15% OFF"}
                        </span>
                        <span className="text-xs text-[#8a8079]">Save ₹{(Number(product.price || 0) - unitPrice).toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-full border border-[#e7d9cf] bg-[#faf6f4] px-2 py-1.5">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#f1683a] hover:bg-[#fff1eb]"
                          onClick={() => updateCartItem(product._id, Math.max(1, currentQty - 1))}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[30px] text-center text-sm font-semibold text-[#2a2724]">{currentQty}</span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#f1683a] hover:bg-[#fff1eb]"
                          onClick={() => updateCartItem(product._id, currentQty + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-[18px] font-semibold text-[#1f1e1c]">{currency}{lineTotal.toFixed(2)}</div>
                        <div className="mt-1 text-xs text-[#8a8079] line-through">{currency}{(Number(product.price || unitPrice) * currentQty).toFixed(2)}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f4d9d0] bg-[#fff5f2] text-[#d66246] transition hover:bg-[#ffeae3]"
                        aria-label="Remove item"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f1683a]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>
        </div>

        <aside className="h-fit rounded-[22px] border border-[#ecdccf] bg-[#f8f4f0] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-[22px] font-semibold text-[#1f1e1c]">Delivery &amp; Summary</h3>
          </div>

          <div className="mb-4 rounded-[16px] border border-[#e9dccf] bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1eb] text-[#f1683a]">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2a2724]">Delivering to</div>
                  <div className="mt-1 text-sm text-[#5a4d46]">
                    {selectedAddress
                      ? `${selectedAddress.street || selectedAddress.houseFlat || ""}, ${selectedAddress.city || ""}`
                      : "No address selected"}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddress(!showAddress)} className="text-sm font-semibold text-[#f1683a]">
                Change
              </button>
            </div>

            {showAddress && (
              <div className="mt-3 space-y-2 rounded-xl border border-[#e9dccf] bg-[#fffdfb] p-2">
                {addresses.length > 0 ? (
                  addresses.map((address, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        selectedAddress?._id === address._id
                          ? "border-[#f1683a] bg-[#fff1eb] text-[#f1683a]"
                          : "border-[#efe3dc] bg-white text-[#4a4340]"
                      }`}
                    >
                      {address.street || address.houseFlat} , {address.city}, {address.state}
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-[#7d756f]">No saved address</div>
                )}
                <button type="button" onClick={() => navigate("/add-address")} className="mt-1 w-full rounded-lg border border-dashed border-[#f1683a] bg-[#fff4ef] px-3 py-2 text-sm font-semibold text-[#f1683a]">
                  + Add new address
                </button>
              </div>
            )}
          </div>

          <div className="mb-4 rounded-[16px] border border-[#e9dccf] bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2a2724]">
              <Wallet size={15} className="text-[#f1683a]" />
              Payment method
            </div>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.key)}
                  className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium ${
                    selectedPaymentMethod === method.key
                      ? "border-[#f1683a] bg-[#fff1eb] text-[#f1683a]"
                      : "border-[#ebddd2] bg-[#f9f4f2] text-[#5d5752]"
                  }`}
                >
                  <div className="mb-1 flex justify-center">
                    {method.key === "COD" && <PackageCheck size={13} />}
                    {method.key === "UPI" && <Gift size={13} />}
                    {method.key === "CARD" && <CreditCard size={13} />}
                  </div>
                  {method.label}
                </button>
              ))}
            </div>

            {selectedPaymentMethod === "UPI" && (
              <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-[#ebddd2] bg-[#fcfaf8] p-4 text-center">
                <QrCode size={110} className="text-[#1f1e1c]" />
                <p className="mt-2 text-xs font-medium text-[#5a4d46]">Scan with any UPI App to Pay</p>
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={isScanning || isPlacingOrder}
                  className="mt-3 w-full rounded-lg bg-[#2ab673] py-2 text-xs font-semibold text-white transition hover:bg-[#239960] disabled:opacity-60"
                >
                  {isScanning ? "Scanning QR code..." : "Scan QR code"}
                </button>
                <video ref={scannerVideoRef} className={`mt-3 w-full rounded-lg ${isScanning ? "block" : "hidden"}`} muted playsInline />
                {scannerMessage && <p className="mt-2 text-[11px] text-[#7d756f]">{scannerMessage}</p>}
                <button
                  type="button"
                  onClick={PlaceOrder}
                  disabled={isPlacingOrder}
                  className="mt-2 text-xs font-semibold text-[#f1683a] underline disabled:opacity-60"
                >
                  Payment completed? Place order
                </button>
              </div>
            )}

            {selectedPaymentMethod === "CARD" && (
              <div className="mt-3 space-y-2 rounded-xl border border-[#ebddd2] bg-[#fcfaf8] p-3">
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full rounded-lg border border-[#e9dccf] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f1683a]"
                />
                <input
                  type="text"
                  placeholder="Card Number (16 digits)"
                  maxLength={16}
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className="w-full rounded-lg border border-[#e9dccf] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f1683a]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="w-1/2 rounded-lg border border-[#e9dccf] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f1683a]"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={3}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="w-1/2 rounded-lg border border-[#e9dccf] px-3 py-1.5 text-xs focus:outline-none focus:border-[#f1683a]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[16px] border border-[#e9dccf] bg-[#fffefb] p-3">
            <div className="space-y-3 text-sm text-[#5e5853]">
              <div className="flex items-center justify-between">
                <span>Item total</span>
                <span className="font-semibold text-[#2a2724]">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fee</span>
                <span className="font-semibold text-[#2a2724]">{deliveryFee === 0 ? "FREE" : `${currency}${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax (2%)</span>
                <span className="font-semibold text-[#2a2724]">{currency}{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="my-3 h-px bg-[#eeded4]" />

            <div className="flex items-center justify-between text-base font-semibold text-[#1f1e1c]">
              <span>To Pay</span>
              <span className="text-[#f1683a]">{currency}{totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={PlaceOrder}
              disabled={isPlacingOrder}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1683a] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(241,104,58,0.22)] transition hover:bg-[#e95d2f] disabled:opacity-70"
            >
              <ShoppingBag size={18} />
              {isPlacingOrder ? "Placing order..." : "Place order"}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#6c625d]">
              <ShieldCheck size={14} className="text-[#2ab673]" />
              Secure checkout • 100% safe payments
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 grid gap-3 border-t border-[#eadfd5] pt-4 md:grid-cols-4">
        {[
          { icon: <PackageCheck size={18} />, text: "100% Original Products" },
          { icon: <Truck size={18} />, text: "On-time Delivery" },
          { icon: <ShieldCheck size={18} />, text: "Easy Returns" },
          { icon: <Gift size={18} />, text: "Need help? We’re here" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl border border-[#e9ddd2] bg-[#faf6f2] px-3 py-2 text-sm text-[#5d5752]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1eb] text-[#f1683a]">{item.icon}</div>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;