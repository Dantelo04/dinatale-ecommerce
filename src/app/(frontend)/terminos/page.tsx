import React from 'react'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { SiteSetting } from '@/payload-types'
import { LegalPageHeader } from '@/components/storefront/LegalPageHeader'

export const metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso y compra.',
  alternates: { canonical: '/terminos' },
}

export default async function TerminosPage() {
  const settings = await getCachedGlobal<SiteSetting>('site-settings')()
  const siteName = settings.siteName

  return (
    <>
      <LegalPageHeader
        title="Términos y Condiciones"
        siteName={siteName}
        updatedAt="Última actualización: abril de 2026"
      />

      {/* Content */}
      <div className="px-4 py-10 sm:px-6 lg:px-8 w-full">
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80 mx-auto max-w-3xl ">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web de {siteName}, usted acepta quedar vinculado por estos
              Términos y Condiciones. Si no está de acuerdo con alguna de estas condiciones, le pedimos que
              no utilice nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Proceso de compra</h2>
            <p>
              Las compras en {siteName} se realizan a través de WhatsApp. El proceso es el siguiente:
            </p>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>El cliente selecciona los productos y los agrega al carrito.</li>
              <li>Al confirmar el pedido, se genera un mensaje automático enviado a nuestro WhatsApp.</li>
              <li>Un asesor de {siteName} se comunicará para confirmar disponibilidad, precio final y coordinar la entrega.</li>
              <li>El pedido se confirma únicamente una vez acordados los términos de entrega y pago.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Precios y disponibilidad</h2>
            <p>
              Todos los precios publicados están expresados en la moneda indicada y pueden estar sujetos a
              modificaciones sin previo aviso. {siteName} no garantiza la disponibilidad de los productos
              mostrados en el sitio. La disponibilidad final será confirmada al momento de procesar el pedido.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Medios de pago y entrega</h2>
            <p>
              Los medios de pago aceptados y las condiciones de entrega son acordados directamente con el
              cliente a través de WhatsApp al momento de confirmar el pedido. Los plazos de entrega pueden
              variar según disponibilidad de stock y ubicación.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Cancelaciones y devoluciones</h2>
            <p>
              Las solicitudes de cancelación deben realizarse antes de la confirmación del envío. Una vez
              despachado el producto, las devoluciones serán evaluadas caso a caso. Los productos deben
              devolverse en su estado original y embalaje. Para iniciar una devolución, contáctenos por
              WhatsApp o correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Propiedad intelectual</h2>
            <p>
              Todo el contenido de este sitio (imágenes, textos, logos, diseños) es propiedad de {siteName}
              o de sus respectivos titulares y está protegido por las leyes de propiedad intelectual. Queda
              prohibida su reproducción sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Limitación de responsabilidad</h2>
            <p>
              {siteName} no será responsable por daños indirectos, pérdidas de datos o interrupciones del
              servicio derivadas del uso del sitio. El sitio se provee &quot;tal cual&quot; y puede estar sujeto a
              mantenimiento o modificaciones sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República del Paraguay. Cualquier disputa será
              resuelta ante los tribunales ordinarios competentes de Asunción, Paraguay, con renuncia
              expresa a cualquier otro fuero que pudiera corresponder.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Modificaciones</h2>
            <p>
              {siteName} podrá modificar estos Términos y Condiciones en cualquier momento. Las
              modificaciones serán efectivas desde su publicación en este sitio.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
