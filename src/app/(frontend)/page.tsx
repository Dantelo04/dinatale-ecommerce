import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/storefront/ProductCard'
import { GoogleReviews } from '@/components/storefront/GoogleReviews'
import { getCachedGlobal, getCachedProducts, getCachedCategories } from '@/lib/payload-cache'
import { getCachedPlaceDetails } from '@/lib/google-places'
import type { Media, Category, Product, SiteSetting, StorefrontContent } from '@/payload-types'

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

  const heroImage = content.hero?.heroImage as Media | null
  const currencySymbol = settings.currencySymbol || '$'

  return (
    <>
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-muted">
        {heroImage?.url && (
          <Image
            src={heroImage.url}
            alt={content.hero?.heroTitle || 'Banner principal'}
            fill
            className="object-cover"
            style={{ filter: 'blur(3px)' }}
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight text-wrap-balance sm:text-5xl lg:text-6xl">
            {content.hero?.heroTitle || 'Bienvenidos a nuestra tienda'}
          </h1>
          <p className="mt-4 text-lg text-white/90 text-pretty sm:text-xl">
            {content.hero?.heroSubtitle || 'Descubri nuestros productos'}
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Link href="/tienda">
                Ver Productos
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg pt-0 gap-0">
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
                    <CardContent className="p-3 pb-0 pt-4">
                      <h3 className="text-sm font-medium text-center line-clamp-1">{cat.name}</h3>
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
    </>
  )
}
