import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params
  const host = req.headers.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
  const base = process.env.NEXT_PUBLIC_SERVER_URL || `${protocol}://${host}`

  if (!hash) {
    return NextResponse.redirect(new URL('/tienda', base))
  }

  const payload = await getPayload({ config: await config })

  // Check if order already exists (webhook fired before retorno)
  const orderFound = await payload.find({
    collection: 'orders',
    where: { pagoparHash: { equals: hash } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  if (orderFound.docs.length > 0) {
    return NextResponse.redirect(new URL(`/ordenes/${orderFound.docs[0].orderNumber}`, base))
  }

  // Order not yet created — check if pending transaction exists (payment still processing)
  const pendingFound = await payload.find({
    collection: 'pending-pagopar-transactions',
    where: { pagoparHash: { equals: hash } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  if (pendingFound.docs.length > 0) {
    return NextResponse.redirect(new URL(`/ordenes/procesando?hash=${encodeURIComponent(hash)}`, base))
  }

  return NextResponse.redirect(new URL('/tienda', base))
}
