'use client'

import { useEffect } from 'react'
import { incrementProductViews } from '@/lib/product-actions'

export function ProductViewTracker({ productId }: { productId: number }) {
  useEffect(() => {
    incrementProductViews(productId)
  }, [productId])

  return null
}
