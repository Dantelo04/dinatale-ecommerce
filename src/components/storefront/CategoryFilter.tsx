'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { SerializedCategory } from '@/lib/types'

interface CategoryFilterProps {
  categories: SerializedCategory[]
  activeCategoryId: number | null
}

export function CategoryFilter({ categories, activeCategoryId }: CategoryFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <nav
      className="mt-6 flex flex-wrap gap-2"
      aria-label="Filtrar por categoria"
      aria-busy={isPending}
    >
      <Button
        variant={!activeCategoryId ? 'default' : 'outline'}
        size="sm"
        disabled={isPending}
        className={!activeCategoryId ? 'bg-site-primary text-primary-foreground' : ''}
        onClick={() => navigate('/tienda')}
      >
        Todos
      </Button>
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id
        return (
          <Button
            key={cat.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            disabled={isPending}
            className={isActive ? 'bg-site-primary text-primary-foreground' : ''}
            onClick={() => navigate(`/tienda?categoria=${cat.slug}`)}
          >
            {cat.name}
          </Button>
        )
      })}
    </nav>
  )
}
