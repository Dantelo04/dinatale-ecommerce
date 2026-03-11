import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/storefront/ProductCard'
import { GoogleReviews } from '@/components/storefront/GoogleReviews'
import { HeroCarousel, type HeroSlide } from '@/components/storefront/HeroCarousel'
import { getCachedGlobal, getCachedProducts, getCachedCategories } from '@/lib/payload-cache'
import { getCachedPlaceDetails } from '@/lib/google-places'
import type { Media, Category, Product, SiteSetting, StorefrontContent } from '@/payload-types'
import { CornerTools } from '@/components/storefront/CornerTools'

export default async function HomePage() {
  const [
    settings,
    content,
    { docs: featured },
    { docs: categories },
    { docs: latest },
    placeDetails,
  ] = await Promise.all([
    getCachedGlobal<SiteSetting>('site-settings')(),
    getCachedGlobal<StorefrontContent>('storefront-content')(),
    getCachedProducts({
      where: { featured: { equals: true }, active: { equals: true } },
      limit: 4,
      sort: '-createdAt',
    })(),
    getCachedCategories(12)(),
    getCachedProducts({
      where: { active: { equals: true } },
      limit: 5,
      sort: '-createdAt',
    })(),
    getCachedPlaceDetails(),
  ])

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

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-wrap-balance sm:text-3xl">
              Productos Destacados
            </h2>
            <Link
              href="/tienda"
              className="text-sm font-medium text-site-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Ver todos
              <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product: Product) => {
              const firstImage = product.images?.[0]?.image as Media | null
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  imageUrl={firstImage?.url ?? null}
                  imageAlt={firstImage?.alt ?? product.name}
                  currencySymbol={currencySymbol}
                />
              )
            })}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-wrap-balance sm:text-3xl">
            Categorias
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat: Category) => {
              const catImage = cat.image as Media | null
              return (
                <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
                  <Card className="group overflow-hidden transition-all active:scale-95 hover:shadow-lg pt-0 gap-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {catImage?.url ? (
                        <Image
                          src={catImage.url}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          {cat.name}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 pb-0 pt-4 border-t">
                      <h3 className="text-sm font-medium text-center line-clamp-1 -mb-1">{cat.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {placeDetails && <GoogleReviews place={placeDetails} />}

      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-wrap-balance sm:text-3xl">
              Ultimos Productos
            </h2>
            <Link
              href="/tienda"
              className="text-sm font-medium text-site-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Ver mas
              <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {latest.map((product: Product) => {
              const firstImage = product.images?.[0]?.image as Media | null
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  imageUrl={firstImage?.url ?? null}
                  imageAlt={firstImage?.alt ?? product.name}
                  currencySymbol={currencySymbol}
                />
              )
            })}
          </div>
        </section>
      )}

      <CornerTools whatsappNumber={settings.whatsappNumber} showScrollToTop={false} />
    </>
  )
}
