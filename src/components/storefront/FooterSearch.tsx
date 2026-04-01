'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function FooterSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/tienda?buscar=${encodeURIComponent(q)}`)
    } else {
      router.push('/tienda')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-stretch mt-3 w-full max-w-xs">
      <div className="relative flex-1">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full rounded-l-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Buscar productos"
        />
      </div>
      <button
        type="submit"
        className="rounded-r-md border border-l-0 border-border bg-muted px-3 text-muted-foreground hover:bg-muted/80 focus:outline-none focus:ring-1 z-10 transition-colors"
        aria-label="Buscar"
      >
        <Search className="size-4" />
      </button>
    </form>
  )
}
