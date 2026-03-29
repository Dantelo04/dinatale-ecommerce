import { createHash } from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PagoparBuyer {
  nombre: string
  ciudad: number
  email: string
  telefono: string
  tipo_documento: string
  documento: string
  direccion: string
  direccion_referencia: string
  coordenadas: string
  ruc: string
  razon_social: string
}

export interface PagoparItem {
  nombre: string
  cantidad: number
  precio_total: number
  ciudad: number
  descripcion: string
  url_imagen: string
  peso: string
  vendedor_telefono: string
  vendedor_direccion: string
  vendedor_direccion_referencia: string
  vendedor_direccion_coordenadas: string
  public_key: string
  categoria: number
  id_producto: number
  largo: string
  ancho: string
  alto: string
  comercio_comision: number
}

export interface PagoparTransactionParams {
  orderId: string
  totalAmount: number
  description: string
  buyer: PagoparBuyer
  items: PagoparItem[]
  maxPaymentDate?: string
}

export interface PagoparTransactionSuccess {
  ok: true
  hashPedido: string
  redirectUrl: string
}

export interface PagoparTransactionError {
  ok: false
  error: string
}

export type PagoparTransactionResult = PagoparTransactionSuccess | PagoparTransactionError

interface PagoparWebhookPayload {
  hash_pedido: string
  token: string
  pagado: boolean
  numero_pedido?: string
  forma_pago?: string
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

const API_BASE = 'https://api-plugins.pagopar.com/api'
const REDIRECT_BASE = 'https://www.pagopar.com/pagos'

function getKeys() {
  const publicKey = process.env.PAGOPAR_PUBLIC_KEY
  const privateKey = process.env.PAGOPAR_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    throw new Error('PAGOPAR_PUBLIC_KEY and PAGOPAR_PRIVATE_KEY must be set')
  }
  return { publicKey, privateKey }
}

function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex')
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

export function generateOrderToken(privateKey: string, orderId: string, totalAmount: number): string {
  return sha1(`${privateKey}${orderId}${totalAmount}`)
}

export function generateQueryToken(privateKey: string): string {
  return sha1(`${privateKey}CONSULTA`)
}

export function verifyWebhookToken(hashPedido: string, receivedToken: string): boolean {
  const { privateKey } = getKeys()
  const expected = sha1(`${privateKey}${hashPedido}`)
  return expected === receivedToken
}

// ---------------------------------------------------------------------------
// Parse webhook body
// ---------------------------------------------------------------------------

export function parseWebhookBody(body: unknown): PagoparWebhookPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const resultado = b.resultado
  if (!Array.isArray(resultado) || resultado.length === 0) return null
  const first = resultado[0] as Record<string, unknown>
  if (typeof first.hash_pedido !== 'string' || typeof first.token !== 'string') return null
  return {
    hash_pedido: first.hash_pedido,
    token: first.token,
    pagado: first.pagado === true,
    numero_pedido: typeof first.numero_pedido === 'string' ? first.numero_pedido : undefined,
    forma_pago: typeof first.forma_pago === 'string' ? first.forma_pago : undefined,
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

function buildMaxPaymentDate(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export async function createTransaction(
  params: PagoparTransactionParams,
): Promise<PagoparTransactionResult> {
  const { publicKey, privateKey } = getKeys()
  const token = generateOrderToken(privateKey, params.orderId, params.totalAmount)

  const body = {
    tipo_pedido: 'VENTA-COMERCIO',
    fecha_maxima_pago: params.maxPaymentDate ?? buildMaxPaymentDate(),
    public_key: publicKey,
    id_pedido_comercio: params.orderId,
    monto_total: params.totalAmount,
    token,
    descripcion_resumen: params.description,
    comprador: params.buyer,
    compras_items: params.items,
  }

  const res = await fetch(`${API_BASE}/comercios/2.0/iniciar-transaccion`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!data.respuesta) {
    return { ok: false, error: typeof data.resultado === 'string' ? data.resultado : 'Error al crear transacción en Pagopar' }
  }

  const hashPedido: string = data.resultado?.[0]?.data ?? data.resultado
  if (!hashPedido || typeof hashPedido !== 'string') {
    return { ok: false, error: 'Respuesta inesperada de Pagopar: hash no encontrado' }
  }

  return {
    ok: true,
    hashPedido,
    redirectUrl: `${REDIRECT_BASE}/${hashPedido}`,
  }
}

export async function queryOrderStatus(hashPedido: string) {
  const { publicKey, privateKey } = getKeys()
  const token = generateQueryToken(privateKey)

  const res = await fetch(`${API_BASE}/pedidos/1.1/traer`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hash_pedido: hashPedido,
      token,
      public_key: publicKey,
    }),
  })

  return res.json()
}
