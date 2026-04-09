import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuracion del Sitio',
  admin: {
    hideAPIURL: true,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange()],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'siteName',
      label: 'Nombre de la Tienda',
      type: 'text',
      required: true,
      defaultValue: 'Mi Tienda',
    },
    {
      name: 'hideName',
      label: 'Ocultar Nombre de la Tienda en el Header',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Si se activa, el nombre de la tienda no se mostrará en el header',
      },
    },
    {
      name: 'siteDescription',
      label: 'Descripción de la Tienda',
      type: 'textarea',
      admin: {
        description: 'Descripción de la tienda',
      },
    },
    {
      name: 'siteKeywords',
      label: 'Palabras Clave',
      type: 'text',
      admin: {
        description: 'Palabras claves separadas por comas (ej: producto, tienda, online, etc.)',
      },
    },
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoSize',
      label: 'Tamaño del Logo',
      type: 'text',
      defaultValue: '10',
      admin: {
        description: 'Tamaño del logo en el header en escritorio',
        position: 'sidebar',
      },
    },
    {
      name: 'logoSizeMobile',
      label: 'Tamaño del Logo en Móvil',
      type: 'text',
      defaultValue: '9',
      admin: {
        description: 'Tamaño del logo en el header en móvil',
        position: 'sidebar',
      },
    },
    {
      name: 'favicon',
      label: 'Favicon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Icono de la pestana del navegador (recomendado: 32x32px o 64x64px, formato PNG o ICO)',
      },
    },
    {
      name: 'headerLogoSide',
      label: 'Posición del Logo en el Header en Móvil',
      type: 'select',
      options: [
        {
          label: 'Izquierda',
          value: 'left',
        },
        {
          label: 'Centro',
          value: 'center',
        },
      ],
      defaultValue: 'center',
      admin: {
        description: 'Posición del logo en el header en móvil',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryColor',
          label: 'Color Primario',
          type: 'text',
          defaultValue: '#18181b',
          admin: {
            description: 'Color hexadecimal (ej: #18181b)',
          },
        },
        {
          name: 'secondaryColor',
          label: 'Color Secundario',
          type: 'text',
          defaultValue: '#71717a',
          admin: {
            description: 'Color hexadecimal (ej: #71717a)',
          },
        },
      ],
    },
    {
      name: 'whatsappNumber',
      label: 'Numero de WhatsApp',
      type: 'text',
      required: true,
      admin: {
        description: 'Numero con codigo de pais sin + ni espacios (ej: 5491112345678)',
      },
    },
    {
      name: 'adminNotificationEmail',
      label: 'Email de Notificaciones de Admin',
      type: 'email',
      admin: {
        description: 'Email que recibirá alertas cuando se realice un nuevo pedido con Pagopar.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'currency',
          label: 'Moneda',
          type: 'text',
          defaultValue: 'PYG',
        },
        {
          name: 'currencySymbol',
          label: 'Simbolo de Moneda',
          type: 'text',
          defaultValue: 'GS',
        },
      ],
    },
    {
      type: 'group',
      name: 'storefront',
      label: 'Configuracion de la Tienda',
      fields: [
        {
          name: 'gridCols',
          label: 'Columnas en la Grilla de Productos de Tienda en Escritorio',
          type: 'number',
          defaultValue: 5,
        },  
        {
          name: 'gridColsMobile',
          label: 'Columnas en la Grilla de Productos de Tienda en Móvil',
          type: 'number',
          defaultValue: 2,
        },
        {
          name: 'redirectToOrderAfterCheckout',
          label: 'Redirigir a la página del pedido después del checkout',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Si se activa, después de confirmar el pedido se redirige al cliente a la página de estado del pedido',
          },
        },
        {
          name: 'showPickup',
          label: 'Mostrar opción "Pasar a retirar" en el carrito',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'pickupInfo',
          label: 'Especificaciones para "Pasar a retirar"',
          type: 'text',
          admin: {
            description: 'Ej: "Tiempo de espera de 1 a 2 días hábiles"',
            condition: (data) => data?.storefront?.showPickup,
          },
        },
        {
          name: 'showDelivery',
          label: 'Mostrar opción "Envío" en el carrito',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'deliveryInfo',
          label: 'Especificaciones para "Envío"',
          type: 'text',
          admin: {
            description: 'Ej: "Tiempo de envío de 2 a 3 días hábiles"',
            condition: (data) => data?.storefront?.showDelivery,
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'pagopar',
      label: 'Pagopar (Pasarela de Pagos)',
      fields: [
        {
          name: 'enabled',
          label: 'Habilitar Pagopar',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Activa la opción de pagar con tarjeta/billetera mediante Pagopar en el carrito. Requiere PAGOPAR_PUBLIC_KEY y PAGOPAR_PRIVATE_KEY en las variables de entorno.',
          },
        },
        {
          name: 'ciudadId',
          label: 'ID de Ciudad (Pagopar)',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'ID de la ciudad de la tienda en Pagopar (1 = Asunción). Consultar lista de ciudades en el panel de Pagopar.',
            condition: (data: Record<string, unknown>) => Boolean((data?.pagopar as Record<string, unknown>)?.enabled),
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'customAlert',
      label: 'Alerta Personalizada en el Header',
      fields: [
        {
          name: 'alertTitle',
          label: 'Texto de la Alerta',
          type: 'text',
        },
      ],
    },
    {
      type: 'group',
      name: 'showTitles',
      label: 'Mostrar Titulo de la Tienda',
      fields: [
        {
          name: 'showPageTitles',
          label: 'Mostrar Titulo de la Tienda',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    }
  ],
}
