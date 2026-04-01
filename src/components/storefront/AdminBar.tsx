'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, ShieldCheck } from 'lucide-react'
import { getReceivedOrderCount } from '@/lib/order-actions'

interface AdminBarProps {
  userEmail: string
}

export function AdminBar({ userEmail }: AdminBarProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    getReceivedOrderCount()
      .then(setCount)
      .catch(() => {})
    const interval = setInterval(() => {
      getReceivedOrderCount()
        .then(setCount)
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sticky top-0 z-60 h-9 bg-zinc-900 text-zinc-100 text-xs flex items-center justify-between px-4 pb-1">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2} />
        <span className="truncate max-w-[180px]">{userEmail}</span>
        <Link
          href="/admin"
          className="hidden sm:inline text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Panel
        </Link>
      </div>
      <Link
        href="/ordenes"
        aria-label={`Pedidos nuevos: ${count}`}
        className="relative flex items-center gap-1.5 hover:text-zinc-100 text-zinc-400 transition-colors"
      >
        <span className="hidden sm:inline">Pedidos</span>
        <Bell className="size-4" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white px-0.5">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </div>
  )
}
