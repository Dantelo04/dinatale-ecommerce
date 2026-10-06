'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dialog } from 'radix-ui'
import { ArrowRight, ChevronRight, Clock, Search, SearchX, Store, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { loadMoreProducts } from '@/lib/product-actions'
import { formatPrice } from '@/lib/utils'
import type { SerializedProduct } from '@/lib/types'
import { useCart } from './CartProvider'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250
const RESULTS_LIMIT = 6
const RECENT_KEY = 'recent-searches'
const RECENT_MAX = 5

const QUICK_LINKS = [
  { href: '/tienda', label: 'Toda la tienda', icon: Store },
  { href: '/tienda?ofertas=true', label: 'Ofertas', icon: Tag },
]

interface SearchResults {
  query: string
  products: SerializedProduct[]
  hasMore: boolean
  error: boolean
}

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

function writeRecent(terms: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(terms))
  } catch {
    // Storage unavailable (private mode, blocked cookies) — recent searches are optional.
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (!query || index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-foreground">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  )
}

export function HeaderSearchMobile() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const { currencySymbol } = useCart()

  const trimmed = query.trim()
  const isSearching = trimmed.length >= MIN_QUERY_LENGTH
  const isLoading = isSearching && results?.query !== trimmed
  // Keep the previous results on screen (dimmed) while the next ones load to avoid flicker.
  const visibleResults = isSearching ? results : null

  // Debounced live results
  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return
    let cancelled = false
    const id = setTimeout(async () => {
      try {
        const { products, hasNextPage } = await loadMoreProducts(1, {
          buscar: trimmed,
          limit: RESULTS_LIMIT,
          ordenar: 'mas-vendidos',
        })
        if (!cancelled) setResults({ query: trimmed, products, hasMore: hasNextPage, error: false })
      } catch {
        if (!cancelled) setResults({ query: trimmed, products: [], hasMore: false, error: true })
      }
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [trimmed])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setRecent(readRecent())
    } else {
      setQuery('')
      setResults(null)
    }
  }

  function rememberSearch(term: string) {
    const next = [term, ...readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase())]
    writeRecent(next.slice(0, RECENT_MAX))
  }

  function clearRecent() {
    writeRecent([])
    setRecent([])
  }

  function search(term: string) {
    const q = term.trim()
    if (q) rememberSearch(q)
    router.push(q ? `/tienda?buscar=${encodeURIComponent(q)}` : '/tienda')
    handleOpenChange(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    search(query)
  }

  function handleResultClick() {
    rememberSearch(trimmed)
    handleOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden relative -bottom-0.5 hover:bg-transparent transition-all active:scale-90"
          aria-label="Buscar productos"
        >
          <Search className="size-7" aria-hidden="true" strokeWidth={1.5} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          className="fixed inset-0 z-[60] flex h-dvh flex-col bg-background focus:outline-none md:hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <Dialog.Title className="sr-only">Buscar productos</Dialog.Title>
          <Dialog.Description className="sr-only">
            Escribí el nombre de un producto para ver resultados.
          </Dialog.Description>

          {/* Search bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] animate-in slide-in-from-top-2 duration-300">
            <form
              role="search"
              onSubmit={handleSubmit}
              className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-muted px-4 transition-shadow focus-within:ring-2 focus-within:ring-ring/50"
            >
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  aria-label="Limpiar busqueda"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-foreground/70 transition-colors active:bg-foreground/20"
                >
                  <X className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                </button>
              )}
            </form>
            <Dialog.Close className="shrink-0 rounded-md py-2 text-sm font-medium text-foreground transition-colors active:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Cancelar
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {!isSearching && (
              <div className="space-y-8 py-6 animate-in fade-in-0 duration-300">
                {recent.length > 0 && (
                  <section>
                    <div className="mb-1 flex items-center justify-between">
                      <SectionTitle>Búsquedas recientes</SectionTitle>
                      <button
                        type="button"
                        onClick={clearRecent}
                        className="text-xs text-muted-foreground underline-offset-4 active:underline"
                      >
                        Borrar
                      </button>
                    </div>
                    <ul>
                      {recent.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => search(term)}
                            className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors active:bg-muted"
                          >
                            <Clock
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <span className="flex-1 truncate">{term}</span>
                            <ChevronRight
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <SectionTitle>Explorá</SectionTitle>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => handleOpenChange(false)}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors active:bg-muted"
                      >
                        <Icon className="size-4 text-site-primary" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {isLoading && !visibleResults?.products.length && (
              <ul className="py-4" aria-label="Cargando resultados">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    <Skeleton className="size-16 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {visibleResults?.error && !isLoading && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No pudimos cargar sugerencias. Tocá buscar en el teclado para ver los resultados.
              </p>
            )}

            {visibleResults &&
              !visibleResults.error &&
              visibleResults.products.length === 0 &&
              !isLoading && (
                <div className="flex flex-col items-center px-6 py-14 text-center animate-in fade-in-0 duration-300">
                  <div className="mb-4 grid size-14 place-items-center rounded-full bg-muted">
                    <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-wrap-balance">
                    Sin resultados para “{visibleResults.query}”
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground text-wrap-balance">
                    Revisá la ortografía o probá con una palabra más general.
                  </p>
                  <Link
                    href="/tienda"
                    onClick={() => handleOpenChange(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors active:bg-muted"
                  >
                    <Store className="size-4 text-site-primary" aria-hidden="true" />
                    Ver toda la tienda
                  </Link>
                </div>
              )}

            {visibleResults && visibleResults.products.length > 0 && (
              <section
                className={`py-4 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                aria-busy={isLoading}
              >
                <SectionTitle>Productos</SectionTitle>
                <ul className="mt-1 divide-y divide-border/60">
                  {visibleResults.products.map((product) => {
                    const hasDiscount =
                      product.compareAtPrice != null && product.compareAtPrice > product.price
                    return (
                      <li key={product.id}>
                        <Link
                          href={`/tienda/${product.slug}`}
                          onClick={handleResultClick}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors active:bg-muted"
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.imageAlt}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <Search
                                className="absolute inset-0 m-auto size-5 text-muted-foreground/50"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {product.category?.[0] && (
                              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                {product.category[0].name}
                              </p>
                            )}
                            <p className="line-clamp-2 text-sm leading-snug text-foreground/80">
                              <Highlight text={product.name} query={visibleResults.query} />
                            </p>
                            <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                              <span className="text-sm font-bold">
                                {formatPrice(product.price, currencySymbol)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(product.compareAtPrice!, currencySymbol)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <button
                  type="button"
                  onClick={() => search(query)}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-site-primary px-6 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                >
                  {visibleResults.hasMore
                    ? 'Ver todos los resultados'
                    : 'Ver resultados en la tienda'}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </section>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
