import React from 'react'
import { getCachedGlobal } from '@/lib/payload-cache'
import type { SiteSetting } from '@/payload-types'
import { LegalPageHeader } from '@/components/storefront/LegalPageHeader'

export const metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales.',
  alternates: { canonical: '/privacidad' },
}

export default async function PrivacidadPage() {
  const settings = await getCachedGlobal<SiteSetting>('site-settings')()
  const siteName = settings.siteName

  return (
    <>
      <LegalPageHeader
        title="Política de Privacidad"
        siteName={siteName}
        updatedAt="Última actualización: abril de 2026"
      />

      {/* Content */}
      <div className="px-4 py-10 sm:px-6 lg:px-8 w-full">
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80 mx-auto max-w-3xl ">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Responsable del tratamiento</h2>
            <p>
              Anoto es responsable del tratamiento de los datos personales que usted nos proporciona a
              través de este sitio web. Para consultas relacionadas con su privacidad puede contactarnos en{' '}
              <a href="mailto:contact@anoto.com.py" className="underline hover:text-foreground">
                contact@anoto.com.py
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Datos que recopilamos</h2>
            <p>Podemos recopilar los siguientes tipos de datos personales:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Nombre y apellido (cuando se comunica con nosotros o realiza un pedido)</li>
              <li>Número de teléfono (para contacto vía WhatsApp y coordinación de entrega)</li>
              <li>Dirección de entrega (cuando corresponde)</li>
              <li>Datos de navegación y uso del sitio (a través de cookies y herramientas de analítica)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Finalidad del tratamiento</h2>
            <p>Sus datos son utilizados para:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Procesar y gestionar sus pedidos mediante WhatsApp</li>
              <li>Responder consultas y brindar atención al cliente</li>
              <li>Mejorar la experiencia de navegación en el sitio</li>
              <li>Cumplir obligaciones legales y fiscales aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Uso de cookies</h2>
            <p>
              Este sitio utiliza cookies propias y de terceros (Google Analytics, Google Tag Manager) para
              analizar el tráfico y mejorar nuestros servicios. Al continuar navegando, acepta su uso.
              Puede desactivarlas desde la configuración de su navegador, aunque esto puede afectar la
              funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Proceso de compra vía WhatsApp</h2>
            <p>
              Los pedidos se confirman a través de WhatsApp. Al enviar su pedido, usted acepta que su
              nombre, número de contacto y detalle del carrito sean compartidos en dicha plataforma para
              coordinar la entrega y el pago. No almacenamos datos de tarjetas de crédito ni información
              financiera sensible.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Compartir datos con terceros</h2>
            <p>
              No vendemos ni cedemos sus datos personales a terceros con fines comerciales. Únicamente los
              compartimos cuando sea necesario para cumplir con el servicio contratado (por ejemplo,
              servicios de logística) o por exigencia legal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Sus derechos (Ley 1682/01)</h2>
            <p>
              De acuerdo con la Ley de Privacidad del Tratamiento de Datos Personales N° 1682/01 de la
              República del Paraguay y su modificatoria Ley N° 1969/02, usted tiene derecho a acceder,
              rectificar, cancelar y oponerse al tratamiento de sus datos personales. Para ejercer estos
              derechos, contáctenos en{' '}
              <a href="mailto:contact@anoto.com.py" className="underline hover:text-foreground">
                contact@anoto.com.py
              </a>
              .
            </p>
            <p className="mt-2">
              La Secretaría Nacional de Tecnologías de la Información y Comunicación (SENATICs) es el
              organismo de referencia en materia de protección de datos en Paraguay.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Modificaciones</h2>
            <p>
              Anoto se reserva el derecho de actualizar esta política en cualquier momento. Los cambios
              serán publicados en esta página con la fecha de última actualización.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
