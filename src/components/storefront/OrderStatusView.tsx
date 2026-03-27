import React from 'react'
import { Package, Clock, Truck, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'

interface OrderStatusViewProps {
  order: {
    orderNumber: string
    status: OrderStatus
    customerName: string | null
    items: { productName: string; quantity: number; unitPrice: number }[]
    totalItems: number
    totalAmount: number
    customerComment: string | null
    createdAt: string
  }
  currencySymbol: string
}

const STEPPER_STEPS: { status: OrderStatus; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { status: 'received', label: 'Recibido', Icon: Package },
  { status: 'in_process', label: 'En Proceso', Icon: Clock },
  { status: 'shipped', label: 'Enviado', Icon: Truck },
  { status: 'delivered', label: 'Entregado', Icon: CheckCircle },
]

const STATUS_ORDER: Record<OrderStatus, number> = {
  received: 0,
  in_process: 1,
  shipped: 2,
  delivered: 3,
  finalized: 4,
}

export function OrderStatusView({ order, currencySymbol }: OrderStatusViewProps) {
  const currentIndex = STATUS_ORDER[order.status]
  const isFinalized = order.status === 'finalized'

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(order.createdAt))

  return (
    <div className="mx-auto max-w-8xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance">
            Estado del Pedido
          </h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Pedido <span className="font-medium text-foreground">{order.orderNumber}</span> &middot; {formattedDate}
          </p>
        </div>
        {isFinalized && (
          <Badge className="bg-site-primary text-primary-foreground shrink-0 mt-1">
            {ORDER_STATUS_LABELS.finalized}
          </Badge>
        )}
      </div>

      {/* Status Stepper */}
      <div className="mt-8">
        <div className="flex items-center">
          {STEPPER_STEPS.map((step, index) => {
            const stepIndex = STATUS_ORDER[step.status]
            const isCompleted = isFinalized || currentIndex > stepIndex
            const isCurrent = !isFinalized && currentIndex === stepIndex
            const Icon = step.Icon

            return (
              <React.Fragment key={step.status}>
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                      isCompleted
                        ? 'bg-site-primary text-primary-foreground'
                        : isCurrent
                          ? 'bg-site-primary text-primary-foreground ring-4 ring-site-primary/20'
                          : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                    aria-label={step.label}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span
                    className={[
                      'text-xs font-medium text-center hidden sm:block',
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPPER_STEPS.length - 1 && (
                  <div
                    className={[
                      'h-0.5 flex-1 mx-2 mb-5',
                      isFinalized || currentIndex > stepIndex ? 'bg-site-primary' : 'bg-muted',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
        {/* Mobile step labels */}
        <p className="mt-3 text-sm font-medium text-center sm:hidden">
          {ORDER_STATUS_LABELS[order.status]}
        </p>
      </div>

      {/* Order details */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="px-6">
              <h2 className="text-lg font-semibold">Detalle del Pedido</h2>
              <Separator className="my-4" />
              <div className="flex flex-col gap-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium line-clamp-1">{item.productName}</span>
                      <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                    </div>
                    <span className="shrink-0 tabular-nums">
                      {formatPrice(item.unitPrice * item.quantity, currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.totalAmount, currencySymbol)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div>
          <Card>
            <CardContent className="px-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Información del Pedido</h2>
              <Separator />
              {order.customerName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</p>
                  <p className="mt-0.5 text-sm">{order.customerName}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha</p>
                <p className="mt-0.5 text-sm">{formattedDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad de productos</p>
                <p className="mt-0.5 text-sm">{order.totalItems} {order.totalItems === 1 ? 'producto' : 'productos'}</p>
              </div>
              {order.customerComment && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Comentario</p>
                  <p className="mt-0.5 text-sm text-muted-foreground whitespace-pre-line">{order.customerComment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
