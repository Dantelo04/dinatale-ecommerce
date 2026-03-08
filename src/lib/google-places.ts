import { unstable_cache } from 'next/cache'

const isDev = process.env.NODE_ENV === 'development'

export interface GoogleReview {
  authorName: string
  authorPhotoUrl: string | null
  authorUrl: string | null
  rating: number
  relativeTime: string
  text: string
  publishTime: string
}

export interface PlaceDetails {
  name: string
  rating: number
  totalReviews: number
  reviews: GoogleReview[]
  googleMapsUrl: string | null
}

async function fetchPlaceDetails(): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const placeId = process.env.PLACE_ID

  if (!apiKey || !placeId) return null

  try {
    const fields = 'displayName,rating,userRatingCount,reviews,googleMapsUri'
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&languageCode=es&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null

    const data = await res.json()

    return {
      name: data.displayName?.text ?? '',
      rating: data.rating ?? 0,
      totalReviews: data.userRatingCount ?? 0,
      googleMapsUrl: data.googleMapsUri ?? null,
      reviews: (data.reviews ?? []).map((r: Record<string, unknown>) => {
        const author = r.authorAttribution as Record<string, string> | undefined
        const text = r.text as { text?: string } | undefined
        return {
          authorName: author?.displayName ?? 'Anonimo',
          authorPhotoUrl: author?.photoUri ?? null,
          authorUrl: author?.uri ?? null,
          rating: (r.rating as number) ?? 0,
          relativeTime: (r.relativePublishTimeDescription as string) ?? '',
          text: text?.text ?? '',
          publishTime: (r.publishTime as string) ?? '',
        }
      }),
    }
  } catch {
    return null
  }
}

export const getCachedPlaceDetails = isDev
  ? fetchPlaceDetails
  : unstable_cache(fetchPlaceDetails, ['google-place-details'], {
      revalidate: 86400,
    })
