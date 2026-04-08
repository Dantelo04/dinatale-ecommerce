import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: await config })

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const expired = await payload.find({
    collection: 'pending-pagopar-transactions',
    where: { createdAt: { less_than: cutoff } },
    limit: 100,
    overrideAccess: true,
    depth: 0,
  })

  let cleaned = 0
  for (const pending of expired.docs) {
    await payload.delete({
      collection: 'pending-pagopar-transactions',
      id: pending.id,
      overrideAccess: true,
    })
    cleaned++
  }

  return NextResponse.json({ cleaned })
}
