import React from 'react'
import Link from 'next/link'

interface LegalPageHeaderProps {
  title: string
  siteName: string
  updatedAt?: string
}

export function LegalPageHeader({ title, siteName, updatedAt }: LegalPageHeaderProps) {
  return (
    <div
      className="w-full px-4 py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--site-primary)' }}
    >
      <div className="mx-auto max-w-3xl">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-3"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <Link
            href="/"
            className="hover:underline"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {siteName}
          </Link>
          {' / '}Legal
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {updatedAt && (
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {updatedAt}
          </p>
        )}
      </div>
    </div>
  )
}
