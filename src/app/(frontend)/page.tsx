import React from 'react'
import { GoogleReviews } from '@/components/storefront/GoogleReviews'
import { HeroCarousel, type HeroSlide } from '@/components/storefront/HeroCarousel'
import { getCachedGlobal, getCachedProducts } from '@/lib/payload-cache'
import { getCachedPlaceDetails } from '@/lib/google-places'
import type { Media, Category, SiteSetting, StorefrontContent } from '@/payload-types'
import { CornerTools } from '@/components/storefront/CornerTools'
import { CategoriesGallery } from '@/components/storefront/CategoriesGallery'
import { ProductsGallery } from '@/components/storefront/ProductsGallery'

export default async function HomePage() {
  const [settings, content, { docs: featured }, { docs: latest }, placeDetails] = await Promise.all(
    [
      getCachedGlobal<SiteSetting>('site-settings')(),
      getCachedGlobal<StorefrontContent>('storefront-content', 2)(),
      getCachedProducts({
        where: { featured: { equals: true }, active: { equals: true } },
        limit: 4,
        sort: '-createdAt',
      })(),
      getCachedProducts({
        where: { active: { equals: true } },
        limit: 5,
        sort: '-createdAt',
      })(),
      getCachedPlaceDetails(),
    ],
  )

  const currencySymbol = settings.currencySymbol || '$'

  const heroSlides: HeroSlide[] = (content.heroSlides ?? [])
    .filter((slide) => {
      const img = slide.image as Media | null
      return img?.url
    })
    .map((slide) => {
      const img = slide.image as Media
      return {
        title: slide.title || undefined,
        subtitle: slide.subtitle,
        imageUrl: img.url!,
        imageAlt: img.alt || slide.title || '',
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
      }
    })

  const storefrontCategories = (content.categories ?? []).filter(
    (cat): cat is { category: Category; id?: string | null } => typeof cat.category !== 'number',
  )

  const sections = content.homeSections?.filter((s) => s.enabled) ?? [
    { type: 'categories' as const, enabled: true, id: 'default-categories' },
    { type: 'featured' as const, enabled: true, id: 'default-featured' },
    { type: 'reviews' as const, enabled: true, id: 'default-reviews' },
    { type: 'latest' as const, enabled: true, id: 'default-latest' },
  ]

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      {sections.map((section) => {
        switch (section.type) {
          case 'categories':
            return (
              <CategoriesGallery
                key={section.id}
                storefrontCategories={storefrontCategories}
                title={section.title || undefined}
                variant={section.variant || undefined}
              />
            )
          case 'featured':
            return featured.length > 0 ? (
              <ProductsGallery
                key={section.id}
                products={featured}
                currencySymbol={currencySymbol}
                title={section.title || 'Productos Destacados'}
                columnQuantity={5}
              />
            ) : null
          case 'reviews':
            return placeDetails ? (
              <GoogleReviews
                key={section.id}
                place={placeDetails}
                title={section.title || undefined}
              />
            ) : null
          case 'latest':
            return latest.length > 0 ? (
              <ProductsGallery
                key={section.id}
                products={latest}
                currencySymbol={currencySymbol}
                title={section.title || 'Ultimos Productos'}
                columnQuantity={5}
              />
            ) : null
          default:
            return null
        }
      })}

      <CornerTools whatsappNumber={settings.whatsappNumber} showScrollToTop={false} />
    </>
  )
}
