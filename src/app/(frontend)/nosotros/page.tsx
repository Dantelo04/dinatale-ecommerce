import React from 'react'
import Image from 'next/image'
import { RichTextContent } from '@/components/storefront/RichTextContent'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { Media, StorefrontContent } from '@/payload-types'

export const metadata = {
  title: 'Nosotros',
  description: 'Conocé más sobre nosotros, nuestra historia y los valores que nos guían.',
  alternates: { canonical: '/nosotros' },
  openGraph: { type: 'website' as const, title: 'Nosotros', url: 'https://www.dinatale.com.py/nosotros', locale: 'es_AR' },
}

export default async function NosotrosPage() {
  const content = await getCachedGlobal<StorefrontContent>('storefront-content')()

  const aboutImage = content.about?.aboutImage as Media | null

  return (
    <div className="mx-auto max-w-8xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
        {content.about?.aboutTitle || 'Sobre Nosotros'}
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {aboutImage?.url && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              src={aboutImage.url}
              alt={aboutImage.alt || 'Sobre nosotros'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className={`prose prose-neutral max-w-none text-foreground ${!aboutImage?.url ? 'lg:col-span-2' : ''}`}>
          {content.about?.aboutContent ? (
            <RichTextContent content={content.about.aboutContent} />
          ) : (
            <p className="text-muted-foreground">
              Proximamente...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
