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

type PagoparCheckoutSuccess = { success: true; redirectUrl: string }
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
  deliveryMethod?: 'pickup' | 'delivery',
  deliveryAddress?: string,
): Promise<PagoparCheckoutSuccess | PagoparCheckoutError> {
  const payload = await getPayload({ config: await config })

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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

  // 2. Generate a temporary order ID for Pagopar (not persisted as an order yet)
  const tempOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // 3. Initiate Pagopar transaction — if this fails, rollback stock and return error without DB records
  const result = await createTransaction({
    orderId: tempOrderId,
    totalAmount,
    description: `Pedido en ${siteName}`,
    buyer: {
      nombre: customerName,
      ciudad: ciudadId,
      email: customerEmail,
      telefono: customerPhone,
      tipo_documento: 'CI',
      documento: customerCI,
      direccion: deliveryAddress || '',
      direccion_referencia: null,
      coordenadas: '',
      ruc: '',
      razon_social: customerName,
    },
    items: pagoparItems,
  })

  if (!result.ok) {
    return { success: false, error: result.error }
  }

  // 4. Store pending transaction — order will be created by webhook on payment confirmation
  await payload.create({
    collection: 'pending-pagopar-transactions',
    overrideAccess: true,
    data: {
      pagoparHash: result.hashPedido,
      customerName,
      customerPhone,
      customerEmail,
      customerCI,
      ciudadId,
      siteName,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl ?? null,
      })),
      totalItems,
      totalAmount,
      ...(customerComment ? { customerComment } : {}),
      ...(deliveryMethod ? { deliveryMethod } : {}),
      ...(deliveryAddress ? { deliveryAddress } : {}),
    },
  })

  return {
    success: true,
    redirectUrl: result.redirectUrl,
  }
}
