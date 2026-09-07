import { useState } from 'react';
import toast from 'react-hot-toast';

const DeliveryPartnerSection = ({ title, description }) => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <p className="mt-2 text-gray-500">{description}</p>
    <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="text-gray-500">No orders available in this section.</p>
    </div>
  </div>
);

const PaymentQrCode = () => (
  <svg viewBox="0 0 210 210" className="h-52 w-52 rounded-lg bg-white p-3" role="img" aria-label="Payment QR code">
    <rect width="210" height="210" fill="white" />
    <path fill="#111827" d="M10 10h60v60H10zM20 20v40h40V20zM32 32h16v16H32zM140 10h60v60h-60zM150 20v40h40V20zM162 32h16v16h-16zM10 140h60v60H10zM20 150v40h40v-40zM32 162h16v16H32zM85 10h15v15H85zM110 10h15v30h-15zM85 35h15v15H85zM105 55h20v15h-20zM80 80h20v20H80zM110 80h15v15h-15zM135 80h15v30h-15zM165 80h20v15h-20zM190 85h10v30h-10zM80 110h15v30H80zM105 110h30v15h-30zM150 115h15v25h-15zM175 120h25v15h-25zM85 150h20v15H85zM115 145h15v30h-15zM140 150h20v15h-20zM170 150h15v15h-15zM90 180h15v20H90zM130 180h30v15h-30zM175 175h25v25h-25z" />
  </svg>
);

export const DeliveryPartnerOrders = () => (
  <DeliveryPartnerSection
    title="Orders"
    description="View orders that are ready to be assigned for delivery."
  />
);

export const DeliveryPartnerDeliveries = () => {
  const [otp, setOtp] = useState('');
  const [paymentType, setPaymentType] = useState('COD');
  const [isDone, setIsDone] = useState(false);

  const completeDelivery = (event) => {
    event.preventDefault();

    if (!/^\d{4,6}$/.test(otp)) {
      toast.error('Enter a valid 4 to 6 digit OTP');
      return;
    }

    setIsDone(true);
    toast.success('Delivery marked as completed');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">Deliveries</h2>
      <p className="mt-2 text-gray-500">Complete the delivery after receiving the customer OTP and payment.</p>

      <form onSubmit={completeDelivery} className="mt-8 grid max-w-5xl gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Customer delivery</h3>
              <p className="mt-1 text-sm text-gray-500">Enter the OTP provided by the customer.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {isDone ? 'Completed' : 'In progress'}
            </span>
          </div>

          <label className="mt-6 block text-sm font-medium text-gray-700">
            Delivery OTP
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              disabled={isDone}
              placeholder="Enter OTP"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary"
            />
          </label>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-gray-700">Payment type</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {['Online', 'COD', 'Card'].map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                    paymentType === type ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value={type}
                    checked={paymentType === type}
                    onChange={(event) => setPaymentType(event.target.value)}
                    disabled={isDone}
                    className="accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isDone}
            className="mt-7 rounded-xl bg-primary px-8 py-3 font-medium text-white transition hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDone ? 'Done' : 'Mark as Done'}
          </button>
        </div>

        <aside className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-[#fffaf6] p-5 text-center">
          <h3 className="font-semibold text-gray-800">Online payment</h3>
          <p className="mt-2 text-sm text-gray-500">
            If this is a COD order and the customer wants to pay online, let them scan this QR code.
          </p>
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            <PaymentQrCode />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">Scan to pay</p>
          <p className="mt-1 text-xs text-gray-500">Confirm payment before tapping Done.</p>
        </aside>
      </form>
    </div>
  );
};

export const DeliveryPartnerCompletedOrders = () => (
  <DeliveryPartnerSection
    title="Completed Orders"
    description="View your successfully completed deliveries."
  />
);
