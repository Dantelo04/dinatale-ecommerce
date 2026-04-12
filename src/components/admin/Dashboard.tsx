import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ORDER_STATUS_LABELS } from '@/lib/types'

import './Dashboard.scss'

const Dashboard: React.FC = async () => {
  const payload = await getPayload({ config: await config })

  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  const currencySymbol = settings.currencySymbol || '$'

  const [allProducts, activeCount, categories, recentOrders, orderCount] = await Promise.all([
    payload.find({
      collection: 'products',
      limit: 0,
      depth: 1,
      overrideAccess: true,
    }),
    payload.count({
      collection: 'products',
      where: { active: { equals: true } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'categories',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'orders',
      limit: 10,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    }),
    payload.count({
      collection: 'orders',
      overrideAccess: true,
    }),
  ])

  const products = allProducts.docs
  const totalSales = products.reduce((sum, p) => sum + (p.sales ?? 0), 0)
  const totalViews = products.reduce((sum, p) => sum + (p.views ?? 0), 0)
  const estimatedRevenue = products.reduce((sum, p) => sum + (p.sales ?? 0) * p.price, 0)
  const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : '0.0'

  const topBySales = [...products].sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 5)
  const topByViews = [...products].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5)

  const categoryMap = new Map(categories.docs.map((c) => [c.id, c.name]))
  const categoryStats: Record<number, { name: string; count: number; sales: number }> = {}
  for (const product of products) {
    const cats = Array.isArray(product.category) ? product.category : []
    for (const cat of cats) {
      const catId = typeof cat === 'number' ? cat : cat.id
      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          name: categoryMap.get(catId) ?? `Categoria ${catId}`,
          count: 0,
          sales: 0,
        }
      }
      categoryStats[catId].count++
      categoryStats[catId].sales += product.sales ?? 0
    }
  }
  const categoryStatsArray = Object.values(categoryStats).sort((a, b) => b.sales - a.sales)

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`

  return (
    <div className="kpi-dashboard">
      <p className="kpi-dashboard__section-title">Resumen General</p>

      <div className="kpi-dashboard__cards">
        <div className="kpi-card">
          <span className="kpi-card__label">Ventas Totales</span>
          <span className="kpi-card__value">{totalSales.toLocaleString('es-AR')}</span>
          <span className="kpi-card__sub">unidades vendidas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Ingresos Estimados</span>
          <span className="kpi-card__value">{fmt(estimatedRevenue)}</span>
          <span className="kpi-card__sub">precio actual x ventas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Visitas Totales</span>
          <span className="kpi-card__value">{totalViews.toLocaleString('es-AR')}</span>
          <span className="kpi-card__sub">vistas a productos</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Productos Activos</span>
          <span className="kpi-card__value">{activeCount.totalDocs}</span>
          <span className="kpi-card__sub">de {products.length} totales</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Tasa de Conversión</span>
          <span className="kpi-card__value">{conversionRate}%</span>
          <span className="kpi-card__sub">visitas a ventas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-card__label">Pedidos Totales</span>
          <span className="kpi-card__value">{orderCount.totalDocs}</span>
          <span className="kpi-card__sub">pedidos por WhatsApp</span>
        </div>
      </div>

      <div className="kpi-dashboard__tables">
        <div className="kpi-table">
          <h3 className="kpi-table__title">Top 5 por Ventas</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Ventas</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topBySales.map((p) => (
                <tr key={p.id}>
                  <td title={p.name}>{p.name}</td>
                  <td>{(p.sales ?? 0).toLocaleString('es-AR')}</td>
                  <td>{fmt((p.sales ?? 0) * p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kpi-table">
          <h3 className="kpi-table__title">Top 5 por Visitas</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Visitas</th>
                <th>Conversión</th>
              </tr>
            </thead>
            <tbody>
              {topByViews.map((p) => (
                <tr key={p.id}>
                  <td title={p.name}>{p.name}</td>
                  <td>{(p.views ?? 0).toLocaleString('es-AR')}</td>
                  <td>
                    {(p.views ?? 0) > 0
                      ? (((p.sales ?? 0) / (p.views ?? 1)) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="kpi-dashboard__tables">
        <div className="kpi-table">
          <h3 className="kpi-table__title">Productos por Categoría</h3>
          {categoryStatsArray.length === 0 ? (
            <p className="kpi-table__empty">Sin categorías asignadas</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Productos</th>
                  <th>Ventas</th>
                </tr>
              </thead>
              <tbody>
                {categoryStatsArray.map((c) => (
                  <tr key={c.name}>
                    <td title={c.name}>{c.name}</td>
                    <td>{c.count}</td>
                    <td>{c.sales.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="kpi-table">
          <h3 className="kpi-table__title">Pedidos Recientes</h3>
          {recentOrders.docs.length === 0 ? (
            <p className="kpi-table__empty">Sin pedidos aún</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Estado</th>
                  <th>Unidades</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.docs.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.status ? ORDER_STATUS_LABELS[o.status] : '—'}</td>
                    <td>{o.totalItems}</td>
                    <td>{fmt(o.totalAmount)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
