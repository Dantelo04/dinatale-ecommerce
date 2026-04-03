import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

/**
 * Atomically decrements stock and increments sales for a product.
 * Returns true if the update succeeded (stock was sufficient), false if not.
 * Safe under concurrent requests — no TOCTOU window.
 */
export async function atomicDecrementStock(
  payload: Payload,
  id: number,
  quantity: number,
): Promise<boolean> {
  const pool = (payload.db as unknown as PostgresAdapter).pool
  const result = await pool.query(
    'UPDATE products SET stock = stock - $1, sales = COALESCE(sales, 0) + $1 WHERE id = $2 AND stock >= $1 RETURNING id',
    [quantity, id],
  )
  return (result.rowCount ?? 0) === 1
}

/**
 * Atomically restores stock and decrements sales for a product.
 * Used when rolling back a previously-successful atomicDecrementStock call.
 */
export async function atomicRollbackStock(
  payload: Payload,
  id: number,
  quantity: number,
): Promise<void> {
  const pool = (payload.db as unknown as PostgresAdapter).pool
  await pool.query(
    'UPDATE products SET stock = stock + $1, sales = GREATEST(0, COALESCE(sales, 0) - $1) WHERE id = $2',
    [quantity, id],
  )
}
