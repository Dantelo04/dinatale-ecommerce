import React, { Suspense } from 'react'
import { ProcessingView } from './ProcessingView'

export const metadata = {
  title: 'Procesando pago',
  robots: { index: false, follow: false },
}

export default function ProcessandoPage() {
  return (
    <Suspense>
      <ProcessingView />
    </Suspense>
  )
}
