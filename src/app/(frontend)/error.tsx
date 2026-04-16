'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-8xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl font-bold tracking-tight">Algo salió mal</h2>
      <p className="mt-3 text-muted-foreground">
        Ocurrió un error inesperado. Por favor intentá de nuevo.
      </p>
      {process.env.NODE_ENV === 'development' && error.message && (
        <p className="mt-2 text-sm text-destructive font-mono">{error.message}</p>
      )}
      <Button className="mt-8" onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  )
}
