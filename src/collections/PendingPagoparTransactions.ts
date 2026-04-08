import type { CollectionConfig } from 'payload'

export const PendingPagoparTransactions: CollectionConfig = {
  slug: 'pending-pagopar-transactions',
  labels: {
    singular: 'Transacción Pagopar Pendiente',
    plural: 'Transacciones Pagopar Pendientes',
  },
  admin: {
    useAsTitle: 'pagoparHash',
    defaultColumns: ['pagoparHash', 'customerName', 'totalAmount', 'createdAt'],
    hideAPIURL: true,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: () => false,
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'pagoparHash',
      type: 'text',
      required: true,
      unique: true,
      label: 'Hash Pagopar',
      index: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Nombre del cliente',
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
      label: 'Teléfono del cliente',
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      label: 'Email del cliente',
    },
    {
      name: 'customerCI',
      type: 'text',
      required: true,
      label: 'Cédula de Identidad',
    },
    {
      name: 'ciudadId',
      type: 'number',
      required: true,
      label: 'Ciudad ID',
    },
    {
      name: 'siteName',
      type: 'text',
      required: true,
      label: 'Nombre del sitio',
    },
    {
      name: 'customerComment',
      type: 'textarea',
      label: 'Comentario del cliente',
    },
    {
      name: 'items',
      type: 'json',
      required: true,
      label: 'Items del carrito',
      admin: {
        description: 'Array JSON de items: [{id, name, quantity, price, imageUrl}]',
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      label: 'Monto total',
    },
    {
      name: 'totalItems',
      type: 'number',
      required: true,
      label: 'Total de productos',
    },
  ],
}
