import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

import './Icon.scss'

const Icon: React.FC = async () => {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const logo = settings.logo as Media | null
  const siteName = settings.siteName || 'Mi Tienda'

  return (
    <div className="admin-icon">
      {logo?.url ? (
        <img
          src={logo.url}
          alt={siteName}
          className="admin-icon__image"
          width={logo.width ?? 30}
          height={logo.height ?? 30}
        />
      ) : (
        <span className="admin-icon__text">{siteName.charAt(0)}</span>
      )}
    </div>
  )
}

export default Icon
