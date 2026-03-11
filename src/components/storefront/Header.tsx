'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomLink } from '@/components/ui/link'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useCart } from './CartProvider'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

interface HeaderProps {
  siteName: string
  logoUrl: string | null
  currencySymbol: string
  hideName: boolean
}

export function Header({ siteName, logoUrl, hideName }: HeaderProps) {
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex py-4 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          {logoUrl ? (
            <Image src={logoUrl} alt={siteName} width={1920} height={1080} className="h-9 w-auto object-contain" priority />
          ) : null}
          {!hideName && <span className="xl:text-lg text-xl font-bold tracking-tight text-wrap-balance">{siteName}</span>}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegacion principal">
          {NAV_LINKS.map((link) => (
            <CustomLink key={link.href} variant="nav" asChild>
              <Link href={link.href}>{link.label}</Link>
            </CustomLink>
          ))}
        </nav>

        <div className="flex items-center xl:gap-2 gap-4">
          <Link href="/carrito" aria-label={`Carrito de compras, ${totalItems} productos`}>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <span>
                <ShoppingCart className="xl:size-6 xl:-mt-0.5 size-7" aria-hidden="true" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs tabular-nums bg-site-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </span>
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu de navegacion" onClick={() => setMobileOpen(true)}>
                <Menu className="size-8" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-3 border-none" showCloseButton={false}>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" aria-label="Cerrar menu de navegacion" onClick={() => setMobileOpen(false)}>
                <XIcon className="size-8 text-foreground active:text-primary" aria-hidden="true" />
              </Button>
              <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
              <nav className="flex flex-col gap-1" aria-label="Navegacion movil">
                {NAV_LINKS.map((link) => (
                  <CustomLink key={link.href} variant="navMobile" size="lg" asChild>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  </CustomLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
