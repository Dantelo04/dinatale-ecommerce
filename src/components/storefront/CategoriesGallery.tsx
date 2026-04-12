import { Category, Media } from '@/payload-types'
import { Card, CardContent } from '../ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface CategoriesGalleryProps {
  storefrontCategories: {
    category: Category
    id?: string | null
  }[]
}

export const CategoriesGallery = ({ storefrontCategories }: CategoriesGalleryProps) => {
  if (storefrontCategories.length > 0) {
    return (
      <section className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 lg:pt-16 pt-8">
        <h2 className="text-xl font-bold tracking-tight text-wrap-balance sm:text-2xl">
          Categorias
        </h2>
        <hr className="my-2" />
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
          {storefrontCategories.map((cat) => {
            const catImage = cat.category.image as Media | null

            return (
              <Link key={cat.category.id} href={`/tienda?categoria=${cat.category.slug}`}>
                <Card className="group overflow-hidden transition-all active:scale-95 hover:shadow-lg pt-0 gap-0 lg:pb-2 pb-4 shadow-none">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {catImage?.url ? (
                      <Image
                        src={catImage.url}
                        alt={cat.category.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                        {cat.category.name}
                      </div>
                    )}
                  </div>
                  <CardContent className="lg:p-3 p-2 lg:pt-4 pt-3 border-t flex flex-col gap-2 pb-0">
                    <h3 className="text-sm font-medium line-clamp-1 -mb-1">{cat.category.name}</h3>
                    <span className="text-xs text-muted-foreground max-h-32 truncate">
                      {cat.category.description}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    )
  }
}
