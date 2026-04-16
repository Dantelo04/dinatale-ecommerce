import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

const toIds = (variants: unknown): number[] =>
  ((variants as (number | { id: number })[]) ?? []).map((v) =>
    typeof v === 'object' && v !== null ? v.id : (v as number),
  )

const syncVariantsBidirectional: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (req.context?.skipVariantSync) return doc

  const newIds = toIds(doc.variants)
  const oldIds = operation === 'create' ? [] : toIds(previousDoc?.variants)

  const added = newIds.filter((id) => !oldIds.includes(id))
  const removed = oldIds.filter((id) => !newIds.includes(id))
  const labelChanged = (doc.variantLabel ?? null) !== (previousDoc?.variantLabel ?? null)

  if (added.length === 0 && removed.length === 0 && !labelChanged) return doc

  const context = { ...req.context, skipVariantSync: true }

  // Added variants: add current product to their list + sync label
  await Promise.all(
    added.map(async (variantId) => {
      const variant = await req.payload.findByID({
        collection: 'products',
        id: variantId,
        req,
        overrideAccess: true,
      })
      const currentIds = toIds(variant.variants)
      const data: Record<string, unknown> = {}
      if (!currentIds.includes(doc.id)) data.variants = [...currentIds, doc.id]
      if (doc.variantLabel != null) data.variantLabel = doc.variantLabel
      if (Object.keys(data).length > 0) {
        await req.payload.update({
          collection: 'products',
          id: variantId,
          data,
          req,
          context,
          overrideAccess: true,
        })
      }
    }),
  )

  // Removed variants: remove current product from their list
  await Promise.all(
    removed.map(async (variantId) => {
      const variant = await req.payload.findByID({
        collection: 'products',
        id: variantId,
        req,
        overrideAccess: true,
      })
      const currentIds = toIds(variant.variants)
      if (currentIds.includes(doc.id)) {
        await req.payload.update({
          collection: 'products',
          id: variantId,
          data: { variants: currentIds.filter((id) => id !== doc.id) },
          req,
          context,
          overrideAccess: true,
        })
      }
    }),
  )

  // Label changed: propagate to all existing variants not already updated above
  if (labelChanged) {
    const alreadyUpdated = new Set(added)
    await Promise.all(
      newIds
        .filter((id) => !alreadyUpdated.has(id))
        .map((variantId) =>
          req.payload.update({
            collection: 'products',
            id: variantId,
            data: { variantLabel: doc.variantLabel ?? null },
            req,
            context,
            overrideAccess: true,
          }),
        ),
    )
  }

  return doc
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Producto',
    plural: 'Productos',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category', 'featured', 'active'],
    hideAPIURL: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return { active: { equals: true } }
    },
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
      type: 'richText',
      label: 'Descripción',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Precio',
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Precio original (se mostrara tachado si es mayor al precio actual)',
      },
      label: 'Precio original',
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      label: 'Imágenes',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Imagen',
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Categorías',
      hasMany: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
      label: 'Es destacado',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
      label: 'Activo',
    },
    {
      name: 'showPromos',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Mostrar la sección de productos en promoción en la página de este producto',
      },
      label: 'Mostrar promos',
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Número de visitas a la página del producto',
        readOnly: true,
      },
      access: {
        update: () => false,
      },
      label: 'Visitas',
    },
    {
      name: 'sales',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Número de ventas del producto',
        readOnly: true,
      },
      access: {
        update: () => false,
      },
      label: 'Ventas',
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 5,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Unidades disponibles en stock',
      },
      label: 'Stock',
    },
    {
      name: 'variants',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Variantes',
      admin: {
        description:
          'Otros productos que son variantes de este (ej: el mismo producto en otro color)',
        components: {
          Field: '/components/admin/VariantsField',
        },
      },
    },
    {
      name: 'variantLabel',
      type: 'text',
      label: 'Nombre de la variante',
      admin: {
        description: 'Ej: Color, Talle, Material (se muestra como "Color: Nombre del producto")',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateCollectionAfterChange(), syncVariantsBidirectional],
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
