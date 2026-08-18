import { useEffect, useState, createContext, useContext } from 'react'
import I from './icons'
import { useSettings } from './utils'

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={'modal' + (wide ? ' modal-lg' : '')}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ title, message, danger, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className={'btn ' + (danger ? 'btn-danger' : 'btn-primary')} onClick={() => { onConfirm(); onClose() }}>Confirmar</button>
      </div>
    </Modal>
  )
}

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

let seed = 0
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = (message, type = 'success') => {
    const id = ++seed
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.type}>
            <span className="toast-ico">{t.type === 'success' ? I.check : I.warn}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function PasswordModal({ title, hint, onSuccess, onClose }) {
  const { settings } = useSettings()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!settings.password || value === settings.password) {
      onSuccess?.()
      onClose()
    } else {
      setError(true)
      setValue('')
    }
  }
  return (
    <Modal title={title || 'Contraseña requerida'} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{hint || 'Esta acción requiere la contraseña de seguridad de la tienda.'}</p>
        <input
          className="input"
          type="password"
          autoFocus
          placeholder="Contraseña"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          style={{ marginTop: 12, borderColor: error ? '#fb7185' : undefined }}
        />
        {error && <p className="hint" style={{ marginTop: 6, color: '#fb7185' }}>Contraseña incorrecta, inténtalo de nuevo.</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={!value}>{I.lock} Verificar</button>
        </div>
      </form>
    </Modal>
  )
}

export function EmptyState({ icon = I.box, title, text }) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export function Badge({ tone, children }) {
  return (
    <span className={'badge badge-' + tone}>
      <span className="dot" />
      {children}
    </span>
  )
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function StatCard({ label, value, foot, tone = 'green', icon }) {
  const glow = tone === 'green' ? 'rgba(16,185,129,0.14)' : tone === 'red' ? 'rgba(244,63,94,0.14)' : tone === 'amber' ? 'rgba(245,158,11,0.14)' : 'rgba(56,189,248,0.14)'
  return (
    <div className="card stat" style={{ '--stat-glow': glow }}>
      <div className="flex between">
        <div className="stat-label">{label}</div>
        <span style={{ color: tone === 'green' ? '#34d399' : tone === 'red' ? '#fb7185' : tone === 'amber' ? '#fbbf24' : '#7dd3fc' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  )
}

export function downloadFile(name, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}