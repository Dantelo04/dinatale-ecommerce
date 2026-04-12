import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash')
  if (!hash) {
    return NextResponse.json({ status: 'not_found' }, { status: 400 })
  }

  const payload = await getPayload({ config: await config })

  const orderFound = await payload.find({
    collection: 'orders',
    where: { pagoparHash: { equals: hash } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  if (orderFound.docs.length > 0) {
    return NextResponse.json({ status: 'confirmed', orderNumber: orderFound.docs[0].orderNumber })
  }

  const pendingFound = await payload.find({
    collection: 'pending-pagopar-transactions',
    where: { pagoparHash: { equals: hash } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })

  if (pendingFound.docs.length > 0) {
    return NextResponse.json({ status: 'pending' })
  }

  return NextResponse.json({ status: 'not_found' })
}
