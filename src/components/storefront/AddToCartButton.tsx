'use client'

import React, { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, type CartItem } from './CartProvider'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
  size?: 'sm' | 'lg'
  className?: string
  outOfStock?: boolean
}

export function AddToCartButton({
  product,
  size = 'sm',
  className,
  outOfStock = false,
}: AddToCartButtonProps) {
  const { items, addItem, updateQuantity } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const cartItem = items.find((i) => i.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  if (outOfStock) {
    return (
      <Button
        size={size}
        className={`bg-site-primary text-primary-foreground hover:opacity-90 max-w-sm transition-opacity h-8 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
        disabled
        aria-label={`${product.name} sin stock`}
      >
        <ShoppingCart className={`mr-2 ${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} aria-hidden="true" />
        Sin stock
      </Button>
    )
  }

  if (quantity > 0 && !justAdded) {
    return (
      <div
        className={`flex items-center justify-between rounded-md max-w-sm bg-site-primary text-primary-foreground ${size === 'lg' ? 'h-11' : 'h-8'} ${className ?? ''}`}
        role="group"
        aria-label={`Cantidad de ${product.name} en el carrito`}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`text-primary-foreground hover:bg-white/20 hover:text-primary-foreground ${size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'}`}
          onClick={() => updateQuantity(product.id, quantity - 1)}
          aria-label={`Quitar una unidad de ${product.name}`}
        >
          <Minus className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true" />
        </Button>
        <span className={`tabular-nums font-semibold select-none ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={`text-primary-foreground hover:bg-white/20 hover:text-primary-foreground ${size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'}`}
          onClick={() => updateQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock}
          aria-label={`Agregar una unidad más de ${product.name}`}
        >
          <Plus className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      size={size}
      className={`bg-site-primary text-primary-foreground hover:opacity-90 max-w-sm h-8 active:scale-90 transition-all ${className ?? ''} ${size === 'lg' ? 'h-11' : 'h-8'}`}
      onClick={() => {
        addItem(product)
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 1500)
      }}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <ShoppingCart className={`mr-2 ${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} aria-hidden="true" />
      {justAdded ? 'Agregado!' : size === 'lg' ? 'Agregar al Carrito' : 'Agregar'}
    </Button>
  )
}
