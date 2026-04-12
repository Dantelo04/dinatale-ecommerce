import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from '@/components/storefront/ContactForm'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { SiteSetting, StorefrontContent } from '@/payload-types'

export const metadata = {
  title: 'Contacto',
  description: '¿Tenés alguna pregunta? Contactanos por email, teléfono o envianos un mensaje directo.',
  alternates: { canonical: '/contacto' },
  openGraph: { type: 'website' as const, title: 'Contacto', url: 'https://www.dinatale.com.py/contacto', locale: 'es_AR' },
}

export default async function ContactoPage() {
  const [content, settings] = await Promise.all([
    getCachedGlobal<StorefrontContent>('storefront-content', 0)(),
    getCachedGlobal<SiteSetting>('site-settings')(),
  ])

  const contact = content.contact
  const hasContactInfo = contact?.contactEmail || contact?.contactPhone || contact?.contactAddress

  return (
    <div className="mx-auto max-w-8xl px-4 lg:py-12 py-4 sm:px-6 lg:px-8">
      <h1 className="lg:text-3xl text-2xl font-bold tracking-tight text-wrap-balance sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        Tienes alguna pregunta? No dudes en contactarnos.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {hasContactInfo && (
          <div className="flex flex-col gap-6">
            {contact?.contactEmail && (
              <Card>
                <CardContent className="flex items-start gap-4 p-6">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-site-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold">Email</h3>
                    <a
                      href={`mailto:${contact.contactEmail}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {contact.contactEmail}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {contact?.contactPhone && (
              <Card>
                <CardContent className="flex items-start gap-4 p-6">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-site-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold">Telefono</h3>
                    <a
                      href={`tel:${contact.contactPhone}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {contact.contactPhone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {contact?.contactAddress && (
              <Card>
                <CardContent className="flex items-start gap-4 p-6">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-site-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold">Direccion</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {contact.contactAddress}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className={!hasContactInfo ? 'lg:col-span-2 max-w-lg' : ''}>
          <Card>
            <CardContent className="px-6">
              <h2 className="text-lg font-semibold mb-4">Envianos un mensaje</h2>
              <ContactForm whatsappNumber={settings.whatsappNumber} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
