'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createTransaction } from '@/lib/pagopar'
import type { PagoparItem } from '@/lib/pagopar'

interface CheckoutItem {
  id: number
  name: string
  quantity: number
  price: number
  imageUrl?: string | null
}

type PagoparCheckoutSuccess = { success: true; redirectUrl: string; orderNumber: string }
type PagoparCheckoutError = { success: false; error: string }

export async function processPagoparCheckout(
  items: CheckoutItem[],
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  customerCI: string,
  ciudadId: number,
  siteName: string,
  customerComment?: string,
): Promise<PagoparCheckoutSuccess | PagoparCheckoutError> {
  const payload = await getPayload({ config: await config })

  for (const item of items) {
    const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
    if ((product.stock ?? 0) < item.quantity) {
      return {
        success: false,
        error: `Solo quedan ${product.stock} unidades de "${item.name}".`,
      }
    }
  }

  await Promise.all(
    items.map(async (item) => {
      const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
      return payload.update({
        collection: 'products',
        id: item.id,
        data: {
          sales: (product.sales ?? 0) + item.quantity,
          stock: Math.max(0, (product.stock ?? 0) - item.quantity),
        },
      })
    }),
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    draft: false,
    data: {
      status: 'received',
      paymentMethod: 'pagopar',
      customerName,
      customerPhone,
      customerEmail,
      items: items.map((item) => ({
        product: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalItems,
      totalAmount,
      ...(customerComment ? { customerComment } : {}),
    },
  })

  const publicKey = process.env.PAGOPAR_PUBLIC_KEY ?? ''

  const pagoparItems: PagoparItem[] = items.map((item) => ({
    nombre: item.name,
    cantidad: item.quantity,
    precio_total: item.price * item.quantity,
    ciudad: String(ciudadId),
    descripcion: item.name,
    url_imagen: item.imageUrl ?? '',
    vendedor_telefono: '',
    vendedor_direccion: '',
    vendedor_direccion_referencia: '',
    vendedor_direccion_coordenadas: '',
    public_key: publicKey,
    categoria: '909',
    id_producto: item.id,
  }))

  const result = await createTransaction({
    orderId: order.orderNumber!,
    totalAmount,
    description: `Pedido en ${siteName}`,
    buyer: {
      nombre: customerName,
      ciudad: ciudadId,
      email: customerEmail,
      telefono: customerPhone,
      tipo_documento: 'CI',
      documento: customerCI,
      direccion: '',
      direccion_referencia: null,
      coordenadas: '',
      ruc: '',
      razon_social: customerName,
    },
    items: pagoparItems,
  })

  if (!result.ok) {
    await payload.delete({ collection: 'orders', id: order.id, overrideAccess: true })
    await Promise.all(
      items.map(async (item) => {
        const product = await payload.findByID({ collection: 'products', id: item.id, depth: 0 })
        return payload.update({
          collection: 'products',
          id: item.id,
          data: {
            sales: Math.max(0, (product.sales ?? 0) - item.quantity),
            stock: (product.stock ?? 0) + item.quantity,
          },
        })
      }),
    )
    return { success: false, error: result.error }
  }

  await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    data: { pagoparHash: result.hashPedido },
  })

  return {
    success: true,
    redirectUrl: result.redirectUrl,
    orderNumber: order.orderNumber!,
  }
}
