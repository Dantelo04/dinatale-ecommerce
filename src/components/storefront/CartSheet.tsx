'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, X } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from './CartProvider'

export function CartSheet() {
  const { items, currencySymbol, totalItems, totalPrice, updateQuantity, removeItem } = useCart()

  const formatPrice = (amount: number) =>
    `${currencySymbol} ${amount.toLocaleString('es-PY')}`

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative -bottom-0.5 hover:bg-transparent hover:scale-105 transition-all active:scale-90"
          aria-label={`Carrito de compras, ${totalItems} productos`}
        >
          <ShoppingCart className="xl:size-8.5 size-7" aria-hidden="true" strokeWidth={1.5} />
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs tabular-nums bg-site-primary text-primary-foreground">
            {totalItems}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-sm w-[90vw]" showCloseButton={false}>
        <SheetHeader className="px-5 pt-5 pb-4 border-b flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold">
            Tu carrito ({totalItems})
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full border border-border h-8 w-8">
              <X className="size-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <ShoppingCart className="size-12" strokeWidth={1} />
              <p className="text-sm">Tu carrito está vacío</p>
              <SheetClose asChild>
                <Link href="/tienda" className="text-sm font-medium text-site-primary underline-offset-4 hover:underline">
                  Ver productos
                </Link>
              </SheetClose>
            </div>
          ) : (
            <ul className="flex flex-col divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCart className="size-6 text-muted-foreground" strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <SheetClose asChild>
                        <Link
                          href={`/tienda/${item.slug}`}
                          className="text-sm font-medium leading-tight line-clamp-2 hover:underline underline-offset-2"
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t px-5 py-4 gap-3">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-sm text-muted-foreground">Total estimado</span>
              <span className="text-base font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            {/* <SheetClose asChild>
              <Link href="/carrito" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver carrito
                </Button>
              </Link>
            </SheetClose> */}
            <SheetClose asChild>
              <Link href="/carrito" className="w-full">
                <Button className="w-full bg-site-primary text-primary-foreground hover:bg-site-primary/90">
                  Finalizar compra
                </Button>
              </Link>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
