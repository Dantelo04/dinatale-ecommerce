import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseWebhookBody, verifyWebhookToken } from '@/lib/pagopar'

export function GET() {
  return NextResponse.json({ respuesta: true, resultado: 'OK' })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ respuesta: false, resultado: 'Invalid JSON' }, { status: 400 })
  }

  const data = parseWebhookBody(body)
  if (!data) {
    return NextResponse.json({ respuesta: false, resultado: 'Payload inválido' }, { status: 400 })
  }

  if (!verifyWebhookToken(data.hash_pedido, data.token)) {
    return NextResponse.json({ respuesta: false, resultado: 'Token inválido' }, { status: 401 })
  }

  const payload = await getPayload({ config: await config })

  const found = await payload.find({
    collection: 'orders',
    where: { pagoparHash: { equals: data.hash_pedido } },
    limit: 1,
    overrideAccess: true,
    depth: 1,
  })

  const order = found.docs[0]
  if (!order) {
    return NextResponse.json({ respuesta: false, resultado: 'Pedido no encontrado' }, { status: 404 })
  }

  if (data.pagado) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: { status: 'in_process' },
    })
  }
  // If not paid (expired/rejected), leave as 'received' — admin can cancel manually.
  // Stock was already decremented at checkout initiation.

  return NextResponse.json({ respuesta: true, resultado: 'OK' })
}
