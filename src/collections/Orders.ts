import type { CollectionConfig } from 'payload'
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Pedido',
    plural: 'Pedidos',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'customerName', 'totalAmount', 'createdAt'],
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      label: 'Estado',
      options: [
        { label: 'Recibido', value: 'received' },
        { label: 'En Proceso', value: 'in_process' },
        { label: 'Enviado', value: 'shipped' },
        { label: 'Entregado', value: 'delivered' },
        { label: 'Finalizado', value: 'finalized' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Método de Pago',
      defaultValue: 'whatsapp',
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Pagopar', value: 'pagopar' },
      ],
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'pagoparHash',
      type: 'text',
      label: 'Hash Pagopar',
      admin: {
        readOnly: true,
        hidden: true,
        description: 'Hash de transacción generado por Pagopar',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      label: 'Nombre del cliente',
    },
    {
      name: 'customerPhone',
      type: 'text',
      label: 'Teléfono del cliente',
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Email del cliente',
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
    {
      name: 'deliveredAt',
      type: 'date',
      label: 'Fecha de entrega',
      admin: {
        hidden: true,
      },
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
    afterChange: [
      revalidateCollectionAfterChange(),
      async ({ doc, previousDoc, req, operation, context }) => {
        if (context?.skipDeliveredHook) return doc
        if (
          doc.status === 'delivered' &&
          (operation === 'create' || previousDoc?.status !== 'delivered')
        ) {
          await req.payload.update({
            collection: 'orders',
            id: doc.id,
            data: { deliveredAt: new Date().toISOString() },
            req,
            context: { skipDeliveredHook: true },
          })
        } else if (doc.status !== 'delivered' && previousDoc?.status === 'delivered') {
          await req.payload.update({
            collection: 'orders',
            id: doc.id,
            data: { deliveredAt: null },
            req,
            context: { skipDeliveredHook: true },
          })
        }
        return doc
      },
    ],
    afterDelete: [revalidateCollectionAfterDelete()],
  },
}
