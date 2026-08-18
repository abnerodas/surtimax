import { useLiveQuery } from 'dexie-react-hooks'
import { db, todayISO, daysUntil } from '../db'
import { useSettings, money, moneyShort, fmtDate, fmtDateTime, hashColor } from '../utils'
import { StatCard, Badge, EmptyState } from '../ui'
import I from '../icons'

export default function Dashboard({ go }) {
  const { settings } = useSettings()
  const today = todayISO()

  const data = useLiveQuery(async () => {
    const [products, sales, saleItems, expenses] = await Promise.all([
      db.products.toArray(),
      db.sales.toArray(),
      db.saleItems.toArray(),
      db.expenses.toArray()
    ])
    return { products, sales, saleItems, expenses }
  }, [])

  if (!data) return <div className="muted">Cargando…</div>
  const { products, sales, saleItems, expenses } = data

  const expToday = expenses.filter((e) => String(e.date).slice(0, 10) === today)
  const salesTodaySimple = sales.filter((s) => String(s.date).slice(0, 10) === today)
  const ventasHoy = salesTodaySimple.reduce((a, s) => a + s.total, 0)
  const egresosHoy = expToday.reduce((a, e) => a + e.amount, 0)

  const itemCost = {}
  for (const it of saleItems) itemCost[it.saleId + '|' + it.productId] = it.cost ?? 0
  const utilidadHoy = salesTodaySimple.reduce((a, s) => a + s.total, 0) -
    salesTodaySimple.reduce((a, s) => a + saleItems.filter((it) => it.saleId === s.id).reduce((x, it) => x + (it.cost ?? 0) * it.qty, 0), 0)

  const withExpiry = products.filter((p) => p.expiryDate)
  const expired = withExpiry.filter((p) => daysUntil(p.expiryDate) < 0)
  const expiringSoon = withExpiry.filter((p) => daysUntil(p.expiryDate) >= 0 && daysUntil(p.expiryDate) <= (settings.warnDays || 30))
  const lowStock = products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock).slice(0, 6)

  const monthStart = today.slice(0, 8) + '01'
  const salesMonth = sales.filter((s) => String(s.date).slice(0, 10) >= monthStart)
  const topMap = new Map()
  for (const s of salesMonth) {
    for (const it of saleItems.filter((x) => x.saleId === s.id)) {
      topMap.set(it.productId, (topMap.get(it.productId) || 0) + it.qty)
    }
  }
  const topProducts = [...topMap.entries()]
    .map(([pid, qty]) => ({ product: products.find((p) => p.id === pid), qty }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const lastSales = [...sales].sort((a, b) => b.id - a.id).slice(0, 6)
  const lastExpenses = [...expenses].sort((a, b) => b.id - a.id).slice(0, 6)
  const alerts = expired.length + expiringSoon.length + lowStock.length

  return (
    <>
      <div className="grid grid-4">
        <StatCard label="Ventas hoy" value={moneyShort(ventasHoy, settings)} foot={salesTodaySimple.length + ' ventas registradas'} icon={I.cart} tone="green" />
        <StatCard label="Utilidad hoy" value={moneyShort(utilidadHoy, settings)} foot="Estimada (precio − costo)" icon={I.trendUp} tone="blue" />
        <StatCard label="Egresos hoy" value={moneyShort(egresosHoy, settings)} foot={expToday.length + ' gastos registrados'} icon={I.wallet} tone="red" />
        <StatCard label="Por vencer" value={expired.length + expiringSoon.length} foot={expired.length ? expired.length + ' ya vencidos' : 'Todo en orden'} icon={I.alarm} tone={alerts ? 'amber' : 'green'} />
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <span>Últimas ventas</span>
            <button className="btn btn-ghost btn-sm" onClick={() => go('ventas')}>Ver todas {I.arrow}</button>
          </div>
          {lastSales.length === 0 ? (
            <EmptyState icon={I.cart} title="Sin ventas aún" text="Registra tu primera venta desde la sección Vender." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Fecha</th><th>Método</th><th className="t-right">Total</th></tr></thead>
                <tbody>
                  {lastSales.map((s) => (
                    <tr key={s.id}>
                      <td className="t-name">{fmtDateTime(s.date)}</td>
                      <td><Badge tone={s.method === 'Efectivo' ? 'green' : s.method === 'Tarjeta' ? 'blue' : 'gray'}>{s.method}</Badge></td>
                      <td className="t-right money">{money(s.total, settings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">
            <span>Últimos egresos</span>
            <button className="btn btn-ghost btn-sm" onClick={() => go('egresos')}>Ver todos {I.arrow}</button>
          </div>
          {lastExpenses.length === 0 ? (
            <EmptyState icon={I.wallet} title="Sin gastos" text="Los egresos que registres aparecerán aquí." />
          ) : (
            lastExpenses.map((e) => (
              <div className="list-row" key={e.id}>
                <div className="avatar" style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185' }}>{I.wallet}</div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="t-name" style={{ fontSize: 13.5 }}>{e.concept}</div>
                  <div className="t-sub">{fmtDate(String(e.date).slice(0, 10))} · {e.category}</div>
                </div>
                <div className="money-strong right" style={{ color: '#fb7185' }}>{money(e.amount, settings)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-3 mt-16">
        <div className="card">
          <div className="card-title"><span>Top productos del mes</span></div>
          {topProducts.length === 0 ? (
            <EmptyState icon={I.box} title="Sin datos" text="Las ventas de este mes mostrarán los productos más vendidos." />
          ) : (
            topProducts.map((t, i) => {
              const [color, bg] = hashColor(t.product.name)
              return (
                <div className="list-row" key={t.product.id}>
                  <div className="avatar" style={{ background: bg, color }}>{i + 1}</div>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="t-name" style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.product.name}</div>
                    <div className="t-sub">{t.product.stock} en stock</div>
                  </div>
                  <div className="money-strong">{t.qty} und</div>
                </div>
              )
            })
          )}
        </div>

        <div className="card">
          <div className="card-title">
            <span>Stock bajo</span>
            <button className="btn btn-ghost btn-sm" onClick={() => go('inventario')}>Ir {I.arrow}</button>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState icon={I.check} title="Todo en orden" text="No hay productos por debajo de su stock mínimo." />
          ) : (
            lowStock.map((p) => (
              <div className="list-row" key={p.id}>
                <div className="avatar" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>{I.box}</div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="t-name" style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div className="t-sub">Mínimo: {p.minStock}</div>
                </div>
                <Badge tone="amber">{p.stock} und</Badge>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title">
            <span>Vencimientos</span>
            <button className="btn btn-ghost btn-sm" onClick={() => go('vencimientos')}>Ver {I.arrow}</button>
          </div>
          {expired.length + expiringSoon.length === 0 ? (
            <EmptyState icon={I.check} title="Sin alertas" text="No hay productos vencidos ni próximos a vencer." />
          ) : (
            [...expired, ...expiringSoon].slice(0, 6).map((p) => {
              const d = daysUntil(p.expiryDate)
              return (
                <div className="list-row" key={p.id}>
                  <div className="avatar" style={{ background: d < 0 ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)', color: d < 0 ? '#fb7185' : '#fbbf24' }}>{I.alarm}</div>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="t-name" style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div className="t-sub">Vence {fmtDate(p.expiryDate)}</div>
                  </div>
                  <Badge tone={d < 0 ? 'red' : d <= 7 ? 'amber' : 'blue'}>
                    {d < 0 ? 'Vencido' : d === 0 ? 'Hoy' : d + ' días'}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}