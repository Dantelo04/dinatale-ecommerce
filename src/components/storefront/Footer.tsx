import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { CustomLink } from '@/components/ui/link'
import { MapPin } from 'lucide-react'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import { NAV_LINKS, LEGAL_LINKS } from '@/lib/constants'
import { FooterSearch } from './FooterSearch'

interface FooterProps {
  siteName: string
  logoUrl?: string | null
  hideName: boolean
  siteDescription?: string | null
  socialLinks?: {
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
    googleMaps?: string | null
  } | null
  showNosotros?: boolean
}

export function Footer({ siteName, logoUrl, hideName, siteDescription, socialLinks, showNosotros }: FooterProps) {
  const navLinks = showNosotros ? NAV_LINKS : NAV_LINKS.filter((l) => l.href !== '/nosotros')
  const hasSocial =
    socialLinks?.instagram ||
    socialLinks?.facebook ||
    socialLinks?.tiktok ||
    socialLinks?.googleMaps

  return (
    <footer>
      {/* Main footer */}
      <div className="bg-muted/60">
        <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 items-start">
            {/* Col 1: Brand + search */}
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={siteName}
                    width={1920}
                    height={1080}
                    className="h-9 w-auto object-contain"
                    priority
                  />
                ) : null}
                {!hideName && (
                  <span className="xl:text-lg text-xl font-bold tracking-tight text-wrap-balance">
                    {siteName}
                  </span>
                )}
              </Link>
              {/* <FooterSearch /> */}
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Navegación
              </h3>
              <nav className="flex flex-col gap-2" aria-label="Navegacion del footer">
                {navLinks.map((link) => (
                  <CustomLink key={link.href} href={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </CustomLink>
                ))}
              </nav>
            </div>

            {/* Col 3: Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Legal
              </h3>
              <nav className="flex flex-col gap-2" aria-label="Paginas legales">
                {LEGAL_LINKS.map((link) => (
                  <CustomLink key={link.href} href={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </CustomLink>
                ))}
              </nav>
            </div>

            {/* Col 4: Social */}
            {hasSocial && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Redes Sociales
                </h3>
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
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados. Desarrollado por{' '}
            <CustomLink href="https://www.anoto.com.py/" variant="primary" external>
              Anoto
            </CustomLink>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
