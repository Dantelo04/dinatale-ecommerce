import React from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

interface FooterProps {
  siteName: string
  socialLinks?: {
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
  } | null
}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Footer({ siteName, socialLinks }: FooterProps) {
  const hasSocial = socialLinks?.instagram || socialLinks?.facebook || socialLinks?.tiktok

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-wrap-balance">{siteName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu tienda de confianza.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Navegacion
            </h3>
            <nav className="mt-4 flex flex-col gap-2" aria-label="Navegacion del footer">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {hasSocial && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Redes Sociales
              </h3>
              <div className="mt-4 flex flex-col gap-2">
                {socialLinks?.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm w-fit"
                  >
                    Instagram
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm w-fit"
                  >
                    Facebook
                  </a>
                )}
                {socialLinks?.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm w-fit"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
