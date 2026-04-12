import type { CollectionConfig } from 'payload'
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoria',
    plural: 'Categorias',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    hideAPIURL: true,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      label: 'Slug (URL)',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen',
    },
  ],
  hooks: {
    afterChange: [revalidateCollectionAfterChange()],
    afterDelete: [revalidateCollectionAfterDelete()],
    beforeValidate: [
      ({ data, operation }) => {
        if (data && (operation === 'create' || !data.slug) && data.name) {
          data.slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
