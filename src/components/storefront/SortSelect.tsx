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

const SORT_OPTIONS = [
  { value: 'destacado', label: 'Destacado' },
  { value: 'mas-vendidos', label: 'Más vendidos' },
  { value: 'a-z', label: 'Alfabéticamente, A–Z' },
  { value: 'z-a', label: 'Alfabéticamente, Z–A' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'mas-antiguo', label: 'Fecha: más antiguo' },
  { value: 'mas-reciente', label: 'Fecha: más reciente' },
]

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('ordenar') ?? 'destacado'

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'destacado') {
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
