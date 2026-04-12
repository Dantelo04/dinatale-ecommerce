import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const StorefrontContent: GlobalConfig = {
  slug: 'storefront-content',
  label: 'Contenido del Sitio',
  hooks: {
    afterChange: [revalidateGlobalAfterChange()],
  },
  admin: {
    hideAPIURL: true,
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'homeSections',
      label: 'Secciones del Home',
      type: 'array',
      admin: {
        description:
          'Arrastra las secciones para cambiar su orden en el home. El Hero siempre se muestra primero.',
      },
      labels: { singular: 'Seccion', plural: 'Secciones' },
      fields: [
        {
          name: 'type',
          label: 'Tipo de Seccion',
          type: 'select',
          required: true,
          options: [
            { label: 'Categorias', value: 'categories' },
            { label: 'Productos Destacados', value: 'featured' },
            { label: 'Reseñas de Google', value: 'reviews' },
            { label: 'Ultimos Productos', value: 'latest' },
          ],
        },
        {
          name: 'enabled',
          label: 'Habilitada',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'heroSlides',
      label: 'Slides del Banner',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      admin: {
        description: 'Cada slide se muestra en el carrusel del banner principal',
      },
      fields: [
        {
          name: 'title',
          label: 'Titulo',
          type: 'text',
          defaultValue: 'Bienvenidos a nuestra tienda',
        },
        {
          name: 'subtitle',
          label: 'Subtitulo',
          type: 'text',
          defaultValue: 'Descubri nuestros productos',
        },
        {
          name: 'image',
          label: 'Imagen de Fondo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'buttonText',
          label: 'Texto del Boton',
          type: 'text',
          defaultValue: 'Ver Productos',
        },
        {
          name: 'buttonLink',
          label: 'Link del Boton',
          type: 'text',
          defaultValue: '/tienda',
          admin: {
            description: 'Ruta interna (ej: /tienda) o URL externa',
          },
        },
      ],
    },
    {
      name: 'categories',
      label: 'Categorias del Home',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Categoria',
        plural: 'Categorias',
      },
      fields: [
        {
          name: 'category',
          label: 'Categoria',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
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
        {
          name: 'googleMaps',
          label: 'Google Maps',
          type: 'text',
          admin: { description: 'URL completa' },
        },
      ],
    },
  ],
}
