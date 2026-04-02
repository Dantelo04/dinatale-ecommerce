'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'

type ProductResult = {
  id: number
  name: string
  price: number
  images?: { image?: { url?: string } | null }[] | null
}

export const VariantsField: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<number[]>({ path })
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProductResult[]>([])
  const [selectedProducts, setSelectedProducts] = useState<ProductResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const ids = value ?? []

  // Fetch full product data for currently selected IDs
  useEffect(() => {
    if (ids.length === 0) {
      setSelectedProducts([])
      return
    }
    fetch(`/api/products?where[id][in]=${ids.join(',')}&depth=1&limit=50`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        const docs: ProductResult[] = data.docs ?? []
        const sorted = ids
          .map((id) => docs.find((d) => d.id === id))
          .filter(Boolean) as ProductResult[]
        setSelectedProducts(sorted)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  // Search with debounce
  useEffect(() => {
    const q = search.trim()
    if (!q) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(
        `/api/products?where[name][like]=${encodeURIComponent(q)}&where[active][equals]=true&depth=1&limit=8`,
        { credentials: 'include' },
      )
        .then((r) => r.json())
        .then((data) => {
          setResults(data.docs ?? [])
          setOpen(true)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const add = (product: ProductResult) => {
    if (!ids.includes(product.id)) {
      setValue([...ids, product.id])
    }
    setSearch('')
    setResults([])
    setOpen(false)
  }

  const remove = (id: number) => {
    setValue(ids.filter((v) => v !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', marginBottom: '18px' }}>
      <label
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.075rem',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-600)',
          display: 'block',
        }}
      >
        Variantes
      </label>

      {/* Selected variants */}
      {selectedProducts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedProducts.map((p) => {
            const imageUrl = (p.images?.[0]?.image as { url?: string } | null)?.url
            return (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  padding: '8px 8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  width: '90px',
                  position: 'relative',
                  background: 'var(--theme-elevation-50)',
                }}
              >
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Quitar ${p.name}`}
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    background: 'var(--theme-error-400, #e53e3e)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    padding: 0,
                  }}
                >
                  ×
                </button>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={p.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '3px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: 'var(--theme-elevation-400)',
                    }}
                  >
                    Sin img
                  </div>
                )}
                <span
                  style={{
                    fontSize: '11px',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    lineHeight: '1.3',
                    color: 'var(--theme-elevation-800)',
                  }}
                >
                  {p.name}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Search input + dropdown */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar y agregar variante..."
          style={{
            width: '100%',
            padding: '8px 36px 8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-1000)',
            fontSize: '14px',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        {loading && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '13px',
              color: 'var(--theme-elevation-400)',
            }}
          >
            ···
          </span>
        )}

        {open && results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--theme-bg)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              zIndex: 100,
              maxHeight: '280px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {results.map((p) => {
              const imageUrl = (p.images?.[0]?.image as { url?: string } | null)?.url
              const alreadyAdded = ids.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (!alreadyAdded) add(p)
                  }}
                  disabled={alreadyAdded}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    width: '100%',
                    background: alreadyAdded ? 'var(--theme-elevation-50)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    cursor: alreadyAdded ? 'default' : 'pointer',
                    textAlign: 'left',
                    opacity: alreadyAdded ? 0.5 : 1,
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '3px',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--theme-elevation-100)',
                        borderRadius: '3px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--theme-elevation-900)',
                      }}
                    >
                      {p.name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
                      ${p.price?.toLocaleString()}
                      {alreadyAdded ? ' · Ya agregado' : ''}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default VariantsField
