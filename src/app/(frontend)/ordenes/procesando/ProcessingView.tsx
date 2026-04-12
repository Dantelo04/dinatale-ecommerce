'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PollStatus = 'polling' | 'confirmed' | 'not_found'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20 // ~60 seconds

export function ProcessingView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hash = searchParams.get('hash')
  const [pollStatus, setPollStatus] = useState<PollStatus>('polling')
  const pollCount = useRef(0)

  useEffect(() => {
    if (!hash) {
      setPollStatus('not_found')
      return
    }

    const interval = setInterval(async () => {
      pollCount.current++

      try {
        const res = await fetch(`/api/pagopar/status?hash=${encodeURIComponent(hash)}`)
        const data = await res.json()

        if (data.status === 'confirmed') {
          clearInterval(interval)
          setPollStatus('confirmed')
          router.replace(`/ordenes/${encodeURIComponent(data.orderNumber)}`)
          return
        }

        if (data.status === 'not_found' || pollCount.current >= MAX_POLLS) {
          clearInterval(interval)
          setPollStatus('not_found')
        }
      } catch {
        // network error — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [hash, router])

  if (pollStatus === 'confirmed') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" strokeWidth={1.5} />
        <h1 className="mt-6 text-2xl font-bold">¡Pago confirmado!</h1>
        <p className="mt-2 text-muted-foreground">Redirigiendo a tu pedido...</p>
      </div>
    )
  }

  if (pollStatus === 'not_found') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="mt-6 text-2xl font-bold">No pudimos confirmar tu pago</h1>
        <p className="mt-2 text-muted-foreground">
          Si realizaste el pago, puede demorar unos minutos. Revisá tu email o contactanos.
        </p>
        <Button asChild className="mt-8 bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Link href="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Loader2 className="mx-auto h-16 w-16 animate-spin text-muted-foreground" strokeWidth={1.5} />
      <h1 className="mt-6 text-2xl font-bold">Procesando tu pago</h1>
      <p className="mt-2 text-muted-foreground">
        Esperando confirmación de Pagopar. Esto puede tomar unos segundos...
      </p>
    </div>
  )
}
