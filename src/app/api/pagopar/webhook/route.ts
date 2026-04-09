import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseWebhookBody, verifyWebhookToken, queryOrderStatus } from '@/lib/pagopar'
import { atomicDecrementStock } from '@/lib/stock-ops'
import { sendCustomerNewOrderEmail, sendAdminNewOrderEmail } from '@/lib/email'

interface PendingItem {
  id: number
  name: string
  quantity: number
  price: number
  imageUrl?: string | null
}

export function GET() {
  return NextResponse.json({ respuesta: true, resultado: 'OK' })
}

export async function POST(req: NextRequest) {
  const rawText = await req.text()
  console.log('[pagopar/webhook] content-type:', req.headers.get('content-type'))
  console.log('[pagopar/webhook] raw body:', rawText)

  let body: unknown
  try {
    body = JSON.parse(rawText)
  } catch {
    // Pagopar might send form-encoded data
    try {
      const params = new URLSearchParams(rawText)
      const obj: Record<string, string> = {}
      params.forEach((v, k) => { obj[k] = v })
      body = obj
    } catch {
      return NextResponse.json({ respuesta: false, resultado: 'Invalid body' }, { status: 400 })
    }
  }

  console.log('[pagopar/webhook] parsed body:', JSON.stringify(body))

  const data = parseWebhookBody(body)
  if (!data) {
    console.log('[pagopar/webhook] parseWebhookBody returned null — unexpected format')
    return NextResponse.json({ respuesta: false, resultado: 'Payload inválido' }, { status: 400 })
  }

  console.log('[pagopar/webhook] parsed data:', JSON.stringify(data))

  if (!verifyWebhookToken(data.hash_pedido, data.token)) {
    console.log('[pagopar/webhook] token verification failed')
    return NextResponse.json({ respuesta: false, resultado: 'Token inválido' }, { status: 401 })
  }

  // Paso 3: query Pagopar to confirm payment status (required for staging certification)
  const statusResult = await queryOrderStatus(data.hash_pedido)
  console.log('[pagopar/webhook] queryOrderStatus result:', JSON.stringify(statusResult))

  // Process order (create/cancel) before responding
  await processWebhook(data)

  // Paso 2: return just the "resultado" array — Pagopar expects this exact format
  const b = body as Record<string, unknown>
  return NextResponse.json(b.resultado)
}

async function processWebhook(data: NonNullable<ReturnType<typeof parseWebhookBody>>) {
  const payload = await getPayload({ config: await config })

  // Check if order was already created (idempotent — webhook may fire more than once)
  const existingOrder = await payload.find({
    collection: 'orders',
    where: { pagoparHash: { equals: data.hash_pedido } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  if (existingOrder.docs.length > 0) return

  // Find the pending transaction
  const found = await payload.find({
    collection: 'pending-pagopar-transactions',
    where: { pagoparHash: { equals: data.hash_pedido } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  const pending = found.docs[0]
  if (!pending) {
    console.log('[pagopar/webhook] no pending transaction found for hash:', data.hash_pedido)
    return
  }

  const items = pending.items as PendingItem[]

  if (data.pagado) {
    // Payment confirmed — decrement stock now that payment is confirmed
    for (const item of items) {
      await atomicDecrementStock(payload, item.id, item.quantity)
    }

    // Create the real order
    const newOrder = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        status: 'received',
        paymentMethod: 'pagopar',
        pagoparHash: pending.pagoparHash,
        customerName: pending.customerName,
        customerPhone: pending.customerPhone,
        customerEmail: pending.customerEmail as string,
        items: items.map((item) => ({
          product: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalItems: pending.totalItems,
        totalAmount: pending.totalAmount,
        ...(pending.customerComment ? { customerComment: pending.customerComment as string } : {}),
        ...(pending.deliveryMethod ? { deliveryMethod: pending.deliveryMethod } : {}),
        ...(pending.deliveryAddress ? { deliveryAddress: pending.deliveryAddress as string } : {}),
      },
    })

    // Send email notifications (errors are swallowed inside each function)
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    })
    const adminEmail = settings.adminNotificationEmail

    const orderEmailData = {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber as string,
      status: newOrder.status as 'received',
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      customerPhone: newOrder.customerPhone,
      items: (newOrder.items ?? []).map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: newOrder.totalAmount,
      deliveryMethod: newOrder.deliveryMethod as 'pickup' | 'delivery' | null | undefined,
      deliveryAddress: newOrder.deliveryAddress,
    }

    await sendCustomerNewOrderEmail(payload, orderEmailData)
    if (adminEmail) {
      await sendAdminNewOrderEmail(payload, adminEmail, orderEmailData)
    }

    await payload.delete({
      collection: 'pending-pagopar-transactions',
      id: pending.id,
      overrideAccess: true,
    })
  } else if (data.cancelado) {
    // Payment explicitly cancelled — clean up pending transaction
    await payload.delete({
      collection: 'pending-pagopar-transactions',
      id: pending.id,
      overrideAccess: true,
    })
  }
}
