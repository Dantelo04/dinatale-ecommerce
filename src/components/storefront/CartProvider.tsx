'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import type { SerializedProduct } from '@/lib/types'

export interface CartItem extends Omit<SerializedProduct, 'imageAlt' | 'compareAtPrice'> {
  quantity: number
}

interface CartState {
  items: CartItem[]
  currencySymbol: string
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] }

interface CartContextValue {
  items: CartItem[]
  currencySymbol: string
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i,
        ),
      }
    }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'HYDRATE':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

const STORAGE_KEY = 'anoto-cart'

function isValidCartItems(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'number' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      Number.isFinite(item.price) &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  )
}

export function CartProvider({
  children,
  currencySymbol,
}: {
  children: React.ReactNode
  currencySymbol: string
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    currencySymbol,
  })
  const isHydrated = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (isValidCartItems(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed })
        }
      }
    } catch {
      /* ignore */
    }
    isHydrated.current = true
  }, [])

  useEffect(() => {
    if (!isHydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      /* ignore */
    }
  }, [state.items])

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: item }),
    [],
  )
  const removeItem = useCallback(
    (id: number) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
    [],
  )
  const updateQuantity = useCallback(
    (id: number, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    [],
  )
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        currencySymbol,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
