import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params

  if (!hash) {
    return NextResponse.redirect(new URL('/tienda', process.env.NEXT_PUBLIC_SERVER_URL ?? '/'))
  }

  const payload = await getPayload({ config: await config })

  const found = await payload.find({
    collection: 'orders',
    where: { pagoparHash: { equals: hash } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  const order = found.docs[0]
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  if (!order) {
    return NextResponse.redirect(new URL('/tienda', base))
  }

  return NextResponse.redirect(new URL(`/ordenes/${order.orderNumber}`, base))
}
