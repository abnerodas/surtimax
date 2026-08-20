import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, openRegister, closeRegister } from '../db'
import { useSettings, money, fmtDateTime, fmtDate } from '../utils'
import { Modal, Field, Badge, EmptyState, useToast } from '../ui'
import I from '../icons'

export default function CashRegister() {
  const toast = useToast()
  const { settings } = useSettings()
  const [opening, setOpening] = useState('')
  const [counted, setCounted] = useState('')
  const [note, setNote] = useState('')
  const [confirmingClose, setConfirmingClose] = useState(false)
  const [prodQuery, setProdQuery] = useState('')

  const registers = useLiveQuery(() => db.registers.toArray(), [])
  const sales = useLiveQuery(() => db.sales.toArray(), [])
  const saleItems = useLiveQuery(() => db.saleItems.toArray(), [])
  const products = useLiveQuery(() => db.products.toArray(), [])

  const open = registers?.find((r) => r.status === 'open')
  const history = (registers || []).filter((r) => r.status === 'closed').sort((a, b) => b.id - a.id)

  const today = new Date().toISOString().slice(0, 10)
  const todaySales = (sales || []).filter((s) => String(s.date).slice(0, 10) === today).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  const todayIds = new Set(todaySales.map((s) => s.id))
  const todayItems = (saleItems || []).filter((it) => todayIds.has(it.saleId))
  const productsSoldToday = todayItems.reduce((a, it) => a + it.qty, 0)
  const cashToday = todaySales.filter((s) => s.method === 'Efectivo').reduce((a, s) => a + s.total, 0)
  const qrToday = todaySales.filter((s) => s.method !== 'Efectivo').reduce((a, s) => a + s.total, 0)

  const dateBySale = useMemo(() => {
    const m = new Map()
    for (const s of sales || []) m.set(s.id, s.date)
    return m
  }, [sales])

  const itemGroups = useMemo(() => {
    const g = new Map()
    for (const it of saleItems || []) {
      if (!g.has(it.productId)) g.set(it.productId, { totalQty: 0, perDate: new Map() })
      const entry = g.get(it.productId)
      entry.totalQty += it.qty
      const d = String(dateBySale.get(it.saleId) || '').slice(0, 10)
      entry.perDate.set(d, (entry.perDate.get(d) || 0) + it.qty)
    }
    return g
  }, [saleItems, dateBySale])

  const q = prodQuery.trim().toLowerCase()
  const productResults = (products || [])
    .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q))
    .map((p) => ({ product: p, info: itemGroups.get(p.id) }))
    .sort((a, b) => a.product.name.localeCompare(b.product.name))

  const summary = useMemo(() => {
    if (!open || !sales) return null
    const inOpen = (s) => String(s.date) >= open.openDate
    const cashSales = sales.filter((s) => s.method === 'Efectivo' && inOpen(s))
    const qrSales = sales.filter((s) => s.method !== 'Efectivo' && inOpen(s))
    const cashTotal = cashSales.reduce((a, s) => a + s.total, 0)
    const qrTotal = qrSales.reduce((a, s) => a + s.total, 0)
    return {
      cashCount: cashSales.length,
      cashTotal,
      qrCount: qrSales.length,
      qrTotal,
      expected: open.openingAmount + cashTotal
    }
  }, [open, sales])

  const doOpen = async () => {
    const amount = Number(opening) || 0
    if (amount < 0) return toast('El monto no puede ser negativo', 'error')
    await openRegister(amount)
    toast('Caja abierta — ¡buena venta!')
    setOpening('')
  }

  const doClose = async () => {
    const countedCash = Number(counted) || 0
    const difference = countedCash - summary.expected
    await closeRegister(open.id, { countedCash, difference, note: note.trim() })
    toast(difference === 0 ? 'Caja cerrada sin diferencias' : `Caja cerrada · diferencia ${difference > 0 ? '+' : ''}${money(difference, settings)}`)
    setConfirmingClose(false)
    setCounted('')
    setNote('')
  }

  const diff = (Number(counted) || 0) - (summary?.expected ?? 0)

  return (
    <>
      <div className="grid grid-2">
        {open && summary ? (
          <div className="card" style={{ borderColor: 'rgba(16,185,129,0.4)' }}>
            <div className="card-title">
              <span>Caja abierta</span>
              <Badge tone="green">Abierta</Badge>
            </div>
            <div className="cart-summary" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="cart-row"><span>Apertura</span><span className="muted">{fmtDateTime(open.openDate)}</span></div>
              <div className="cart-row"><span>Fondo inicial</span><span className="money">{money(open.openingAmount, settings)}</span></div>
              <div className="cart-row"><span>Ventas en efectivo ({summary.cashCount})</span><span className="money" style={{ color: '#34d399' }}>{money(summary.cashTotal, settings)}</span></div>
              <div className="cart-row"><span>Ventas por QR ({summary.qrCount})</span><span className="money" style={{ color: '#7dd3fc' }}>{money(summary.qrTotal, settings)}</span></div>
              <div className="cart-row total"><span>Efectivo esperado</span><span style={{ color: '#34d399' }}>{money(summary.expected, settings)}</span></div>
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} onClick={() => { setCounted(String(summary.expected)); setConfirmingClose(true) }}>
              Cerrar caja
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="card-title"><span>Abrir caja</span></div>
            <p className="hint mb-16" style={{ lineHeight: 1.6 }}>
              Indica el dinero con el que inicias la caja (fondo). Al cerrar, el sistema calculará el efectivo esperado según las ventas cobradas en efectivo.
            </p>
            <Field label="Fondo inicial en caja">
              <input className="input" type="number" step="0.01" min="0" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0.00" style={{ maxWidth: 220 }} />
            </Field>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={doOpen}>{I.cash} Abrir caja</button>
          </div>
        )}

        <div className="card">
          <div className="card-title"><span>Resumen de hoy</span></div>
          {(() => {
            return (
              <div className="cart-summary" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="cart-row"><span>Ventas en efectivo ({todaySales.filter((s) => s.method === 'Efectivo').length})</span><span className="money" style={{ color: '#34d399' }}>{money(cashToday, settings)}</span></div>
                <div className="cart-row"><span>Ventas por QR ({todaySales.filter((s) => s.method !== 'Efectivo').length})</span><span className="money" style={{ color: '#7dd3fc' }}>{money(qrToday, settings)}</span></div>
                <div className="cart-row"><span>Productos vendidos hoy</span><span className="money" style={{ color: '#fbbf24' }}>{productsSoldToday} unid.</span></div>
                <div className="cart-row total"><span>Total del día</span><span>{money(cashToday + qrToday, settings)}</span></div>
              </div>
            )
          })()}
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-title"><span>Ventas del día</span><Badge tone="gray">{todaySales.length} ventas · {productsSoldToday} productos</Badge></div>
        {todaySales.length === 0 ? (
          <EmptyState icon={I.cart} title="Sin ventas hoy" text="Las ventas que registres hoy aparecerán aquí con su detalle para cuadrar la caja." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hora</th><th>Método</th><th>Artículos</th><th className="t-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.map((s) => {
                  const items = (saleItems || []).filter((it) => it.saleId === s.id)
                  return (
                    <tr key={s.id}>
                      <td className="t-name">{fmtDateTime(s.date)}</td>
                      <td><Badge tone={s.method === 'Efectivo' ? 'green' : 'blue'}>{s.method}</Badge></td>
                      <td><div className="t-sub">{items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</div></td>
                      <td className="t-right money-strong">{money(s.total, settings)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="t-right"><b>Total del día</b></td>
                  <td className="t-right money-strong" style={{ color: '#34d399' }}>{money(cashToday + qrToday, settings)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-24">
        <div className="card-title"><span>Productos vendidos</span><Badge tone="gray">{productResults.length}</Badge></div>
        <div className="search mb-16">
          {I.search}
          <input className="input" placeholder="Buscar producto… (Ej: oreo)" value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} />
        </div>
        {productResults.length === 0 ? (
          <EmptyState icon={I.box} title="Sin resultados" text="Escribe el nombre de un producto para ver cuánto se ha vendido, en qué fechas y cuánto queda." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th className="t-right">Vendido en total</th><th>Fechas de venta</th><th className="t-right">Stock restante</th>
                </tr>
              </thead>
              <tbody>
                {productResults.map(({ product, info }) => (
                  <tr key={product.id}>
                    <td>
                      <div className="t-name">{product.name}</div>
                      {product.barcode && <div className="t-sub">Código: {product.barcode}</div>}
                    </td>
                    <td className="t-right money" style={{ color: '#7dd3fc' }}>{info ? `${info.totalQty} ${product.unit}` : '0'}</td>
                    <td>
                      {info && info.perDate.size > 0 ? (
                        <div className="t-sub">
                          {[...info.perDate.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, qty]) => `${qty} ${product.unit} · ${fmtDate(d)}`).join('  |  ')}
                        </div>
                      ) : (
                        <span className="muted">Sin ventas</span>
                      )}
                    </td>
                    <td className="t-right">
                      <Badge tone={product.stock === 0 ? 'red' : product.stock <= product.minStock ? 'amber' : 'green'}>{product.stock} {product.unit}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-24">
        <div className="card-title"><span>Historial de cierres</span><Badge tone="gray">{history.length}</Badge></div>
        {history.length === 0 ? (
          <EmptyState icon={I.cash} title="Sin cierres" text="Cada vez que cierres la caja, el registro aparecerá aquí para que puedas auditar." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Apertura</th><th>Cierre</th><th className="t-right">Fondo</th><th className="t-right">Esperado</th>
                  <th className="t-right">Contado</th><th className="t-right">Diferencia</th><th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id}>
                    <td className="t-name">{fmtDateTime(r.openDate)}</td>
                    <td className="t-name">{fmtDateTime(r.closeDate)}</td>
                    <td className="t-right money">{money(r.openingAmount, settings)}</td>
                    <td className="t-right money">{money(r.openingAmount + (r.countedCash - r.difference), settings)}</td>
                    <td className="t-right money-strong">{money(r.countedCash, settings)}</td>
                    <td className="t-right">
                      {r.difference === 0 ? <Badge tone="green">0.00</Badge> : r.difference > 0 ? <Badge tone="blue">+{money(r.difference, settings)}</Badge> : <Badge tone="red">{money(r.difference, settings)}</Badge>}
                    </td>
                    <td className="muted">{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmingClose && summary && (
        <Modal title="Cerrar caja" onClose={() => setConfirmingClose(false)}>
          <div className="cart-summary" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="cart-row"><span>Fondo inicial</span><span className="money">{money(open.openingAmount, settings)}</span></div>
            <div className="cart-row"><span>Ventas en efectivo</span><span className="money" style={{ color: '#34d399' }}>{money(summary.cashTotal, settings)}</span></div>
            <div className="cart-row total"><span>Efectivo esperado</span><span>{money(summary.expected, settings)}</span></div>
          </div>
          <div className="form-grid mt-16">
            <div className="full">
              <Field label="Dinero contado en caja">
                <input className="input" type="number" step="0.01" min="0" autoFocus value={counted} onChange={(e) => setCounted(e.target.value)} />
              </Field>
            </div>
            <div className="full">
              <Field label="Nota (opcional)">
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: pagos del día, gastos del propio cajero…" />
              </Field>
            </div>
          </div>
          <div className="cart-row total mt-16" style={{ borderTop: '1px solid var(--border-strong)', paddingTop: 14 }}>
            <span>Diferencia</span>
            <span style={{ color: diff === 0 ? '#34d399' : diff > 0 ? '#7dd3fc' : '#fb7185' }}>
              {diff === 0 ? 'Sin diferencias' : (diff > 0 ? '+' : '−') + money(Math.abs(diff), settings)}
            </span>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmingClose(false)}>Cancelar</button>
            <button className="btn btn-danger" onClick={doClose}>Cerrar caja</button>
          </div>
        </Modal>
      )}
    </>
  )
}