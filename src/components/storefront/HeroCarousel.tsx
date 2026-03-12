'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  title?: string
  subtitle?: string | null
  imageUrl: string
  imageAlt: string
  buttonText?: string | null
  buttonLink?: string | null
}

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const handleClick = (url: string) => {
    window.location.href = url
  }

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api],
  )

  if (slides.length === 0) return null

  if (slides.length === 1) {
    const slide = slides[0]
    return (
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-muted " onClick={() => handleClick(slide.buttonLink ?? '')}>
        <Image
          src={slide.imageUrl}
          alt={slide.imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', filter: slide.title || slide.subtitle ? 'blur(3px)' : undefined }}
        />
        {/* <div className="absolute inset-0 bg-black/40" /> */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
          {slide.title && <h1 className="text-4xl font-bold tracking-tight text-wrap-balance sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>}
          {slide.subtitle && (
            <p className="mt-4 text-lg text-white/90 text-pretty sm:text-xl">{slide.subtitle}</p>
          )}
          {slide.buttonText && slide.buttonLink && (
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-site-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Link href={slide.buttonLink}>
                  {slide.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Banner principal">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="relative w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="relative pl-0">
              <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-muted">
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="100vw"
                  style={{ objectFit: 'cover', filter: slide.title || slide.subtitle ? 'blur(5px)' : undefined }}
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
                  <h2 className="text-4xl font-bold tracking-tight text-wrap-balance sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-4 text-lg text-white/90 text-pretty sm:text-xl">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonText && slide.buttonLink && (
                    <div className="mt-8">
                      <Button
                        asChild
                        size="lg"
                        className="bg-site-primary text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Link href={slide.buttonLink}>
                          {slide.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="left-4 top-1/2 z-20 h-10 w-10 -translate-y-1/2 border-none bg-white/20 text-white backdrop-blur-sm hover:scale-110 transition-all duration-300 cursor-pointer lg:flex hidden opacity-50 hover:opacity-100"
          aria-label="Slide anterior"
        />
        <CarouselNext
          className="right-4 top-1/2 z-20 h-10 w-10 -translate-y-1/2 border-none bg-white/20 text-white backdrop-blur-sm hover:scale-110 transition-all duration-300 cursor-pointer lg:flex hidden opacity-50 hover:opacity-100"
          aria-label="Siguiente slide"
        />

        {count > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Slides del banner">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={current === index}
                aria-label={`Ir al slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                  current === index ? 'w-8 bg-primary' : 'w-2 bg-white/15 hover:bg-primary/50',
                )}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  )
}
