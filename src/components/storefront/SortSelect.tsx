'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS } from '@/lib/utils'

export function SortSelect({ defaultSort = 'destacado' }: { defaultSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('ordenar') ?? defaultSort

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultSort) {
      params.delete('ordenar')
    } else {
      params.set('ordenar', value)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(`/tienda${qs ? `?${qs}` : ''}`)
    })
  }

  return (
    <div className="flex lg:items-center gap-2 sm:w-fit w-full lg:flex-row flex-col lg:pb-0 pb-4">
      <span className="text-sm font-semibold whitespace-nowrap">Ordenar por:</span>
      <Select value={currentSort} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="sm:w-[220px] w-full" aria-label="Ordenar productos">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
