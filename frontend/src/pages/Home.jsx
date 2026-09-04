import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import PromoAds from '../components/PromoAds'

const Home = () => {
  return (
    
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      <PromoAds />
      <BestSeller/>
      <BottomBanner/>
      <NewsLetter/>

    </div>
  )
}

export default Home
