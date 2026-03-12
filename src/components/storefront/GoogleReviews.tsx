import React from 'react'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { PlaceDetails } from '@/lib/google-places'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function AggregateRating({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl font-bold tracking-tight tabular-nums">{rating.toFixed(1)}</span>
      <div className="flex flex-col">
        <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`} role="img">
          {Array.from({ length: 5 }, (_, i) => {
            const filled = rating - i
            return (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  filled >= 1
                    ? 'fill-amber-400 text-amber-400'
                    : filled >= 0.5
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'fill-muted text-muted'
                }`}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <span className="text-sm text-muted-foreground">
          {totalReviews.toLocaleString('es-AR')} opiniones en Google
        </span>
      </div>
    </div>
  )
}

export function GoogleReviews({ place }: { place: PlaceDetails }) {
  const visibleReviews = place.reviews.filter((r) => r.text.length > 0).slice(0, 6)

  if (visibleReviews.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
      <div className="flex flex-col xl:gap-6 gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-row justify-between items-center w-full flex-wrap gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-wrap-balance sm:text-3xl">
            Lo que dicen nuestros clientes
          </h2>

          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-site-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Ver en Google Maps
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>
      <hr className="my-4" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReviews.map((review, i) => (
          <Card key={i} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 px-5">
              <div className="flex items-center gap-3">
                {review.authorPhotoUrl ? (
                  <Image
                    src={review.authorPhotoUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
                    aria-hidden="true"
                  >
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {review.authorUrl ? (
                    <a
                      href={review.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold truncate block hover:text-site-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {review.authorName}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold truncate block">
                      {review.authorName}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{review.relativeTime}</span>
                </div>
              </div>
              <StarRating rating={review.rating} />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                {review.text}
              </p>
            </CardContent>
          </Card>
        ))}
        <a
          href={place.googleMapsUrl ?? ''}
          target="_blank"
          rel="noopener noreferrer"
          className="h-full"
        >
          <Card className="flex flex-col cursor-pointer h-full">
            <CardContent className="flex flex-1 flex-col gap-3 px-5 items-center justify-center">
              <MapPin className="size-9 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm leading-relaxed text-muted-foreground line-clamp-4 text-center">
                VER MÁS RESEÑAS
              </span>
            </CardContent>
          </Card>
        </a>
      </div>
      <div className="mt-8">
        <AggregateRating rating={place.rating} totalReviews={place.totalReviews} />
      </div>
    </section>
  )
}
