import React from 'react'
import householdAd from '../assets/promo-household.png'
import mealsAd from '../assets/promo-meals.png'
import bakeryAd from '../assets/promo-bakery.png'
import sweetsAd from '../assets/promo-sweets.jpeg'

const ads = [
  { image: householdAd, alt: 'Household essentials promotion' },
  { image: mealsAd, alt: 'Quick meals promotion' },
  { image: bakeryAd, alt: 'Bakery and breads promotion' },
  { image: sweetsAd, alt: 'Sweets and chocolates promotion' },
]

const PromoAds = () => (
  <section className="mt-10" aria-label="Promotional offers">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ads.map((ad) => (
        <div
          key={ad.alt}
          className="aspect-[2.5/1] overflow-hidden rounded-2xl bg-[#efe5dc] shadow-sm"
        >
          <img src={ad.image} alt={ad.alt} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  </section>
)

export default PromoAds
