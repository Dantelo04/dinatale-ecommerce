import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import './GoToSiteButton.scss'

const GoToSiteButton: React.FC = async () => {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  const primaryColor = settings.primaryColor || '#18181b'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root, [data-theme="light"] {
              --theme-elevation-900: ${primaryColor};
              --theme-elevation-1000: ${primaryColor};
            }
          `,
        }}
      />
      <div className="go-to-site">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="go-to-site__button"
        >
          Ver tienda: {settings.siteName}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </>
  )
}

export default GoToSiteButton
