import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Vercel invokes cron routes with GET and sends Authorization: Bearer {CRON_SECRET}
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: await config })

  // Midnight Argentina (UTC-3) = 03:00 UTC
  // Orders delivered before that timestamp are eligible to be finalized
  const now = new Date()
  const todayMidnightArgentina = new Date(now)
  todayMidnightArgentina.setUTCHours(3, 0, 0, 0)
  // If it's still before 03:00 UTC today, that midnight hasn't occurred yet — step back one day
  if (now.getUTCHours() < 3) {
    todayMidnightArgentina.setUTCDate(todayMidnightArgentina.getUTCDate() - 1)
  }

  const eligible = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { status: { equals: 'delivered' } },
        { deliveredAt: { less_than: todayMidnightArgentina.toISOString() } },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  await Promise.all(
    eligible.docs.map((o) =>
      payload.update({
        collection: 'orders',
        id: o.id,
        data: { status: 'finalized' },
        overrideAccess: true,
      }),
    ),
  )

  return NextResponse.json({ finalized: eligible.docs.length })
}
