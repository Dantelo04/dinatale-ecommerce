import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Pedido',
    plural: 'Pedidos',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'totalItems', 'totalAmount', 'createdAt'],
    hideAPIURL: true,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      label: 'Número de Pedido',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Productos',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          label: 'Producto',
        },
        {
          name: 'productName',
          type: 'text',
          required: true,
          label: 'Nombre del producto',
          admin: {
            readOnly: true,
            description: 'Nombre al momento de la compra',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          label: 'Cantidad',
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          label: 'Precio unitario',
        },
      ],
    },
    {
      name: 'totalItems',
      type: 'number',
      required: true,
      label: 'Total de productos',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      label: 'Monto total',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerComment',
      type: 'textarea',
      label: 'Comentario del cliente',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.orderNumber) {
          data.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        }
        return data
      },
    ],
  },
}
