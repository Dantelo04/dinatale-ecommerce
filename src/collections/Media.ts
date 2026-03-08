import type { CollectionConfig } from 'payload'
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Multimedia',
    plural: 'Multimedia',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
  hooks: {
    afterChange: [revalidateCollectionAfterChange('products', 'categories', 'site-settings', 'storefront-content')],
    afterDelete: [revalidateCollectionAfterDelete('products', 'categories', 'site-settings', 'storefront-content')],
  },
}
