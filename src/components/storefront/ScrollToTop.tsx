'use client'

import React from 'react'
import { ChevronUp } from 'lucide-react'

interface ScrollToTopProps {
  visible: boolean
}

export function ScrollToTop({ visible }: ScrollToTopProps) {
  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className={`flex size-14 items-center justify-center rounded-full bg-site-primary text-primary-foreground shadow-lg transition-all duration-500 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ChevronUp className="size-9 -mt-0.5" aria-hidden="true" />
    </button>
  )
}
