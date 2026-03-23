'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from './CartProvider'
import { processCheckout } from '@/lib/product-actions'
import { formatPrice } from '@/lib/utils'

interface CartPageClientProps {
  whatsappNumber: string
  currencySymbol: string
  siteName: string
}

export function CartPageClient({ whatsappNumber, currencySymbol, siteName }: CartPageClientProps) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
  const [comment, setComment] = useState('')

  const buildWhatsAppMessage = () => {
    const header = `Hola! Quiero hacer un pedido en ${siteName}:\n\n`
    const itemLines = items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, currencySymbol)}`,
      )
      .join('\n')
    const footer = `\n\nTotal: ${formatPrice(totalPrice, currencySymbol)}`
    const trimmedComment = comment.trim()
    const commentBlock = trimmedComment ? `\n\nComentario:\n${trimmedComment}` : ''
    return header + itemLines + footer + commentBlock
  }

  const handleCheckout = async () => {
    const message = buildWhatsAppMessage()
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    processCheckout(
      items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      comment.trim() || undefined,
    )
    window.open(url, '_blank', 'noopener,noreferrer')
    clearCart()
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" aria-hidden="true" strokeWidth={1.5}/>
        <h1 className="mt-6 text-2xl font-bold text-wrap-balance">Tu carrito esta vacio</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega productos para comenzar tu pedido.
        </p>
        <Button asChild className="mt-8 bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Link href="/tienda">Ver Productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance">Carrito de Compras</h1>
      <p className="mt-1 text-muted-foreground">
        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card key={item.id} className="flex-row items-center gap-0 py-0">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-l-lg bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Sin img
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-1 items-center justify-between p-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tienda/${item.slug}`}
                      className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold tabular-nums mt-1">
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center rounded-md border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        <Minus className="h-3 w-3" aria-hidden="true" />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums" aria-label={`Cantidad: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <label htmlFor="cart-comment" className="mb-2 block text-sm font-medium">
              Comentarios del pedido
            </label>
            <Textarea
              id="cart-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Ej: Quiero un grabado con el nombre..."
              rows={4}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={clearCart}
          >
            Vaciar carrito
          </Button>
        </div>

        <div>
          <Card>
            <CardContent className="flex flex-col gap-4 px-6">
              <h2 className="text-lg font-semibold">Resumen del Pedido</h2>
              <Separator />
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 min-w-0 flex-1">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="ml-2 shrink-0 tabular-nums">
                    {formatPrice(item.price * item.quantity, currencySymbol)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(totalPrice, currencySymbol)}</span>
              </div>
              <Button
                size="lg"
                className="mt-2 w-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                onClick={handleCheckout}
              >
                <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                Pedir por WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
