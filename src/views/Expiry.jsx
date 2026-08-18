import { useLiveQuery } from 'dexie-react-hooks'
import { db, daysUntil } from '../db'
import { useSettings, fmtDate } from '../utils'
import { Badge, EmptyState, useToast } from '../ui'
import I from '../icons'

export default function Expiry() {
  const toast = useToast()
  const { settings } = useSettings()
  const products = useLiveQuery(() => db.products.toArray(), [])
  const warnDays = settings.warnDays || 30

  const withExpiry = (products || []).filter((p) => p.expiryDate)
  const byDays = (days) => withExpiry.filter((p) => {
    const d = daysUntil(p.expiryDate)
    if (days === 'expired') return d < 0
    if (days === 'soon') return d >= 0 && d <= warnDays
    return d > warnDays
  }).sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))

  const expired = byDays('expired')
  const soon = byDays('soon')
  const ok = byDays('ok')

  const discard = async (p) => {
    await db.products.update(p.id, { stock: 0 })
    toast(`${p.name} marcado sin stock`)
  }

  const Section = ({ title, items, tone, emptyText }) => (
    <div className="card mt-16">
      <div className="card-title">
        <span>{title}</span>
        <Badge tone={tone}>{items.length} producto{items.length !== 1 ? 's' : ''}</Badge>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={I.check} title="Nada por aquí" text={emptyText} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th><th className="t-right">Stock</th><th>Vence el</th><th>Estado</th><th className="t-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const d = daysUntil(p.expiryDate)
                return (
                  <tr key={p.id}>
                    <td className="t-name">{p.name}</td>
                    <td className="t-right money">{p.stock} {p.unit}</td>
                    <td className="t-name">{fmtDate(p.expiryDate)}</td>
                    <td>
                      {d < 0
                        ? <Badge tone="red">Vencido hace {Math.abs(d)} día{Math.abs(d) !== 1 ? 's' : ''}</Badge>
                        : d === 0 ? <Badge tone="amber">Vence hoy</Badge>
                        : d <= 7 ? <Badge tone="amber">En {d} día{d !== 1 ? 's' : ''}</Badge>
                        : <Badge tone="blue">En {d} días</Badge>}
                    </td>
                    <td>
                      <div className="t-actions">
                        <button className="btn btn-ghost btn-sm" style={{ color: '#fb7185' }} onClick={() => discard(p)} title="Marcar sin stock">Descartar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="grid grid-3">
        <div className="card stat" style={{ '--stat-glow': 'rgba(244,63,94,0.14)' }}>
          <div className="stat-label">Vencidos</div>
          <div className="stat-value" style={{ color: '#fb7185' }}>{expired.length}</div>
          <div className="stat-foot">{expired.reduce((a, p) => a + p.stock, 0)} unidades en riesgo</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': 'rgba(245,158,11,0.14)' }}>
          <div className="stat-label">Próximos a vencer ({warnDays} días)</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{soon.length}</div>
          <div className="stat-foot">{soon.reduce((a, p) => a + p.stock, 0)} unidades por mover</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': 'rgba(16,185,129,0.14)' }}>
          <div className="stat-label">Vigentes</div>
          <div className="stat-value" style={{ color: '#34d399' }}>{ok.length}</div>
          <div className="stat-foot">Sin riesgo de vencimiento</div>
        </div>
      </div>

      <Section title="Vencidos" items={expired} tone="red" emptyText="No hay productos vencidos." />
      <Section title={`Próximos a vencer (${warnDays} días)`} items={soon} tone="amber" emptyText="No hay productos próximos a vencer." />
      <Section title="Vigentes" items={ok} tone="blue" emptyText="Sin productos con fecha de vencimiento registrada." />
    </>
  )
}