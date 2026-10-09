import { createElement } from 'react'
import { Check, Package, Truck, LoaderCircle } from 'lucide-react'

const steps = [
  { label: 'Order', icon: Package },
  { label: 'Process', icon: LoaderCircle },
  { label: 'Delivered', icon: Truck },
]

const OrderStatusTracker = ({ status = 'Order Placed' }) => {
  const currentStep = status === 'Delivered' ? 2 : status === 'Processing' ? 1 : 0

  if (status === 'Cancelled') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        Order cancelled
      </div>
    )
  }

  return (
    <div className="relative px-1 py-2">
      <div className="absolute left-[16.666%] right-[16.666%] top-[25px] h-0.5 bg-gray-200" />
      <div
        className="absolute left-[16.666%] top-[25px] h-0.5 bg-primary transition-all"
        style={{ width: `${currentStep * 33.333}%` }}
      />
      <div className="relative grid grid-cols-3">
        {steps.map(({ label, icon: Icon }, index) => {
          const complete = index <= currentStep
          const active = index === currentStep
          return (
            <div key={label} className="flex min-w-0 flex-col items-center gap-2 text-center">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                complete ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {index < currentStep
                  ? <Check size={17} strokeWidth={3} />
                  : createElement(Icon, { size: 17, className: active && index === 1 ? 'animate-spin' : '' })}
              </span>
              <span className={`text-xs font-semibold sm:text-sm ${
                complete ? 'text-primary' : 'text-gray-400'
              }`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderStatusTracker
