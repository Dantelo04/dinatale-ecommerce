import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const StorefrontContent: GlobalConfig = {
  slug: 'storefront-content',
  label: 'Contenido del Sitio',
  hooks: {
    afterChange: [revalidateGlobalAfterChange()],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero / Banner Principal',
      fields: [
        {
          name: 'heroTitle',
          label: 'Titulo',
          type: 'text',
          defaultValue: 'Bienvenidos a nuestra tienda',
        },
        {
          name: 'heroSubtitle',
          label: 'Subtitulo',
          type: 'text',
          defaultValue: 'Descubri nuestros productos',
        },
        {
          name: 'heroImage',
          label: 'Imagen de Fondo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      type: 'group',
      name: 'about',
      label: 'Sobre Nosotros',
      fields: [
        {
          name: 'aboutTitle',
          label: 'Titulo',
          type: 'text',
          defaultValue: 'Sobre Nosotros',
        },
        {
          name: 'aboutContent',
          label: 'Contenido',
          type: 'richText',
        },
        {
          name: 'aboutImage',
          label: 'Imagen',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contacto',
      fields: [
        {
          name: 'contactEmail',
          label: 'Email',
          type: 'email',
        },
        {
          name: 'contactPhone',
          label: 'Telefono',
          type: 'text',
        },
        {
          name: 'contactAddress',
          label: 'Direccion',
          type: 'textarea',
        },
        {
          name: 'contactMapUrl',
          label: 'URL de Google Maps',
          type: 'text',
        },
      ],
    },
    {
      type: 'group',
      name: 'socialLinks',
      label: 'Redes Sociales',
      fields: [
        {
          name: 'instagram',
          label: 'Instagram',
          type: 'text',
          admin: { description: 'URL completa (ej: https://instagram.com/mitienda)' },
        },
        {
          name: 'facebook',
          label: 'Facebook',
          type: 'text',
          admin: { description: 'URL completa' },
        },
        {
          name: 'tiktok',
          label: 'TikTok',
          type: 'text',
          admin: { description: 'URL completa' },
        },
      ],
    },
  ],
}
