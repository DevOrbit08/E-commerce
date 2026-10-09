import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {
  return (
    <div className='relative overflow-hidden rounded-xl sm:rounded-2xl'>
      <img src={assets.main_banner_bg} alt="banner" className='hidden w-full md:block'/>
      <img src={assets.main_banner_bg_sm} alt="banner" className='block h-[310px] w-full object-cover object-center sm:h-[360px] md:hidden'/>
      <div className='absolute inset-0 flex flex-col items-center justify-end px-4 pb-8 sm:pb-12 md:items-start md:justify-center md:px-12 md:pb-0 lg:px-24'>
        <h1 className='max-w-[290px] text-center text-2xl font-bold leading-tight sm:max-w-sm sm:text-3xl md:max-w-80 md:text-left md:text-4xl lg:max-w-[420px] lg:text-5xl'>Freshness You Can Trust, Saving You Will Love!</h1>
      
      <div className='flex items-center mt-6 font-medium'>
        <Link to={"/products"} className='group flex items-center gap-2 rounded px-6 py-2.5 text-sm text-white transition hover:bg-primary-dull sm:px-7 sm:py-3 md:px-9 md:text-base'>
        Shop now
        <img className='md:hidden transition group-focus:translate-x-1' src={assets.white_arrow_icon} alt="arrow" />
        </Link>

        <Link to={"/products"} className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer'>
        Explore deals
        <img className='transition group-hover:translate-x-1' src={assets.black_arrow_icon} alt="arrow" />
        </Link>

        
      </div>
      </div>
    </div>
  )
}

export default MainBanner
