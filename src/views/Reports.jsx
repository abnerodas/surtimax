import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, todayISO } from '../db'
import { useSettings, money, moneyShort, toCSV } from '../utils'
import { EmptyState, useToast, downloadFile } from '../ui'
import I from '../icons'

const RANGES = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'year', label: 'Este año' },
  { id: 'all', label: 'Todo' }
]

export default function Reports() {
  const toast = useToast()
  const { settings } = useSettings()
  const [range, setRange] = useState('month')

  const data = useLiveQuery(async () => {
    const [sales, saleItems, expenses] = await Promise.all([
      db.sales.toArray(),
      db.saleItems.toArray(),
      db.expenses.toArray()
    ])
    return { sales, saleItems, expenses }
  }, [])

  const r = useMemo(() => {
    if (!data) return null
    const { sales, saleItems, expenses } = data
    const today = todayISO()
    const start = (() => {
      const d = new Date()
      switch (range) {
        case 'today': return today
        case '7d': return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6).toISOString().slice(0, 10)
        case 'month': return today.slice(0, 8) + '01'
        case 'year': return String(d.getFullYear()) + '-01-01'
        default: return '0000-01-01'
      }
    })()

    const inRange = (dateStr) => String(dateStr).slice(0, 10) >= start
    const ss = sales.filter((s) => inRange(s.date))
    const es = expenses.filter((e) => inRange(e.date))

    const itemBySale = {}
    for (const it of saleItems) (itemBySale[it.saleId] = itemBySale[it.saleId] || []).push(it)

    const totalSales = ss.reduce((a, s) => a + s.total, 0)
    const totalCost = ss.reduce((a, s) => a + (itemBySale[s.id] || []).reduce((x, it) => x + (it.cost || 0) * it.qty, 0), 0)
    const profit = totalSales - totalCost
    const totalExpenses = es.reduce((a, e) => a + e.amount, 0)
    const balance = totalSales - totalExpenses
    const units = ss.reduce((a, s) => a + (itemBySale[s.id] || []).reduce((x, it) => x + it.qty, 0), 0)

    const byCat = {}
    for (const e of es) byCat[e.category] = (byCat[e.category] || 0) + e.amount
    const byMethod = {}
    for (const s of ss) byMethod[s.method] = (byMethod[s.method] || 0) + s.total

    const byDay = new Map()
    for (const s of ss) {
      const k = String(s.date).slice(0, 10)
      const e = byDay.get(k) || { inc: 0, exp: 0 }
      e.inc += s.total
      byDay.set(k, e)
    }
    for (const e of es) {
      const k = String(e.date).slice(0, 10)
      const x = byDay.get(k) || { inc: 0, exp: 0 }
      x.exp += e.amount
      byDay.set(k, x)
    }
    const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    const max = Math.max(1, ...days.map(([, v]) => Math.max(v.inc, v.exp)))
    const chart = days.map(([k, v]) => ({
      label: k.slice(5).replace('-', '/'),
      inc: Math.round((v.inc / max) * 100),
      exp: Math.round((v.exp / max) * 100),
      incV: v.inc,
      expV: v.exp
    }))

    return { totalSales, profit, totalExpenses, balance, units, byCat, byMethod, chart, ss, es }
  }, [data, range])

  if (!r) return <div className="muted">Calculando…</div>

  const exportSales = () => {
    const rows = r.ss.sort((a, b) => a.id - b.id).map((s) => [String(s.date).slice(0, 10), String(s.date).slice(11, 16), s.method, s.note, s.total.toFixed(2)])
    downloadFile('ventas-surtimax.csv', toCSV(['Fecha', 'Hora', 'Método', 'Nota', 'Total'], rows), 'text/csv')
    toast('CSV de ventas descargado')
  }

  const exportExpenses = () => {
    const rows = r.es.sort((a, b) => a.id - b.id).map((e) => [e.date, e.concept, e.category, e.note, e.amount.toFixed(2)])
    downloadFile('egresos-surtimax.csv', toCSV(['Fecha', 'Concepto', 'Categoría', 'Nota', 'Monto'], rows), 'text/csv')
    toast('CSV de egresos descargado')
  }

  return (
    <>
      <div className="filters">
        <div className="chips">
          {RANGES.map((x) => (
            <button key={x.id} className={'chip ' + (range === x.id ? 'active' : '')} onClick={() => setRange(x.id)}>{x.label}</button>
          ))}
        </div>
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={exportSales}>{I.download} Ventas CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={exportExpenses}>{I.download} Egresos CSV</button>
      </div>

      <div className="grid grid-4">
        <div className="card stat" style={{ '--stat-glow': 'rgba(16,185,129,0.14)' }}>
          <div className="stat-label">Ingresos</div>
          <div className="stat-value">{moneyShort(r.totalSales, settings)}</div>
          <div className="stat-foot">{r.ss.length} ventas · {r.units} unidades</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': 'rgba(56,189,248,0.14)' }}>
          <div className="stat-label">Utilidad bruta</div>
          <div className="stat-value">{moneyShort(r.profit, settings)}</div>
          <div className="stat-foot">Ingresos − costo de mercancía</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': 'rgba(244,63,94,0.14)' }}>
          <div className="stat-label">Egresos</div>
          <div className="stat-value">{moneyShort(r.totalExpenses, settings)}</div>
          <div className="stat-foot">{r.es.length} registros</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': r.balance >= 0 ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)' }}>
          <div className="stat-label">Balance neto</div>
          <div className="stat-value" style={{ color: r.balance >= 0 ? '#34d399' : '#fb7185' }}>{moneyShort(r.balance, settings)}</div>
          <div className="stat-foot">{r.balance >= 0 ? 'Ganancia neta del período' : 'Pérdida del período'}</div>
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <div className="card">
          <div className="card-title"><span>Ingresos vs egresos por día</span></div>
          {r.chart.length === 0 ? (
            <EmptyState icon={I.chart} title="Sin datos en el período" text="Registra ventas y egresos para ver el gráfico." />
          ) : (
            <>
              <div className="chart">
                {r.chart.map((c, i) => (
                  <div className="chart-col" key={i}>
                    <div className="chart-bars">
                      <div className="chart-bar inc" style={{ height: c.inc + '%' }} title={money(c.incV, settings)} />
                      <div className="chart-bar exp" style={{ height: c.exp + '%' }} title={money(c.expV, settings)} />
                    </div>
                    <div className="chart-label">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span><i className="legend-inc" /> Ingresos</span>
                <span><i className="legend-exp" /> Egresos</span>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title"><span>Egresos por categoría</span></div>
          {Object.keys(r.byCat).length === 0 ? (
            <EmptyState icon={I.wallet} title="Sin egresos" text="Los egresos del período se clasificarán aquí." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(r.byCat).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
                <div key={cat}>
                  <div className="flex between mb-16" style={{ marginBottom: 6 }}>
                    <span className="t-name" style={{ fontSize: 13 }}>{cat}</span>
                    <span className="money">{money(v, settings)}</span>
                  </div>
                  <div className="progress">
                    <i style={{ width: Math.round((v / Math.max(1, Math.max(...Object.values(r.byCat)))) * 100) + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2 mt-16">
        <div className="card">
          <div className="card-title"><span>Ventas por método de pago</span></div>
          {Object.keys(r.byMethod).length === 0 ? (
            <EmptyState icon={I.cash} title="Sin ventas" text="Las ventas del período se clasificarán aquí." />
          ) : (
            Object.entries(r.byMethod).map(([m, v]) => (
              <div className="list-row" key={m}>
                <div className="avatar" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>{I.cash}</div>
                <div className="grow"><div className="t-name" style={{ fontSize: 13.5 }}>{m}</div></div>
                <div className="money-strong">{money(v, settings)}</div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-title"><span>Resumen del período</span></div>
          <div className="cart-summary" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="cart-row"><span>Ingresos ({r.ss.length} ventas)</span><span className="money" style={{ color: '#34d399' }}>{money(r.totalSales, settings)}</span></div>
            <div className="cart-row"><span>Costo de mercancía vendida</span><span className="money">{money(r.totalSales - r.profit, settings)}</span></div>
            <div className="cart-row"><span>Utilidad bruta</span><span className="money" style={{ color: '#7dd3fc' }}>{money(r.profit, settings)}</span></div>
            <div className="cart-row"><span>Egresos operativos</span><span className="money" style={{ color: '#fb7185' }}>− {money(r.totalExpenses, settings)}</span></div>
            <div className="cart-row total"><span>Balance neto</span><span style={{ color: r.balance >= 0 ? '#34d399' : '#fb7185' }}>{money(r.balance, settings)}</span></div>
          </div>
        </div>
      </div>
    </>
  )
}