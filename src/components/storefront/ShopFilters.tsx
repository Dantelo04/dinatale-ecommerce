'use client'

import React, { useState, useRef, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatPrice } from '@/lib/utils'

interface ShopFiltersProps {
  categories: { id: number; name: string; slug: string }[]
  activeCategorySlug: string | null
  priceRange: { min: number; max: number }
  initialSearch: string
  initialPriceMin: number | null
  initialPriceMax: number | null
  currencySymbol: string
}

export function ShopFilters({
  categories,
  activeCategorySlug,
  priceRange,
  initialSearch,
  initialPriceMin,
  initialPriceMax,
  currencySymbol,
}: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const effectiveMin = initialPriceMin ?? priceRange.min
  const effectiveMax = initialPriceMax ?? priceRange.max

  const [search, setSearch] = useState(initialSearch)
  const [sliderValues, setSliderValues] = useState<[number, number]>([effectiveMin, effectiveMax])

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sliderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const qs = params.toString()
      startTransition(() => {
        router.push(`/tienda${qs ? `?${qs}` : ''}`)
      })
    },
    [router, searchParams, startTransition],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      navigate({ buscar: value || null })
    }, 400)
  }

  const handleSliderChange = (values: number[]) => {
    setSliderValues([values[0], values[1]])
  }

  const handleSliderCommit = (values: number[]) => {
    if (sliderTimeout.current) clearTimeout(sliderTimeout.current)
    sliderTimeout.current = setTimeout(() => {
      navigate({
        precioMin: values[0] > priceRange.min ? String(values[0]) : null,
        precioMax: values[1] < priceRange.max ? String(values[1]) : null,
      })
    }, 300)
  }

  const handleCategoryClick = (slug: string | null) => {
    navigate({ categoria: slug })
  }

  const hasActiveFilters =
    search || initialPriceMin !== null || initialPriceMax !== null || activeCategorySlug

  const handleClearAll = () => {
    setSearch('')
    setSliderValues([priceRange.min, priceRange.max])
    startTransition(() => {
      router.push('/tienda')
    })
  }

  return (
    <div className="mt-4 flex xl:flex-row flex-col gap-5" aria-busy={isPending}>
      <div className="flex flex-col gap-4 sm:flex-row xl:items-center flex-wrap">
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="shop-search" className="sr-only">
            Buscar productos
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="shop-search"
            type="search"
            name="buscar"
            autoComplete="off"
            spellCheck={false}
            placeholder="Buscar productos..."
            value={search}
            onChange={handleSearchChange}
            disabled={isPending}
            className="pl-9 min-w-64"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs min-w-64">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Precio</span>
            <span className="text-xs font-medium tabular-nums text-foreground">
              {formatPrice(sliderValues[0], currencySymbol)} &ndash;{' '}
              {formatPrice(sliderValues[1], currencySymbol)}
            </span>
          </div>
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={Math.max(1, Math.round((priceRange.max - priceRange.min) / 100))}
            value={sliderValues}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            disabled={isPending}
            aria-label="Rango de precio"
          />
        </div>

        {categories.length > 0 && (
          <div
            className="flex flex-wrap gap-2 w-fit xl:mt-0 mt-4"
            aria-label="Filtrar por categoria"
          >
            <Button
              variant={!activeCategorySlug ? 'default' : 'outline'}
              size="sm"
              disabled={isPending}
              className={!activeCategorySlug ? 'bg-site-primary text-primary-foreground' : ''}
              onClick={() => handleCategoryClick(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  disabled={isPending}
                  className={isActive ? 'bg-site-primary text-primary-foreground' : ''}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.name}
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* {isPending && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
      )} */}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground w-fit pl-0 hover:bg-transparent"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
