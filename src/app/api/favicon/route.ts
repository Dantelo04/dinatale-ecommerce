import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

export async function GET() {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const favicon = settings.favicon as Media | null

  if (favicon?.url) {
    return Response.redirect(favicon.url, 302)
  }

  return new Response(null, { status: 404 })
}
