'use client'

import React, { useState } from 'react'

const logoHeightMap: Record<string, string> = {
  '6': 'h-6',
  '7': 'h-7',
  '8': 'h-8',
  '9': 'h-9',
  '10': 'h-10',
  '11': 'h-11',
  '12': 'h-12',
  '14': 'h-14',
  '16': 'h-16',
  '20': 'h-20',
  '24': 'h-24',
  '28': 'h-28',
  '32': 'h-32',
}

const logoHeightXlMap: Record<string, string> = {
  '6': 'xl:h-6',
  '7': 'xl:h-7',
  '8': 'xl:h-8',
  '9': 'xl:h-9',
  '10': 'xl:h-10',
  '11': 'xl:h-11',
  '12': 'xl:h-12',
  '14': 'xl:h-14',
  '16': 'xl:h-16',
  '20': 'xl:h-20',
  '24': 'xl:h-24',
  '28': 'xl:h-28',
  '32': 'xl:h-32',
}
import Link from 'next/link'
import Image from 'next/image'
import { CustomLink } from '@/components/ui/link'
import { HeaderSheet } from './HeaderSheet'
import { CartSheet } from './CartSheet'
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
  isAdmin?: boolean
  showNosotros?: boolean
}

export function Header({
  siteName,
  logoUrl,
  hideName,
  headerLogoSide,
  logoSize,
  logoSizeMobile,
  alertText,
  primaryColor,
  isAdmin,
  showNosotros,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navLinks = showNosotros ? NAV_LINKS : NAV_LINKS.filter((l) => l.href !== '/nosotros')

  return (
    <header
      className={`sticky ${isAdmin ? 'top-9' : 'top-0'} z-50 bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/75`}
    >
      {alertText && <AlertMarquee text={alertText} primaryColor={primaryColor} />}
      <div className="mx-auto flex py-4 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {headerLogoSide === 'center' && (
          <HeaderSheet
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            side="left"
            NAV_LINKS={navLinks}
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
              className={`${logoHeightMap[logoSizeMobile] ?? 'h-10'} ${logoHeightXlMap[logoSize] ?? 'xl:h-14'} w-auto object-contain`}
              priority
            />
          ) : null}
          {!hideName && (
            <span className="xl:text-lg text-xl font-bold tracking-tight text-wrap-balance">
              {siteName}
            </span>
          )}
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex -mb-0.5"
          aria-label="Navegacion principal"
        >
          {navLinks.map((link) => (
            <CustomLink key={link.href} variant="nav" asChild>
              <Link href={link.href}>{link.label}</Link>
            </CustomLink>
          ))}
        </nav>
        
        <div className="flex items-center xl:gap-2 gap-4">
          <CartSheet />

          {headerLogoSide === 'left' && (
            <HeaderSheet
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              side="right"
              NAV_LINKS={navLinks}
            />
          )}
        </div>
      </div>

    </header>
  )
}
