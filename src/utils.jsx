import { createContext, useContext, useEffect, useState } from 'react'
import { getSettings, saveSettings } from './db'

const Ctx = createContext(null)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  useEffect(() => {
    getSettings().then(setSettings)
  }, [])
  const update = async (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveSettings(patch)
  }
  if (!settings) return null
  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>
}

export function money(n, settings) {
  const sym = settings?.currency || 'Bs.'
  const v = Number(n) || 0
  return sym + ' ' + v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function moneyShort(n, settings) {
  const sym = settings?.currency || 'Bs.'
  const v = Number(n) || 0
  if (Math.abs(v) >= 1000000) return sym + ' ' + (v / 1000000).toFixed(1) + 'M'
  if (Math.abs(v) >= 1000) return sym + ' ' + (v / 1000).toFixed(1) + 'k'
  return sym + ' ' + v.toLocaleString('es-VE', { maximumFractionDigits: 0 })
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

export function csvEscape(s) {
  const str = String(s ?? '')
  return /[",;\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str
}

export function toCSV(headers, rows) {
  return [headers.map(csvEscape).join(';'), ...rows.map((r) => r.map(csvEscape).join(';'))].join('\r\n')
}

export function hashColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  const palette = [
    ['#10b981', 'rgba(16,185,129,0.15)'],
    ['#38bdf8', 'rgba(56,189,248,0.15)'],
    ['#a78bfa', 'rgba(167,139,250,0.15)'],
    ['#fbbf24', 'rgba(251,191,36,0.15)'],
    ['#fb7185', 'rgba(251,113,133,0.15)'],
    ['#34d399', 'rgba(52,211,153,0.15)'],
    ['#f472b6', 'rgba(244,114,182,0.15)']
  ]
  return palette[Math.abs(h) % palette.length]
}