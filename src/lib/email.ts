import type { Payload } from 'payload'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/types'

interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

interface OrderEmailData {
  id: number
  orderNumber: string
  status: OrderStatus
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  items: OrderItem[]
  totalAmount: number
  deliveryMethod?: 'pickup' | 'delivery' | null
  deliveryAddress?: string | null
}

interface SiteConfig {
  siteName: string
  primaryColor: string
}

async function getSiteConfig(payload: Payload): Promise<SiteConfig> {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
    return {
      siteName: settings.siteName || 'Anoto',
      primaryColor: settings.primaryColor || '#18181b',
    }
  } catch {
    return { siteName: 'Anoto', primaryColor: '#18181b' }
  }
}

function getOrderUrl(orderNumber: string): string {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  return `${base}/ordenes/${orderNumber}`
}

function getAdminOrderUrl(orderId: number): string {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  return `${base}/admin/collections/orders/${orderId}`
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('es-PY')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderItemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; color: #18181b;">${escapeHtml(item.productName)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: center; color: #52525b;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; color: #52525b;">Gs. ${formatAmount(item.unitPrice)}</td>
    </tr>`,
    )
    .join('')

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e4e4e7; border-radius: 6px;">
      <thead>
        <tr style="background: #f4f4f5;">
          <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #71717a; font-weight: 600;">Producto</th>
          <th style="padding: 8px 12px; text-align: center; font-size: 13px; color: #71717a; font-weight: 600;">Cant.</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #71717a; font-weight: 600;">Precio unit.</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function renderDelivery(order: OrderEmailData): string {
  if (!order.deliveryMethod) return ''
  if (order.deliveryMethod === 'pickup') {
    return '<p style="margin: 8px 0; color: #52525b;">Entrega: <strong>Pasar a retirar</strong></p>'
  }
  return `<p style="margin: 8px 0; color: #52525b;">Entrega: <strong>Envío a domicilio</strong>${order.deliveryAddress ? ` — ${escapeHtml(order.deliveryAddress)}` : ''}</p>`
}

function renderCtaButton(url: string, label: string, primaryColor: string): string {
  return `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="background: ${primaryColor}; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
        ${label}
      </a>
    </div>`
}

function emailLayout(title: string, body: string, siteName: string, primaryColor: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: ${escapeHtml(primaryColor)}; padding: 24px 32px;">
              <p style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.05em;">${escapeHtml(siteName)}</p>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.6); font-size: 13px;">${escapeHtml(title)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background: #f4f4f5; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">${escapeHtml(siteName)} &mdash; Tu tienda online</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendCustomerNewOrderEmail(
  payload: Payload,
  order: OrderEmailData,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set, skipping sendCustomerNewOrderEmail')
    return
  }
  if (!order.customerEmail) return

  const { siteName, primaryColor } = await getSiteConfig(payload)
  const orderUrl = getOrderUrl(order.orderNumber)
  const body = `
    <p style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">¡Gracias por tu compra${order.customerName ? `, ${escapeHtml(order.customerName)}` : ''}!</p>
    <p style="margin: 0 0 16px; color: #52525b;">Tu pedido fue recibido y está siendo procesado.</p>
    <p style="margin: 0 0 4px; color: #71717a; font-size: 13px;">Número de pedido</p>
    <p style="margin: 0 0 20px; color: #18181b; font-size: 17px; font-weight: 700;">#${escapeHtml(order.orderNumber)}</p>
    ${renderItemsTable(order.items)}
    <p style="margin: 4px 0 16px; color: #18181b; font-weight: 700; font-size: 15px;">Total: Gs. ${formatAmount(order.totalAmount)}</p>
    ${renderDelivery(order)}
    <p style="margin: 20px 0 8px; color: #52525b;">Podés ver el estado de tu pedido en cualquier momento haciendo click abajo.</p>
    ${renderCtaButton(orderUrl, 'Ver mi pedido', primaryColor)}`

  try {
    await payload.sendEmail({
      to: order.customerEmail,
      subject: `Pedido confirmado — #${order.orderNumber}`,
      html: emailLayout('Confirmación de Pedido', body, siteName, primaryColor),
    })
  } catch (err) {
    console.error('[email] sendCustomerNewOrderEmail failed:', err)
  }
}

export async function sendAdminNewOrderEmail(
  payload: Payload,
  adminEmail: string,
  order: OrderEmailData,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set, skipping sendAdminNewOrderEmail')
    return
  }

  const { siteName, primaryColor } = await getSiteConfig(payload)
  const adminUrl = getAdminOrderUrl(order.id)
  const body = `
    <p style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">Nuevo pedido recibido</p>
    <p style="margin: 0 0 4px; color: #71717a; font-size: 13px;">Número de pedido</p>
    <p style="margin: 0 0 20px; color: #18181b; font-size: 17px; font-weight: 700;">#${escapeHtml(order.orderNumber)}</p>
    <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Cliente</p>
    <p style="margin: 0 0 4px; color: #18181b; font-weight: 600;">${order.customerName ? escapeHtml(order.customerName) : '—'}</p>
    <p style="margin: 0 0 4px; color: #52525b;">${order.customerPhone ? escapeHtml(order.customerPhone) : '—'}</p>
    <p style="margin: 0 0 20px; color: #52525b;">${order.customerEmail ? escapeHtml(order.customerEmail) : '—'}</p>
    ${renderItemsTable(order.items)}
    <p style="margin: 4px 0 16px; color: #18181b; font-weight: 700; font-size: 15px;">Total: Gs. ${formatAmount(order.totalAmount)}</p>
    ${renderDelivery(order)}
    ${renderCtaButton(adminUrl, 'Ver pedido en el panel', primaryColor)}`

  try {
    await payload.sendEmail({
      to: adminEmail,
      subject: `Nuevo pedido — #${order.orderNumber}`,
      html: emailLayout('Nuevo Pedido', body, siteName, primaryColor),
    })
  } catch (err) {
    console.error('[email] sendAdminNewOrderEmail failed:', err)
  }
}

export async function sendCustomerStatusChangeEmail(
  payload: Payload,
  order: OrderEmailData,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set, skipping sendCustomerStatusChangeEmail')
    return
  }
  if (!order.customerEmail) return

  const { siteName, primaryColor } = await getSiteConfig(payload)
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status
  const orderUrl = getOrderUrl(order.orderNumber)
  const body = `
    <p style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">Tu pedido fue actualizado</p>
    <p style="margin: 0 0 4px; color: #71717a; font-size: 13px;">Número de pedido</p>
    <p style="margin: 0 0 20px; color: #18181b; font-size: 17px; font-weight: 700;">#${escapeHtml(order.orderNumber)}</p>
    <p style="margin: 0 0 12px; color: #52525b;">El estado de tu pedido cambió a:</p>
    <p style="margin: 0 0 24px; color: #18181b; font-size: 20px; font-weight: 700; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 6px;">${escapeHtml(statusLabel)}</p>
    ${renderCtaButton(orderUrl, 'Ver mi pedido', primaryColor)}`

  try {
    await payload.sendEmail({
      to: order.customerEmail,
      subject: `Tu pedido #${order.orderNumber} fue actualizado — ${statusLabel}`,
      html: emailLayout('Actualización de Pedido', body, siteName, primaryColor),
    })
  } catch (err) {
    console.error('[email] sendCustomerStatusChangeEmail failed:', err)
  }
}
