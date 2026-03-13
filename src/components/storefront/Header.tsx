'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomLink } from '@/components/ui/link'
import { useCart } from './CartProvider'
import { HeaderSheet } from './HeaderSheet'
import { AlertMarquee } from './AlertMarquee'
import { NAV_LINKS } from '@/lib/constants'

interface HeaderProps {
  siteName: string
  logoUrl: string | null
  currencySymbol: string
  hideName: boolean
  logoSize: string
  logoSizeMobile: string
  headerLogoSide: 'left' | 'center' | 'right'
  alertText: string
  primaryColor: string
}

export function Header({ siteName, logoUrl, hideName, headerLogoSide, logoSize, logoSizeMobile, alertText, primaryColor }: HeaderProps) {
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/75">
      {alertText && <AlertMarquee text={alertText} primaryColor={primaryColor} />}
      <div className="mx-auto flex py-4 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {headerLogoSide === 'center' && (
          <HeaderSheet
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            side="left"
            NAV_LINKS={NAV_LINKS}
          />
        )}

        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              width={1920}
              height={1080}
              className={`xl:h-${logoSize} h-${logoSizeMobile} w-auto object-contain`}
              priority
            />
          ) : null}
          {!hideName && (
            <span className="xl:text-lg text-xl font-bold tracking-tight text-wrap-balance">
              {siteName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex -mb-0.5" aria-label="Navegacion principal">
          {NAV_LINKS.map((link) => (
            <CustomLink key={link.href} variant="nav" asChild>
              <Link href={link.href}>{link.label}</Link>
            </CustomLink>
          ))}
        </nav>

        <div className="flex items-center xl:gap-2 gap-4">
          <Link href="/carrito" aria-label={`Carrito de compras, ${totalItems} productos`}>
            <Button variant="ghost" size="icon" className="relative -bottom-0.5 hover:bg-transparent hover:scale-105 transition-all active:scale-90" asChild>
              <span>
                <ShoppingCart
                  className="xl:size-8.5 size-7"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs tabular-nums bg-site-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              </span>
            </Button>
          </Link>

          {headerLogoSide === 'left' && (
            <HeaderSheet
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              side="right"
              NAV_LINKS={NAV_LINKS}
            />
          )}
        </div>
      </div>
    </header>
  )
}
