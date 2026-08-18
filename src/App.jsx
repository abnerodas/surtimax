import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, daysUntil, seedCatalog } from './db'
import { SettingsProvider, useSettings } from './utils'
import { ToastProvider, Badge } from './ui'
import I from './icons'
import Dashboard from './views/Dashboard'
import Inventory from './views/Inventory'
import Sales from './views/Sales'
import CashRegister from './views/CashRegister'
import Expenses from './views/Expenses'
import Expiry from './views/Expiry'
import Reports from './views/Reports'
import SettingsView from './views/Settings'

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: I.home, sub: 'Resumen de tu tienda' },
  { id: 'inventario', label: 'Inventario', icon: I.box, sub: 'Productos y stock' },
  { id: 'ventas', label: 'Vender', icon: I.cart, sub: 'Registra ventas' },
  { id: 'caja', label: 'Caja', icon: I.cash, sub: 'Apertura y cierre' },
  { id: 'egresos', label: 'Egresos', icon: I.wallet, sub: 'Gastos de la tienda' },
  { id: 'vencimientos', label: 'Vencimientos', icon: I.alarm, sub: 'Control de fechas' },
  { id: 'reportes', label: 'Reportes', icon: I.chart, sub: 'Análisis y balances' },
  { id: 'config', label: 'Configuración', icon: I.gear, sub: 'Ajustes y respaldos' }
]

function Shell() {
  const [view, setView] = useState('inicio')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const { settings } = useSettings()

  const products = useLiveQuery(() => db.products.toArray(), [])
  const alerts = useMemo(() => {
    if (!products) return { expiry: 0, stock: 0 }
    const expiry = products.filter((p) => p.expiryDate && daysUntil(p.expiryDate) <= (settings.warnDays || 30))
    const stock = products.filter((p) => p.stock <= p.minStock)
    return { expiry: expiry.length, stock: stock.length }
  }, [products, settings.warnDays])

  useEffect(() => {
    if (settings?.autoCatalog !== false) seedCatalog()
  }, [settings])

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const installed = window.matchMedia('(display-mode: standalone)').matches
  const current = NAV.find((n) => n.id === view)

  const install = async () => {
    deferredPrompt?.prompt()
    setDeferredPrompt(null)
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">Surti<span>Max</span></div>
            <div className="brand-sub">Control total</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={'nav-item' + (view === n.id ? ' active' : '')} onClick={() => setView(n.id)}>
              {n.icon}
              <span>{n.label}</span>
              {n.id === 'vencimientos' && alerts.expiry > 0 && <span className="nav-badge warn">{alerts.expiry}</span>}
              {n.id === 'inventario' && alerts.stock > 0 && <span className="nav-badge">{alerts.stock}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span>{settings.storeName}</span>
          <span>v1.1 · {__BUILD_DATE__}</span>
        </div>
      </aside>

      <main className="main">
        {!installed && deferredPrompt && (
          <div className="install-banner">
            <span style={{ color: '#34d399' }}>{I.download}</span>
            <div className="grow">Instala <b>SurtiMax</b> como app en tu dispositivo para acceso rápido y sin internet.</div>
            <button className="btn btn-primary btn-sm" onClick={install}>Instalar</button>
          </div>
        )}
        <div className="topbar">
          <div>
            <div className="page-title">{current.label}</div>
            <div className="page-sub">{current.sub}</div>
          </div>
          {view === 'inventario' && (
            <div className="topbar-actions">
              <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('inventario:nuevo'))}>{I.plus} Nuevo producto</button>
            </div>
          )}
          {view === 'ventas' && (
            <div className="topbar-actions">
              <Badge tone="green">{products?.length ?? 0} productos</Badge>
            </div>
          )}
        </div>

        {view === 'inicio' && <Dashboard go={setView} />}
        {view === 'inventario' && <Inventory />}
        {view === 'ventas' && <Sales />}
        {view === 'caja' && <CashRegister />}
        {view === 'egresos' && <Expenses />}
        {view === 'vencimientos' && <Expiry />}
        {view === 'reportes' && <Reports />}
        {view === 'config' && <SettingsView />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <Shell />
      </SettingsProvider>
    </ToastProvider>
  )
}