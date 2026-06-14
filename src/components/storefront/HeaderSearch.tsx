'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Focus the input when it expands
  useEffect(() => {
    if (open) inputRef.current?.focus()
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
    if (q) {
      router.push(`/tienda?buscar=${encodeURIComponent(q)}`)
    } else {
      router.push('/tienda')
    }
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setQuery('')
      setOpen(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex items-center">
      <button
        type={open ? 'submit' : 'button'}
        onClick={() => !open && setOpen(true)}
        aria-label="Buscar"
        aria-expanded={open}
        className="grid place-items-center rounded-md p-1 text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="size-7" />
      </button>
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
          open ? 'w-36 md:w-56 ml-1 px-3' : 'w-0 px-0'
        } overflow-hidden rounded-md border-0 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border focus:border-border focus:bg-background focus:ring-1 focus:ring-ring`}
      />
    </form>
  )
}
