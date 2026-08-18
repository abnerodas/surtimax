import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, completeSale, deleteSale } from '../db'
import { useSettings, money, fmtDateTime } from '../utils'
import { PasswordModal, Badge, EmptyState, useToast } from '../ui'
import I from '../icons'

const METHODS = ['Efectivo', 'QR']

export default function Sales({ onlyList }) {
  const toast = useToast()
  const { settings } = useSettings()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [method, setMethod] = useState('Efectivo')
  const [note, setNote] = useState('')
  const [passAsk, setPassAsk] = useState(null)

  const products = useLiveQuery(() => db.products.toArray(), [])
  const sales = useLiveQuery(() => db.sales.toArray(), [])
  const saleItems = useLiveQuery(() => db.saleItems.toArray(), [])

  const addToCart = (p) => {
    const existing = cart.find((c) => c.productId === p.id)
    const inCart = existing?.qty || 0
    if (inCart >= p.stock) return toast('Stock insuficiente', 'error')
    if (existing) {
      setCart(cart.map((c) => (c.productId === p.id ? { ...c, qty: c.qty + 1 } : c)))
    } else {
      setCart([...cart, { productId: p.id, name: p.name, price: p.salePrice, cost: p.costPrice, qty: 1, stock: p.stock }])
    }
  }

  const setQty = (id, qty) => {
    const c = cart.find((x) => x.productId === id)
    if (!c) return
    const n = Math.max(1, Math.min(qty, c.stock))
    setCart(cart.map((x) => (x.productId === id ? { ...x, qty: n } : x)))
  }

  const total = cart.reduce((a, c) => a + c.price * c.qty, 0)
  const profit = cart.reduce((a, c) => a + (c.price - c.cost) * c.qty, 0)

  const doSale = async () => {
    if (cart.length === 0) return
    try {
      await completeSale({
        date: new Date().toISOString(),
        method,
        note: note.trim() || '',
        items: cart,
        total
      })
      toast('Venta registrada correctamente')
      setCart([])
      setNote('')
    } catch (err) {
      console.error(err)
      toast('Error al registrar la venta', 'error')
    }
  }

  const visible = (products || [])
    .filter((p) => {
      const q = search.trim().toLowerCase()
      return !q || p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q)
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const confirmDeleteSale = async (sale) => {
    try {
      await deleteSale(sale.id)
      toast('Venta eliminada y stock restaurado')
    } catch (err) {
      console.error(err)
      toast('Error al eliminar la venta', 'error')
    }
  }

  return (
    <>
      {!onlyList && (
        <div className="pos-grid">
          <div className="card">
            <div className="card-title">
              <span>Productos</span>
              <Badge tone="gray">{visible.length} disponibles</Badge>
            </div>
            <div className="search mb-16">
              {I.search}
              <input className="input" placeholder="Buscar por nombre o código de barras…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="product-pick">
              {visible.map((p) => (
                <button key={p.id} className="product-pick-btn" onClick={() => addToCart(p)} disabled={p.stock === 0}>
                  <span className="pick-name">{p.name}</span>
                  <span className="pick-price">{money(p.salePrice, settings)}</span>
                  <span className="pick-stock">Stock: {p.stock} {p.unit}</span>
                </button>
              ))}
              {visible.length === 0 && (
                <div className="empty" style={{ gridColumn: '1 / -1', padding: 30 }}>
                  <p>No hay productos que coincidan con la búsqueda.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <div className="card-title">
              <span>Venta actual</span>
              <Badge tone={cart.length ? 'green' : 'gray'}>{cart.length} artículo{cart.length !== 1 ? 's' : ''}</Badge>
            </div>
            {cart.length === 0 ? (
              <EmptyState icon={I.cart} title="Carrito vacío" text="Toca un producto para agregarlo a la venta." />
            ) : (
              <>
                {cart.map((c) => (
                  <div className="cart-item" key={c.productId}>
                    <div className="cart-info">
                      <div className="cart-name">{c.name}</div>
                      <div className="cart-line">
                        <div className="qty-stepper">
                          <button onClick={() => setQty(c.productId, c.qty - 1)}>-</button>
                          <input value={c.qty} onChange={(e) => setQty(c.productId, parseInt(e.target.value) || 1)} />
                          <button onClick={() => setQty(c.productId, c.qty + 1)}>+</button>
                        </div>
                        <input
                          className="input cart-price-input"
                          type="number" step="0.01"
                          value={c.price}
                          onChange={(e) => setCart(cart.map((x) => (x.productId === c.productId ? { ...x, price: Number(e.target.value) || 0 } : x)))}
                        />
                      </div>
                    </div>
                    <div className="cart-total money">{money(c.price * c.qty, settings)}</div>
                    <button className="cart-remove" onClick={() => setCart(cart.filter((x) => x.productId !== c.productId))}>{I.x}</button>
                  </div>
                ))}
                <div className="cart-summary">
                  <div className="cart-row"><span>Utilidad estimada</span><span style={{ color: '#34d399' }}>{money(profit, settings)}</span></div>
                  <div className="cart-row total"><span>Total</span><span>{money(total, settings)}</span></div>
                  <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
                    {METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <input className="input" placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }} onClick={doSale}>
                    {I.check} Cobrar {money(total, settings)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card mt-24">
        <div className="card-title">
          <span>Historial de ventas</span>
          <Badge tone="gray">{sales?.length ?? 0} ventas</Badge>
        </div>
        {!sales || sales.length === 0 ? (
          <EmptyState icon={I.cart} title="Sin ventas registradas" text="Las ventas que registres aparecerán aquí con su detalle." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Fecha</th><th>Método</th><th>Artículos</th>
                  <th className="t-right">Total</th><th className="t-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...sales].sort((a, b) => b.id - a.id).map((s) => {
                  const items = (saleItems || []).filter((it) => it.saleId === s.id)
                  return (
                    <tr key={s.id}>
                      <td className="t-name">#{String(s.id).padStart(4, '0')}</td>
                      <td className="t-name">{fmtDateTime(s.date)}</td>
                      <td><Badge tone={s.method === 'Efectivo' ? 'green' : s.method === 'QR' ? 'blue' : 'gray'}>{s.method}</Badge></td>
                      <td><div className="t-sub">{items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</div></td>
                      <td className="t-right money-strong">{money(s.total, settings)}</td>
                      <td>
                        <div className="t-actions">
                          <button className="btn btn-ghost btn-sm" style={{ color: '#fb7185' }} title="Eliminar (requiere contraseña)" onClick={() => setPassAsk({ onOk: () => confirmDeleteSale(s) })}>{I.trash}</button>
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

      {passAsk && (
        <PasswordModal
          title="Eliminar venta"
          hint="La venta se eliminará y el stock de sus productos será restaurado. Esta acción requiere la contraseña de seguridad."
          onSuccess={passAsk.onOk}
          onClose={() => setPassAsk(null)}
        />
      )}
    </>
  )
}