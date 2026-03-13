import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { CustomLink } from '@/components/ui/link'
import { MapPin } from 'lucide-react'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'

interface FooterProps {
  siteName: string
  logoUrl?: string | null
  hideName: boolean
  socialLinks?: {
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
    googleMaps?: string | null
  } | null
}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/tienda?ofertas=true', label: 'Promo' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Footer({ siteName, logoUrl, hideName, socialLinks }: FooterProps) {
  const hasSocial = socialLinks?.instagram || socialLinks?.facebook || socialLinks?.tiktok

  return (
    <footer className="bg-muted/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 items-start">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            {logoUrl ? (
              <Image src={logoUrl} alt={siteName} width={1920} height={1080} className="h-9 w-auto object-contain" priority />
            ) : null}
            {!hideName && <span className="xl:text-lg text-xl font-bold tracking-tight text-wrap-balance">{siteName}</span>}
          </Link>

          <div>
            <nav className="flex flex-col gap-2" aria-label="Navegacion del footer">
              {NAV_LINKS.map((link) => (
                <CustomLink key={link.href} href={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </CustomLink>
              ))}
            </nav>
          </div>

          {hasSocial && (
            <div className="flex flex-col gap-2">
              {socialLinks?.instagram && (
                <CustomLink href={socialLinks.instagram} external>
                  <FaInstagram className="size-4" aria-hidden="true" /> Instagram
                </CustomLink>
              )}
              {socialLinks?.facebook && (
                <CustomLink href={socialLinks.facebook} external>
                  <FaFacebook className="size-4" aria-hidden="true" /> Facebook
                </CustomLink>
              )}
              {socialLinks?.tiktok && (
                <CustomLink href={socialLinks.tiktok} external>
                  <FaTiktok className="size-4" aria-hidden="true" /> TikTok
                </CustomLink>
              )}
              {socialLinks?.googleMaps && (
                <CustomLink href={socialLinks.googleMaps} external>
                  <MapPin className="size-4" aria-hidden="true" /> Google Maps
                </CustomLink>
              )}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados. Desarrollado por{' '}
          <CustomLink href="https://www.instagram.com/anoto" variant="primary" external>
            Anoto
          </CustomLink>
          .
        </p>
      </div>
    </footer>
  )
}
