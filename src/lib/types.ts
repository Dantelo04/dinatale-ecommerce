export interface SerializedProduct {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl: string | null
  imageAlt: string
  sales: number
  views: number
  stock: number
}

export interface SerializedCategory {
  id: number
  name: string
  slug: string
}

export interface NavLink {
  href: string
  label: string
}

export interface ProductFilters {
  categoria?: string
  buscar?: string
  precioMin?: string
  precioMax?: string
  categoryId?: number | null
}

export const ORDER_STATUSES = ['received', 'in_process', 'shipped', 'delivered', 'finalized'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const KANBAN_STATUSES = ORDER_STATUSES.filter((s) => s !== 'finalized') as readonly Exclude<
  OrderStatus,
  'finalized'
>[]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recibido',
  in_process: 'En Proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  finalized: 'Finalizado',
}

export interface SerializedOrder {
  id: number
  orderNumber: string
  status: OrderStatus
  customerName?: string | null
  customerPhone?: string | null
  items: { productName: string; quantity: number; unitPrice: number }[]
  totalItems: number
  totalAmount: number
  customerComment?: string | null
  createdAt: string
}
