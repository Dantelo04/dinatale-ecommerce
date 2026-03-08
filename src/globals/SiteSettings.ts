import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuracion del Sitio',
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
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
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
      type: 'row',
      fields: [
        {
          name: 'currency',
          label: 'Moneda',
          type: 'text',
          defaultValue: 'ARS',
        },
        {
          name: 'currencySymbol',
          label: 'Simbolo de Moneda',
          type: 'text',
          defaultValue: '$',
        },
      ],
    },
  ],
}
