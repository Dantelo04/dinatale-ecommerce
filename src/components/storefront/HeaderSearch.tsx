'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Focus the input after it expands. rAF waits for the element to become
  // visible/focusable before calling focus().
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  // Collapse on click-outside when empty
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node) && !query.trim()) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/tienda?buscar=${encodeURIComponent(q)}` : '/tienda')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setQuery('')
      setOpen(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      role="search"
      className={`flex items-center transition-all duration-200 ${
        open
          ? 'rounded-md border border-border bg-background pl-3 pr-1 focus-within:ring-1 focus-within:ring-ring'
          : ''
      }`}
    >
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buscar"
          aria-expanded={false}
          className="grid place-items-center rounded-md p-1 text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="size-7" />
        </button>
      )}

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={`${
          open ? 'w-40 md:w-56 py-1.5' : 'w-0 p-0'
        } overflow-hidden border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none`}
      />

      {open && (
        <>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Limpiar busqueda"
              className="grid place-items-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Buscar"
            className="grid place-items-center rounded-md p-1 text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-6" />
          </button>
        </>
      )}
    </form>
  )
}
