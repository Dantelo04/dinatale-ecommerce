import { ProductCard } from "./ProductCard"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Media, Product } from "@/payload-types"

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
};

export const ProductsGallery = ({ products, currencySymbol, title = 'Productos Destacados', columnQuantity = 5 }: ProductsGalleryProps) => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-wrap-balance sm:text-3xl">
          {title}
        </h2>

        <Link
          href="/tienda"
          className="text-sm font-medium text-site-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Ver todos
          <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <hr className="my-4" />
      <div className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridCols[columnQuantity ?? 5]}`}>
        {products.map((product: Product) => {
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
  )
}
