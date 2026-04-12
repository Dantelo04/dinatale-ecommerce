'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { RefreshCw, Phone, Package, Hash, User, MessageSquare, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchAllOrders, updateOrderStatus, finalizeDeliveredOrders } from '@/lib/order-actions'
import { KANBAN_STATUSES, ORDER_STATUS_LABELS, type SerializedOrder, type OrderStatus } from '@/lib/types'

type KanbanStatus = Exclude<OrderStatus, 'finalized'>

const COLUMN_STYLES: Record<KanbanStatus, { header: string; badge: string; dot: string; drop: string }> = {
  received: {
    header: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    drop: 'bg-blue-50/50',
  },
  in_process: {
    header: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    drop: 'bg-amber-50/50',
  },
  shipped: {
    header: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    drop: 'bg-purple-50/50',
  },
  delivered: {
    header: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
    drop: 'bg-green-50/50',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(amount: number, symbol: string) {
  return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, currencySymbol }: { order: SerializedOrder; currencySymbol: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none transition-shadow ${isDragging ? 'opacity-50 shadow-xl z-50' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-3 space-y-2">
          {/* Order number */}
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-sm text-gray-800 truncate">{order.orderNumber}</span>
          </div>

          {/* Customer info */}
          {(order.customerName || order.customerPhone) && (
            <div className="space-y-1">
              {order.customerName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <User className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Delivery */}
          {order.deliveryMethod && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">
                {order.deliveryMethod === 'delivery'
                  ? order.deliveryAddress || 'Envío'
                  : 'Retiro en local'}
              </span>
            </div>
          )}

          {/* Items + amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3 shrink-0" />
              <span>{order.totalItems} {order.totalItems === 1 ? 'producto' : 'productos'}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatCurrency(order.totalAmount, currencySymbol)}
            </span>
          </div>

          {/* Comment */}
          {order.customerComment && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-2">
              <MessageSquare className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{order.customerComment}</span>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-400 text-right">{formatDate(order.createdAt)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  orders,
  currencySymbol,
}: {
  status: KanbanStatus
  orders: SerializedOrder[]
  currencySymbol: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const styles = COLUMN_STYLES[status]
  const columnOrders = orders.filter((o) => o.status === status)

  return (
    <div className="flex flex-col min-h-[300px]">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border ${styles.header}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
          <span className="font-semibold text-sm text-gray-700">{ORDER_STATUS_LABELS[status]}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}>
          {columnOrders.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-b-lg border border-t-0 min-h-[200px] space-y-2 transition-colors ${
          isOver ? styles.drop : 'bg-gray-50 border-gray-200'
        }`}
      >
        {columnOrders.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400">
            Sin pedidos
          </div>
        ) : (
          columnOrders.map((order) => (
            <OrderCard key={order.id} order={order} currencySymbol={currencySymbol} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main Kanban Board ────────────────────────────────────────────────────────

interface OrdersKanbanProps {
  initialOrders: SerializedOrder[]
  currencySymbol: string
}

export function OrdersKanban({ initialOrders, currencySymbol }: OrdersKanbanProps) {
  const [orders, setOrders] = useState<SerializedOrder[]>(
    initialOrders.filter((o) => o.status !== 'finalized'),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const visibleOrders = orders.filter((o) => o.status !== 'finalized')

  const filteredOrders = searchQuery.trim()
    ? visibleOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
      )
    : visibleOrders

  const deliveredCount = visibleOrders.filter((o) => o.status === 'delivered').length

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const orderId = active.id as number
      const newStatus = over.id as OrderStatus

      if (newStatus === 'finalized') return

      const order = orders.find((o) => o.id === orderId)
      if (!order || order.status === newStatus) return

      const prevOrders = orders
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      )

      try {
        await updateOrderStatus(orderId, newStatus)
      } catch {
        setOrders(prevOrders)
      }
    },
    [orders],
  )

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const fresh = await fetchAllOrders()
      setOrders(fresh.filter((o) => o.status !== 'finalized'))
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleFinalizeAll = useCallback(async () => {
    setIsFinalizing(true)
    try {
      await finalizeDeliveredOrders()
      setOrders((prev) => prev.filter((o) => o.status !== 'delivered'))
    } finally {
      setIsFinalizing(false)
    }
  }, [])

  const totalOrders = visibleOrders.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalOrders} {totalOrders === 1 ? 'pedido activo' : 'pedidos activos'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {deliveredCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFinalizeAll}
                disabled={isFinalizing}
                className="bg-white text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
              >
                {isFinalizing
                  ? 'Finalizando...'
                  : `Finalizar entregados (${deliveredCount})`}
              </Button>
            )}
            <Input
              placeholder="Buscar por número o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-4 text-sm bg-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Actualizar pedidos"
              className="bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                orders={filteredOrders}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        </DndContext>

        {/* Empty search state */}
        {searchQuery && filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No se encontraron pedidos para &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
