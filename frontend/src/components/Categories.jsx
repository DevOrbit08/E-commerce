import React from 'react'
import {  categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Categories = () => {

        const {navigate} = useAppContext()

  return (
    <div className='mt-10 sm:mt-16'>
      <p className='text-xl font-medium sm:text-2xl md:text-3xl'>Categories</p>
      <div className='mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'>
        
        {categories.map((category, index)=>(          
          <div key={index} className='group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg px-2 py-4 sm:px-3 sm:py-5'
            style={{backgroundColor:category.bgColor }} 
            onClick={()=>{
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0,0)
            }}  
            >
          <img src={category.image} alt={category.text} className='h-20 w-20 object-contain transition sm:h-24 sm:w-24'/>
          <p className='text-center text-xs font-medium sm:text-sm'>{category.text}</p>
        </div>
        ))}
        
        

      </div>
    </div>
  )
}

export default Categories
