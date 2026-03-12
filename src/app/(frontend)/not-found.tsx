import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-site-secondary">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
        Pagina no encontrada
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
        La URL que abriste no existe o fue movida. Revisa el enlace o vuelve al inicio para seguir
        navegando.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="bg-site-primary text-primary-foreground hover:opacity-90">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Ir al Inicio
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tienda">
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            Explorar Tienda
          </Link>
        </Button>
      </div>
    </section>
  )
}
