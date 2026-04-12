import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

import './Logo.scss'

const Logo: React.FC = async () => {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const logo = settings.logo as Media | null
  const siteName = settings.siteName || 'Mi Tienda'

  return (
    <div className="admin-logo">
      {logo?.url ? (
        <img
          src={logo.url}
          alt={siteName}
          className="admin-logo__image"
          width={logo.width ?? 200}
          height={logo.height ?? 50}
        />
      ) : (
        <span className="admin-logo__text">{siteName}</span>
      )}
    </div>
  )
}

export default Logo
