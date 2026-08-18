import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, daysUntil } from '../db'
import { useSettings, money, fmtDate } from '../utils'
import { Modal, PasswordModal, Field, EmptyState, Badge, useToast } from '../ui'
import I from '../icons'

const emptyProduct = { name: '', categoryId: null, barcode: '', costPrice: '', salePrice: '', stock: 0, minStock: 0, expiryDate: '', unit: 'und' }

export default function Inventory() {
  const toast = useToast()
  const { settings } = useSettings()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [adjusting, setAdjusting] = useState(null)
  const [adjustDelta, setAdjustDelta] = useState(1)
  const [passAsk, setPassAsk] = useState(null)

  const products = useLiveQuery(() => db.products.toArray(), [])
  const categories = useLiveQuery(() => db.categories.toArray(), [])

  useEffect(() => {
    const onNew = () => {
      const c = categories?.[0]?.id ?? null
      setEditing({ ...emptyProduct, categoryId: c })
    }
    window.addEventListener('inventario:nuevo', onNew)
    return () => window.removeEventListener('inventario:nuevo', onNew)
  }, [categories])

  const filtered = (products || []).filter((p) => {
    const q = search.trim().toLowerCase()
    const okQ = !q || p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q)
    const okC = catFilter === 'all' || p.categoryId === Number(catFilter)
    return okQ && okC
  }).sort((a, b) => a.name.localeCompare(b.name))

  const openNew = () => setEditing({ ...emptyProduct, categoryId: categories?.[0]?.id ?? null })
  const openEdit = (p) => setEditing({ ...p, costPrice: p.costPrice, salePrice: p.salePrice })

  const save = async (e) => {
    e.preventDefault()
    const f = editing
    const data = {
      name: f.name.trim(),
      categoryId: f.categoryId || null,
      barcode: (f.barcode || '').trim(),
      costPrice: Number(f.costPrice) || 0,
      salePrice: Number(f.salePrice) || 0,
      stock: Number(f.stock) || 0,
      minStock: Number(f.minStock) || 0,
      expiryDate: f.expiryDate || '',
      unit: f.unit || 'und'
    }
    if (!data.name) return toast('El nombre es obligatorio', 'error')
    if (f.id) {
      const prev = await db.products.get(f.id)
      const doSave = async () => {
        await db.products.update(f.id, data)
        toast('Producto actualizado')
        setEditing(null)
      }
      if (data.stock < (prev?.stock ?? 0)) askPass('Bajar stock', doSave)
      else doSave()
    } else {
      await db.products.add(data)
      toast('Producto agregado al inventario')
    }
    setEditing(null)
  }

  const askPass = (title, onOk) => setPassAsk({ title, onOk })

  const deleteProduct = async (p) => {
    await db.products.delete(p.id)
    toast('Producto eliminado')
  }

  const applyAdjust = () => {
    const delta = Number(adjustDelta)
    if (!delta) return
    const p = adjusting
    const doAdjust = async () => {
      await db.products.update(p.id, { stock: Math.max(0, p.stock + delta) })
      toast(delta > 0 ? `+${delta} unidades a ${p.name}` : `${delta} unidades a ${p.name}`)
      setAdjusting(null)
    }
    if (delta < 0) askPass('Restar stock', doAdjust)
    else doAdjust()
  }

  const stockTone = (p) => {
    if (p.stock === 0) return 'red'
    if (p.stock <= p.minStock) return 'amber'
    return 'green'
  }

  return (
    <>
      <div className="filters">
        <div className="search">
          {I.search}
          <input className="input" placeholder="Buscar producto o código…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 190 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openNew}>{I.plus} Nuevo producto</button>
      </div>

      <div className="card">
        {(!products || products.length === 0) ? (
          <EmptyState icon={I.box} title="Inventario vacío" text="Agrega tu primer producto para comenzar a controlar tu tienda." />
        ) : filtered.length === 0 ? (
          <EmptyState icon={I.search} title="Sin resultados" text="No se encontraron productos con ese criterio." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th>Categoría</th><th className="t-right">Costo</th><th className="t-right">Precio</th>
                  <th className="t-right">Stock</th><th>Vencimiento</th><th className="t-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cat = categories?.find((c) => c.id === p.categoryId)
                  const d = p.expiryDate ? daysUntil(p.expiryDate) : null
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="t-name">{p.name}</div>
                        {p.barcode && <div className="t-sub">Código: {p.barcode}</div>}
                      </td>
                      <td>{cat ? <Badge tone="gray">{cat.name}</Badge> : <span className="muted">—</span>}</td>
                      <td className="t-right money">{money(p.costPrice, settings)}</td>
                      <td className="t-right money-strong" style={{ color: '#34d399' }}>{money(p.salePrice, settings)}</td>
                      <td className="t-right">
                        <Badge tone={stockTone(p)}>{p.stock} {p.unit}</Badge>
                      </td>
                      <td>
                        {d === null ? <span className="muted">—</span> : d < 0 ? <Badge tone="red">Vencido · {fmtDate(p.expiryDate)}</Badge> : d <= (settings.warnDays || 30) ? <Badge tone="amber">{d === 0 ? 'Vence hoy' : d + ' días'} · {fmtDate(p.expiryDate)}</Badge> : <Badge tone="blue">{fmtDate(p.expiryDate)}</Badge>}
                      </td>
                      <td>
                        <div className="t-actions">
                          <button className="btn btn-ghost btn-sm" title="Ajustar stock" onClick={() => { setAdjusting(p); setAdjustDelta(1) }}>{I.refresh} Stock</button>
                          <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => openEdit(p)}>{I.edit}</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: '#fb7185' }} title="Eliminar (requiere contraseña)" onClick={() => askPass('Eliminar producto', () => deleteProduct(p))}>{I.trash}</button>
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

      {editing && (
        <Modal title={editing.id ? 'Editar producto' : 'Nuevo producto'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="full">
                <Field label="Nombre del producto">
                  <input className="input" autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ej: Arroz 1kg" />
                </Field>
              </div>
              <Field label="Categoría">
                <select className="select" value={editing.categoryId ?? ''} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Sin categoría</option>
                  {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Unidad">
                <select className="select" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })}>
                  {['und', 'kg', 'g', 'lt', 'ml', 'doc', 'caja', 'paq'].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Código de barras (opcional)">
                <input className="input" value={editing.barcode} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })} placeholder="0000000000000" />
              </Field>
              <Field label="Fecha de vencimiento (opcional)">
                <input className="input" type="date" value={editing.expiryDate} onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })} />
              </Field>
              <Field label="Precio de costo">
                <input className="input" type="number" step="0.01" min="0" value={editing.costPrice} onChange={(e) => setEditing({ ...editing, costPrice: e.target.value })} />
              </Field>
              <Field label="Precio de venta">
                <input className="input" type="number" step="0.01" min="0" value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} />
              </Field>
              <Field label="Stock actual">
                <input className="input" type="number" step="1" min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
              </Field>
              <Field label="Stock mínimo (alerta)">
                <input className="input" type="number" step="1" min="0" value={editing.minStock} onChange={(e) => setEditing({ ...editing, minStock: e.target.value })} />
              </Field>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{I.save} Guardar producto</button>
            </div>
          </form>
        </Modal>
      )}

      {adjusting && (
        <Modal title={`Ajustar stock · ${adjusting.name}`} onClose={() => setAdjusting(null)}>
          <p className="hint" style={{ marginBottom: 14 }}>Stock actual: <b className="money" style={{ color: '#34d399' }}>{adjusting.stock} {adjusting.unit}</b></p>
          <div className="flex" style={{ alignItems: 'flex-end' }}>
            <Field label="Cantidad (positiva = entrada, negativa = salida)">
              <input className="input" type="number" step="1" autoFocus value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} style={{ width: 160 }} />
            </Field>
          </div>
          {Number(adjustDelta) < 0 && (
            <p className="hint" style={{ marginTop: 10, color: '#fbbf24' }}>{I.lock} Las salidas de stock requieren la contraseña de seguridad.</p>
          )}
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setAdjusting(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={applyAdjust} disabled={!Number(adjustDelta)}>Aplicar</button>
          </div>
        </Modal>
      )}

      {passAsk && (
        <PasswordModal
          title={passAsk.title}
          hint={passAsk.title === 'Eliminar producto' ? 'Se eliminará este producto del inventario. Esta acción requiere la contraseña de seguridad.' : 'Las salidas de stock requieren la contraseña de seguridad.'}
          onSuccess={passAsk.onOk}
          onClose={() => setPassAsk(null)}
        />
      )}
    </>
  )
}