import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, resetAll, seedCatalog, resetAndSeed } from '../db'
import { useSettings } from '../utils'
import { Confirm, Field, Badge, EmptyState, useToast, downloadFile } from '../ui'
import I from '../icons'

const CURRENCIES = ['Bs.', '$', 'S/', 'C$', '₡', 'Q', 'L', 'RD$', '₲', 'B/.', '€']

export default function Settings() {
  const toast = useToast()
  const { settings, update } = useSettings()
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [catToDelete, setCatToDelete] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const fileRef = useRef(null)

  const categories = useLiveQuery(() => db.categories.toArray(), [])
  const products = useLiveQuery(() => db.products.toArray(), [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    await update({
      storeName: e.target.storeName.value.trim(),
      currency: e.target.currency.value,
      warnDays: Number(e.target.warnDays.value) || 30,
      autoCatalog: e.target.autoCatalog.checked
    })
    setSaving(false)
    toast('Configuración guardada')
  }

  const changePass = async (e) => {
    e.preventDefault()
    const current = e.target.currentPass.value
    const nueva = e.target.newPass.value.trim()
    const confirm = e.target.newPass2.value.trim()
    if (current !== settings.password) return toast('La contraseña actual no es correcta', 'error')
    if (nueva !== confirm) return toast('Las contraseñas nuevas no coinciden', 'error')
    setChanging(true)
    await update({ password: nueva })
    setChanging(false)
    e.target.reset()
    toast(nueva ? 'Contraseña cambiada correctamente' : 'Protección desactivada')
  }

  const addCategory = async () => {
    const name = newCat.trim()
    if (!name) return
    if ((categories || []).some((c) => c.name.toLowerCase() === name.toLowerCase())) return toast('La categoría ya existe', 'error')
    await db.categories.add({ name })
    setNewCat('')
    toast('Categoría creada')
  }

  const exportBackup = async () => {
    const [cats, prods, sales, items, exps, sst] = await Promise.all([
      db.categories.toArray(),
      db.products.toArray(),
      db.sales.toArray(),
      db.saleItems.toArray(),
      db.expenses.toArray(),
      db.settings.toArray()
    ])
    const backup = { app: 'surtimax', version: 1, exportedAt: new Date().toISOString(), categories: cats, products: prods, sales, saleItems: items, expenses: exps, settings: sst.filter((r) => r.key !== 'password') }
    downloadFile('respaldo-surtimax-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(backup, null, 2), 'application/json')
    toast('Respaldo descargado')
  }

  const importBackup = (file) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.app !== 'surtimax') throw new Error('archivo inválido')
        const currentPassword = (await db.settings.toArray()).find((r) => r.key === 'password')?.value
        await db.transaction('rw', db.categories, db.products, db.sales, db.saleItems, db.expenses, db.settings, async () => {
          await Promise.all([
            db.categories.clear(),
            db.products.clear(),
            db.sales.clear(),
            db.saleItems.clear(),
            db.expenses.clear(),
            db.settings.clear()
          ])
          await Promise.all([
            db.categories.bulkAdd(data.categories || []),
            db.products.bulkAdd(data.products || []),
            db.sales.bulkAdd(data.sales || []),
            db.saleItems.bulkAdd(data.saleItems || []),
            db.expenses.bulkAdd(data.expenses || []),
            db.settings.bulkAdd(data.settings || [])
          ])
          if (currentPassword) await db.settings.put({ key: 'password', value: currentPassword })
        })
        toast('Respaldo restaurado correctamente')
        location.reload()
      } catch (err) {
        console.error(err)
        toast('Archivo de respaldo inválido', 'error')
      }
    }
    reader.readAsText(file)
  }

  const loadCatalog = async () => {
    const n = await seedCatalog()
    toast(n > 0 ? `${n} productos agregados al inventario` : 'El catálogo ya estaba cargado')
  }

  const replaceCatalog = async () => {
    await resetAndSeed()
    toast('Inventario reemplazado con el catálogo')
    location.reload()
  }

  const doReset = async () => {
    await resetAll()
    toast('Todos los datos fueron eliminados')
    location.reload()
  }

  return (
    <>
      <form className="card mb-16" onSubmit={save}>
        <div className="card-title"><span>Información de la tienda</span></div>
        <div className="form-grid">
          <Field label="Nombre de la tienda">
            <input className="input" name="storeName" defaultValue={settings.storeName} />
          </Field>
          <Field label="Moneda">
            <select className="select" name="currency" defaultValue={settings.currency}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="full">
            <Field label="Días de anticipación para alertas de vencimiento">
              <input className="input" type="number" name="warnDays" min="1" max="365" defaultValue={settings.warnDays} style={{ maxWidth: 200 }} />
            </Field>
          </div>
          <div className="full">
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" name="autoCatalog" defaultChecked={settings.autoCatalog !== false} style={{ width: 17, height: 17, accentColor: '#10b981' }} />
              <span>
                <b>Modo demo: mantener el catálogo completo automáticamente</b>
                <div className="hint" style={{ marginTop: 3 }}>Si falta algún producto del catálogo, se agrega solo al abrir la app. Desactívalo cuando quieras controlar tu inventario manualmente.</div>
              </span>
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{I.save} Guardar cambios</button>
        </div>
      </form>

      <div className="card mb-16">
        <div className="card-title"><span>{I.lock} Contraseña de seguridad</span></div>
        <p className="hint" style={{ lineHeight: 1.6, marginBottom: 14 }}>
          Se pide para eliminar productos y ventas, y para restar stock. Solo puedes cambiarla si conoces la contraseña actual.
        </p>
        <form className="form-grid" style={{ maxWidth: 480 }} onSubmit={changePass}>
          <Field label="Contraseña actual">
            <input className="input" type="password" name="currentPass" autoComplete="off" />
          </Field>
          <Field label="Nueva contraseña">
            <input className="input" type="password" name="newPass" autoComplete="off" />
          </Field>
          <div className="full">
            <Field label="Confirmar nueva contraseña">
              <input className="input" type="password" name="newPass2" autoComplete="off" />
              <div className="hint" style={{ marginTop: 3 }}>Si dejas la nueva contraseña vacía, la protección se desactiva.</div>
            </Field>
          </div>
          <div className="full">
            <button type="submit" className="btn btn-primary" disabled={changing}>{I.lock} Cambiar contraseña</button>
          </div>
        </form>
      </div>

      <div className="card mb-16">
        <div className="card-title"><span>Categorías de productos</span><Badge tone="gray">{categories?.length ?? 0}</Badge></div>
        <div className="flex mb-16">
          <input className="input" style={{ maxWidth: 300 }} placeholder="Nueva categoría… (Ej: Lácteos)" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
          <button type="button" className="btn btn-primary" onClick={addCategory}>{I.plus} Agregar</button>
        </div>
        {(!categories || categories.length === 0) ? (
          <EmptyState icon={I.tag} title="Sin categorías" text="Crea categorías para organizar tu inventario." />
        ) : (
          <div className="flex" style={{ flexWrap: 'wrap', gap: 10 }}>
            {categories.map((c) => {
              const used = (products || []).filter((p) => p.categoryId === c.id).length
              return (
                <span key={c.id} className="badge badge-gray" style={{ fontSize: 13, padding: '8px 14px', gap: 10 }}>
                  {c.name}
                  <span className="muted" style={{ fontWeight: 600 }}>{used}</span>
                  <button type="button" style={{ background: 'transparent', border: 'none', color: 'inherit', opacity: 0.7, display: 'inline-flex' }} onClick={() => setCatToDelete(c)}>{I.x}</button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="card mb-16">
        <div className="card-title"><span>Catálogo inicial (completo)</span></div>
        <p className="hint mb-16" style={{ lineHeight: 1.6 }}>
          Catálogo con 260 productos reales en 9 categorías (Galletas, Pipocas, Golosinas, Bebidas, Refrescos, Lácteos, Cocina, Limpieza e Higiene y Aceites y Aditivos) con sus cantidades y precios. Los productos que ya existan no se duplican.
        </p>
        <div className="flex">
          <button type="button" className="btn btn-ghost" onClick={loadCatalog}>{I.box} Agregar productos faltantes</button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmReplace(true)}>{I.refresh} Reemplazar todo por este catálogo</button>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-title"><span>Respaldo de datos</span></div>
        <p className="hint mb-16" style={{ lineHeight: 1.6 }}>
          Tu información vive 100% en este dispositivo (navegador). Descarga respaldos periódicamente y guárdalos en un lugar seguro.
        </p>
        <div className="flex">
          <button type="button" className="btn btn-ghost" onClick={exportBackup}>{I.download} Descargar respaldo</button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>{I.upload} Restaurar respaldo</button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = '' }} />
        </div>
      </div>

      <div className="card" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
        <div className="card-title"><span style={{ color: '#fb7185' }}>Zona de peligro</span></div>
        <p className="hint mb-16">Esto elimina permanentemente todos los productos, ventas, egresos y configuración de este dispositivo.</p>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>{I.trash} Restablecer todo</button>
      </div>

      {catToDelete && (
        <Confirm
          danger
          title="Eliminar categoría"
          message={`¿Eliminar la categoría "${catToDelete.name}"? Los productos asociados quedarán sin categoría.`}
          onConfirm={async () => {
            const prods = await db.products.where('categoryId').equals(catToDelete.id).toArray()
            for (const p of prods) await db.products.update(p.id, { categoryId: null })
            await db.categories.delete(catToDelete.id)
            toast('Categoría eliminada')
          }}
          onClose={() => setCatToDelete(null)}
        />
      )}

      {confirmReset && (
        <Confirm
          danger
          title="Restablecer todo"
          message="¿Seguro? Se borrará TODA la información de SurtiMax en este dispositivo. Esta acción no se puede deshacer."
          onConfirm={doReset}
          onClose={() => setConfirmReset(false)}
        />
      )}

      {confirmReplace && (
        <Confirm
          danger
          title="Reemplazar inventario"
          message="Se borrarán todos los productos, ventas, egresos y cierres de caja, y se cargará el catálogo de Galletas y Pipocas con sus cantidades. ¿Continuar?"
          onConfirm={replaceCatalog}
          onClose={() => setConfirmReplace(false)}
        />
      )}
    </>
  )
}