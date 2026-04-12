import { ProductCard } from './ProductCard'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Category, Media, Product } from '@/payload-types'
import { Fragment } from 'react'

interface ProductsGalleryProps {
  products: Product[]
  currencySymbol: string
  title?: string
  columnQuantity?: number
}

const gridCols: Record<number, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
}

export const ProductsGallery = ({
  products,
  currencySymbol,
  title = 'Productos Destacados',
  columnQuantity = 5,
}: ProductsGalleryProps) => {
  return (
    <section className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 pt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-wrap-balance sm:text-2xl">{title}</h2>

        <Link
          href="/tienda"
          className="text-sm font-medium text-site-secondary mt-0.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm flex items-center"
        >
          Ver todos
          <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <hr className="my-2" />
      <div
        className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridCols[columnQuantity ?? 5]}`}
      >
        {products.map((product: Product, index: number) => {
          const firstImage = product.images?.[0]?.image as Media | null
          return (
            <Fragment key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                imageUrl={firstImage?.url ?? null}
                imageAlt={firstImage?.alt ?? product.name}
                currencySymbol={currencySymbol}
                sales={product.sales ?? 0}
                views={product.views ?? 0}
                stock={product.stock ?? 5}
                category={product.category as Category[]}
              />
              {products.length % 2 !== 0 && index === products.length - 1 && (
                <Link
                  href="/tienda"
                  className="border rounded-xl sm:hidden p-4 text-sm font-medium gap-2 text-site-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center flex-wrap active:scale-95"
                >
                  <div className="flex flex-wrap justify-center items-center gap-3">
                    <ShoppingBag className="size-12" aria-hidden="true" strokeWidth={1.5}/>
                    Ver más productos{' '}
                  </div>
                </Link>
              )}
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}
