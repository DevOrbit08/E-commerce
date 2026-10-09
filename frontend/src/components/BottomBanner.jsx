import React from 'react'
import { assets } from '../assets/assets'

const BottomBanner = () => {
  return (
    <div className='relative mt-12 overflow-hidden rounded-xl sm:mt-24'>
      <img src={assets.bottom_banner_image} alt="banner" className='hidden w-full md:block' />
      <img src={assets.bottom_banner_image_sm} alt="banner" className='block h-auto w-full md:hidden' />
    </div>
  )
}

export default BottomBanner
