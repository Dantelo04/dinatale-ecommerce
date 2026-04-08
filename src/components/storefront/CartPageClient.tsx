'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from './CartProvider'
import { processCheckout } from '@/lib/product-actions'
import { processPagoparCheckout } from '@/lib/pagopar-actions'
import { formatPrice } from '@/lib/utils'
import { FaWhatsapp } from 'react-icons/fa'

interface CartPageClientProps {
  whatsappNumber: string
  currencySymbol: string
  siteName: string
  redirectToOrder?: boolean
  pagoparEnabled?: boolean
  pagoparCiudadId?: number
}

export function CartPageClient({
  whatsappNumber,
  currencySymbol,
  siteName,
  redirectToOrder,
  pagoparEnabled = false,
  pagoparCiudadId = 1,
}: CartPageClientProps) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCI, setCustomerCI] = useState('')
  const [comment, setComment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pagopar'>('whatsapp')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const buildWhatsAppMessage = () => {
    const nameLine = customerName.trim() ? `Nombre: ${customerName.trim()}\n` : ''
    const phoneLine = customerPhone.trim() ? `Teléfono: ${customerPhone.trim()}\n` : ''
    const contactBlock = nameLine || phoneLine ? `${nameLine}${phoneLine}\n` : ''
    const header = `Hola! Quiero hacer un pedido en ${siteName}:\n\n${contactBlock}`
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
    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Por favor completá tu nombre y teléfono.')
      return
    }
    if (paymentMethod === 'pagopar' && !customerEmail.trim()) {
      setCheckoutError('Por favor ingresá tu email para pagar con Pagopar.')
      return
    }
    if (paymentMethod === 'pagopar' && !customerCI.trim()) {
      setCheckoutError('Por favor ingresá tu cédula de identidad para pagar con Pagopar.')
      return
    }

    setCheckoutError(null)
    setCheckoutLoading(true)

    try {
      if (paymentMethod === 'pagopar') {
        const result = await processPagoparCheckout(
          items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
          customerName.trim(),
          customerPhone.trim(),
          customerEmail.trim(),
          customerCI.trim(),
          pagoparCiudadId,
          siteName,
          comment.trim() || undefined,
        )
        if (!result.success) {
          setCheckoutError(result.error)
          return
        }
        clearCart()
        window.location.href = result.redirectUrl
      } else {
        const result = await processCheckout(
          items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          comment.trim() || undefined,
          customerName.trim(),
          customerPhone.trim(),
        )
        if (!result.success) {
          setCheckoutError(result.error)
          return
        }
        const message = buildWhatsAppMessage()
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank', 'noopener,noreferrer')
        clearCart()
        if (redirectToOrder) {
          window.location.href = `/ordenes/${result.orderNumber}`
        }
      }
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShoppingCart
          className="mx-auto h-16 w-16 text-muted-foreground"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <h1 className="mt-6 text-2xl font-bold text-wrap-balance">Tu carrito esta vacio</h1>
        <p className="mt-2 text-muted-foreground">Agrega productos para comenzar tu pedido.</p>
        <Button
          asChild
          className="mt-8 bg-site-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Link href="/tienda">Ver Productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-8xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance">
        Carrito de Compras
      </h1>
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
                      <span
                        className="w-8 text-center text-sm tabular-nums"
                        aria-label={`Cantidad: ${item.quantity}`}
                      >
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
            <Button
              variant="outline"
              size="sm"
              className="mt-4 sm:hidden"
              onClick={clearCart}
            >
              Vaciar carrito
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pagoparEnabled && (
              <div className="flex flex-col gap-2 sm:hidden">
                <p className="text-sm font-medium">Método de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${
                      paymentMethod === 'whatsapp'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                    aria-pressed={paymentMethod === 'whatsapp'}
                  >
                    <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pagopar')}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${
                      paymentMethod === 'pagopar'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                    aria-pressed={paymentMethod === 'pagopar'}
                  >
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                    Pagopar
                  </button>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="customer-name" className="mb-2 block text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="mb-2 block text-sm font-medium">
                Teléfono <span className="text-destructive">*</span>
              </label>
              <Input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: 0981123456"
                required
              />
            </div>
          </div>

          {pagoparEnabled && paymentMethod === 'pagopar' && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customer-email" className="mb-2 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="customer-ci" className="mb-2 block text-sm font-medium">
                  Cédula de Identidad <span className="text-destructive">*</span>
                </label>
                <Input
                  id="customer-ci"
                  value={customerCI}
                  onChange={(e) => setCustomerCI(e.target.value)}
                  placeholder="Ej: 1234567"
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-4">
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
          <Button variant="outline" size="sm" className="mt-4 hidden sm:block" onClick={clearCart}>
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

              {pagoparEnabled && (
                <div className="flex-col gap-2 hidden sm:flex">
                  <p className="text-sm font-medium">Método de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${
                        paymentMethod === 'whatsapp'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                      aria-pressed={paymentMethod === 'whatsapp'}
                    >
                      <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pagopar')}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${
                        paymentMethod === 'pagopar'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                      aria-pressed={paymentMethod === 'pagopar'}
                    >
                      <CreditCard className="h-5 w-5" aria-hidden="true" />
                      Pagopar
                    </button>
                  </div>
                </div>
              )}

              {checkoutError && (
                <p className="text-sm text-destructive" role="alert">
                  {checkoutError}
                </p>
              )}

              {paymentMethod === 'pagopar' ? (
                <Button
                  size="lg"
                  className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  <CreditCard className="mr-2 h-5 w-5" aria-hidden="true" />
                  {checkoutLoading ? 'Procesando...' : 'Pagar con Pagopar'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="mt-2 w-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  <FaWhatsapp className="mr-2 h-5 w-5" aria-hidden="true" />
                  {checkoutLoading ? 'Procesando...' : 'Pedir por WhatsApp'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
