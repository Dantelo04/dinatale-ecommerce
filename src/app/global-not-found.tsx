import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: '404 | Pagina no encontrada',
  description: 'La pagina que estas buscando no existe.',
}

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body style={bodyStyle}>
        <main style={mainStyle}>
          <p style={codeStyle}>404</p>
          <h1 style={titleStyle}>Pagina no encontrada</h1>
          <p style={descriptionStyle}>
            La URL que abriste no existe o fue movida. Revisa el enlace o vuelve al inicio para
            seguir navegando.
          </p>

          <div style={actionsStyle}>
            <a href="/" style={primaryLinkStyle}>
              Ir al Inicio
            </a>
            <a href="/tienda" style={secondaryLinkStyle}>
              Explorar Tienda
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}

const bodyStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  backgroundColor: '#fff',
  color: '#18181b',
  overflow: 'hidden',
}

const mainStyle: CSSProperties = {
  minHeight: '100vh',
  maxWidth: '48rem',
  margin: '0 auto',
  padding: '0rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  marginTop: '-1.2rem',
}

const codeStyle: CSSProperties = {
  margin: 0,
  fontSize: '7.875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: '#71717a',
}

const titleStyle: CSSProperties = {
  margin: '0.75rem 0 0',
  fontSize: 'clamp(1.875rem, 2vw + 1rem, 2.25rem)',
  lineHeight: 1.2,
}

const descriptionStyle: CSSProperties = {
  margin: '0.75rem 0 0',
  maxWidth: '30rem',
  lineHeight: 1.5,
  color: '#52525b',
}

const actionsStyle: CSSProperties = {
  marginTop: '2rem',
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
}

const baseLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.625rem',
  padding: '0.75rem 1rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  textDecoration: 'none',
}

const primaryLinkStyle: CSSProperties = {
  ...baseLinkStyle,
  backgroundColor: '#18181b',
  color: '#fafafa',
  border: '1px solid transparent',
}

const secondaryLinkStyle: CSSProperties = {
  ...baseLinkStyle,
  backgroundColor: '#fff',
  color: '#18181b',
  border: '1px solid #d4d4d8',
}
