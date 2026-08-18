import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, todayISO } from '../db'
import { useSettings, money, fmtDate, toCSV } from '../utils'
import { Modal, Confirm, Field, Badge, EmptyState, useToast, downloadFile } from '../ui'
import I from '../icons'

const EXP_CATEGORIES = ['Mercancía', 'Servicios', 'Personal', 'Impuestos', 'Transporte', 'Otros']
const TONES = { 'Mercancía': 'blue', 'Servicios': 'green', 'Personal': 'amber', 'Impuestos': 'red', 'Transporte': 'gray', 'Otros': 'gray' }

export default function Expenses() {
  const toast = useToast()
  const { settings } = useSettings()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('all')

  const expenses = useLiveQuery(() => db.expenses.toArray(), [])

  const list = (expenses || [])
    .filter((e) => filter === 'all' || e.category === filter)
    .sort((a, b) => b.id - a.id)

  const total = list.reduce((a, e) => a + e.amount, 0)
  const monthTotal = (expenses || [])
    .filter((e) => String(e.date).slice(0, 7) === todayISO().slice(0, 7))
    .reduce((a, e) => a + e.amount, 0)

  const save = async (e) => {
    e.preventDefault()
    const f = editing
    const data = {
      date: f.date || todayISO(),
      concept: f.concept.trim(),
      category: f.category,
      amount: Number(f.amount) || 0,
      note: (f.note || '').trim()
    }
    if (!data.concept) return toast('El concepto es obligatorio', 'error')
    if (data.amount <= 0) return toast('El monto debe ser mayor a cero', 'error')
    if (f.id) {
      await db.expenses.update(f.id, data)
      toast('Egreso actualizado')
    } else {
      await db.expenses.add(data)
      toast('Egreso registrado')
    }
    setEditing(null)
  }

  const exportCSV = () => {
    const rows = list.map((e) => [e.date, e.concept, e.category, e.amount.toFixed(2), e.note])
    downloadFile('egresos-surtimax.csv', toCSV(['Fecha', 'Concepto', 'Categoría', 'Monto', 'Nota'], rows), 'text/csv')
    toast('CSV descargado')
  }

  return (
    <>
      <div className="grid grid-3 mb-16">
        <div className="card stat" style={{ '--stat-glow': 'rgba(244,63,94,0.14)' }}>
          <div className="stat-label">Egresos este mes</div>
          <div className="stat-value">{money(monthTotal, settings)}</div>
        </div>
        <div className="card stat" style={{ '--stat-glow': 'rgba(244,63,94,0.14)' }}>
          <div className="stat-label">Egresos del filtro</div>
          <div className="stat-value">{money(total, settings)}</div>
          <div className="stat-foot">{list.length} registros</div>
        </div>
        <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setEditing({ concept: '', category: EXP_CATEGORIES[0], amount: '', date: todayISO(), note: '' })}>
            {I.plus} Registrar egreso
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="chips">
          <button className={'chip ' + (filter === 'all' ? 'active' : '')} onClick={() => setFilter('all')}>Todos</button>
          {EXP_CATEGORIES.map((c) => (
            <button key={c} className={'chip ' + (filter === c ? 'active' : '')} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>{I.download} Exportar CSV</button>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <EmptyState icon={I.wallet} title="Sin egresos" text="Registra gastos como servicios, personal, mercancía o impuestos." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Nota</th>
                  <th className="t-right">Monto</th><th className="t-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id}>
                    <td className="t-name">{fmtDate(e.date)}</td>
                    <td className="t-name">{e.concept}</td>
                    <td><Badge tone={TONES[e.category] || 'gray'}>{e.category}</Badge></td>
                    <td className="muted">{e.note || '—'}</td>
                    <td className="t-right money-strong" style={{ color: '#fb7185' }}>{money(e.amount, settings)}</td>
                    <td>
                      <div className="t-actions">
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => setEditing({ ...e })}>{I.edit}</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#fb7185' }} title="Eliminar" onClick={() => setDeleting(e)}>{I.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Editar egreso' : 'Registrar egreso'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="full">
                <Field label="Concepto">
                  <input className="input" autoFocus value={editing.concept} onChange={(e) => setEditing({ ...editing, concept: e.target.value })} placeholder="Ej: Pago de luz, compra de refrescos…" />
                </Field>
              </div>
              <Field label="Categoría">
                <select className="select" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {EXP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Monto">
                <input className="input" type="number" step="0.01" min="0" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: e.target.value })} />
              </Field>
              <Field label="Fecha">
                <input className="input" type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
              </Field>
              <Field label="Nota (opcional)">
                <input className="input" value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
              </Field>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{I.save} Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Confirm
          danger
          title="Eliminar egreso"
          message={`¿Eliminar el egreso "${deleting.concept}" por ${money(deleting.amount, settings)}?`}
          onConfirm={async () => { await db.expenses.delete(deleting.id); toast('Egreso eliminado') }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  )
}