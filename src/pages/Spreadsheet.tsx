import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Download, Plus, Trash2, Search, ChevronDown, ChevronUp,
  Table2, BarChart2, Users, Package, Filter, Copy, ArrowUpDown,
  CornerDownLeft, Scissors
} from 'lucide-react'

import { collection, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

type CellValue = string | number
type GridData = Record<string, CellValue>
type SortDir = 'asc' | 'desc' | null
type Selection = { col: number; row: number }
type Range = { start: Selection; end: Selection } | null

/* ─── Sheet definitions (defaults used when Firestore doc is missing) ─── */

const SALES_HEADERS   = ['Date','Order ID','Customer','Product','Category','Qty','Unit Price','Total','Branch','Status']
const SALES_ROWS: CellValue[][] = [
  ['13 Aug 2024','ORD-0981','Accra Constructions Ltd','LED Panel 60W','Lighting',48,260,12480,'Head Office','Completed'],
  ['13 Aug 2024','ORD-0980','Kwesi Adu','Extension Board 6-way','Accessories',12,85,1020,'Asuoyeboa','Pending'],
  ['12 Aug 2024','ORD-0979','SafePower GH','Solar Panel 150W','Energy',15,1450,21750,'Head Office','Completed'],
  ['12 Aug 2024','ORD-0978','Yaa Asantewaa','MCB Breaker 32A','Electrical',30,45,1350,'Adum','Cancelled'],
  ['11 Aug 2024','ORD-0977','Nexgen Developers','Cable 2.5mm Roll','Cables',20,680,13600,'Head Office','Completed'],
]

const INVENTORY_HEADERS = ['SKU','Product Name','Category','In Stock','Min Stock','Unit Cost','Total Value','Branch','Last Restocked','Status']
const INVENTORY_ROWS: CellValue[][] = [
  ['LED-P60-WH','LED Panel 60W','Lighting',320,30,180,57600,'Head Office','05 Aug 2024','OK'],
  ['EXT-6W-15A','Extension Board 6-way','Accessories',520,50,55,28600,'Asuoyeboa','08 Aug 2024','OK'],
  ['SW-WIFI-16A','Smart Switch WiFi','Smart Home',22,40,120,2640,'Takoradi','01 Aug 2024','LOW'],
]

const STAFF_HEADERS = ['ID','Full Name','Role','Department','Branch','Status','Join Date','Sales (GH₵)','Rating','Manager']
const STAFF_ROWS: CellValue[][] = [
  ['EMP-001','Kwame Asante','General Manager','Management','Head Office','Active','15 Jan 2020',385200,4.9,'Board'],
  ['EMP-002','Ama Osei','Branch Manager','Management','Asuoyeboa','Active','03 Mar 2021',98500,4.7,'K. Asante'],
]

const SHEETS = [
  { id: 'sales',     label: 'Sales Data', icon: BarChart2, headers: SALES_HEADERS,     rows: SALES_ROWS,     color: '#16A34A' },
  { id: 'inventory', label: 'Inventory',  icon: Package,   headers: INVENTORY_HEADERS, rows: INVENTORY_ROWS, color: '#2563EB' },
  { id: 'staff',     label: 'Staff',      icon: Users,     headers: STAFF_HEADERS,     rows: STAFF_ROWS,     color: '#7C3AED' },
]

/* ─── Small helpers ───────────────────────────────────────────── */

const COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
function cellKey(col: number, row: number) { return `${COLS[col]}${row + 1}` }
function exportCSV(headers: string[], rows: CellValue[][], name: string) {
  const lines = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })),
    download: `${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`,
  })
  a.click()
}

/* ─── Status pill ─────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  OK:        { bg: '#F0FDF4', color: '#16A34A' },
  Active:    { bg: '#F0FDF4', color: '#16A34A' },
  Completed: { bg: '#F0FDF4', color: '#16A34A' },
  LOW:       { bg: '#FFFBEB', color: '#D97706' },
  Pending:   { bg: '#FFFBEB', color: '#D97706' },
  'On Leave':{ bg: '#FFFBEB', color: '#D97706' },
  CRITICAL:  { bg: '#FEF2F2', color: '#DC2626' },
  Cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  DEAD:      { bg: '#F8F9FB', color: '#94A3B8' },
}
function StatusPill({ val }: { val: CellValue }) {
  const s = String(val)
  const map = STATUS_MAP[s]
  if (!map) return <span>{s}</span>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: map.bg, color: map.color, letterSpacing: '0.03em', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: map.color, display: 'inline-block' }} />
      {s}
    </span>
  )
}

/* ─── Context menu ────────────────────────────────────────────── */

type CtxMenu = { x: number; y: number; col: number; row: number } | null
function ContextMenu({ menu, onClose, onAction }: { menu: CtxMenu; onClose: () => void; onAction: (a: string, col: number, row: number) => void }) {
  useEffect(() => {
    const h = () => onClose()
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [onClose])
  if (!menu) return null
  const items = [
    { icon: Copy,    label: 'Copy cell',       action: 'copy'   },
    { icon: Scissors,label: 'Cut cell',         action: 'cut'    },
    { icon: Plus,    label: 'Insert row above', action: 'insAbove'},
    { icon: Plus,    label: 'Insert row below', action: 'insBelow'},
    { icon: Trash2,  label: 'Delete row',       action: 'del'    },
  ]
  return (
    <div onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', left: menu.x, top: menu.y, zIndex: 9999, background: '#fff', borderRadius: 8, minWidth: 168, boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15)', padding: '4px' }}>
      {items.map(({ icon: Icon, label, action }, i) => (
        <button key={action} onMouseDown={() => { onAction(action, menu.col, menu.row); onClose() }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: action === 'del' ? '#DC2626' : '#0A0F1E', textAlign: 'left', borderRadius: 5, transition: 'background 0.1s' }}
          onMouseEnter={e => (e.currentTarget.style.background = action === 'del' ? '#FEF2F2' : '#F8F9FB')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Icon size={12} style={{ color: action === 'del' ? '#DC2626' : '#94A3B8' }} />
          {label}
          {i === 0 && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#CBD5E1' }}>Ctrl+C</span>}
        </button>
      ))}
    </div>
  )
}

/* ─── Small toast helper (local only) ─────────────────────────── */
function useToasts() {
  const [toasts, setToasts] = useState<any[]>([])
  const push = (message: string, tone = 'default') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }
  return { toasts, push }
}

/* ─── Main component ──────────────────────────────────────────── */

const EXTRA_ROWS = 20

export default function Spreadsheet() {
  const { toasts, push } = useToasts()
  const { user, hasRole, loading: authLoading } = useAuth()
  const canRead  = !!(hasRole && (hasRole('manager') || hasRole('developer')))
  const canWrite = !!(hasRole && hasRole('developer'))

  const [activeSheet, setActiveSheet]     = useState('sales')
  const [selected, setSelected]           = useState<Selection | null>(null)
  const [selRange, setSelRange]           = useState<Range>(null)
  const [editing, setEditing]             = useState<Selection | null>(null)
  const [editVal, setEditVal]             = useState('')
  const [overrides, setOverrides]         = useState<Record<string, GridData>>({})
  const [extraRows, setExtraRows]         = useState<Record<string, CellValue[][]>>({})
  const [search, setSearch]               = useState('')
  const [sortCol, setSortCol]             = useState<number | null>(null)
  const [sortDir, setSortDir]             = useState<SortDir>(null)
  const [filterCol, setFilterCol]         = useState<number | null>(null)
  const [filterVals, setFilterVals]       = useState<Record<string, Set<string>>>({})
  const [ctxMenu, setCtxMenu]             = useState<CtxMenu>(null)
  const [clipboard, setClipboard]         = useState<string>('')
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [remoteSheets, setRemoteSheets]   = useState<Record<string, { rows: CellValue[][], headers?: string[], label?: string }>>({})

  const inputRef    = useRef<HTMLInputElement>(null)
  const gridRef     = useRef<HTMLDivElement>(null)
  const filterRef   = useRef<HTMLDivElement>(null)

  // Initialize local remoteSheets with defaults so UI shows immediately
  useEffect(() => {
    const init: Record<string, any> = {}
    for (const s of SHEETS) init[s.id] = { rows: s.rows, headers: s.headers, label: s.label }
    setRemoteSheets(init)
  }, [])

  // Subscribe to Firestore docs for each sheet: collection 'spreadsheet', docId = sheet-{id}
  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    setLoading(true)
    const unsub: (() => void)[] = []
    for (const s of SHEETS) {
      const d = doc(db, 'spreadsheet', `sheet-${s.id}`)
      const u = onSnapshot(d, snap => {
        if (snap.exists()) {
          const data = snap.data() as any
          setRemoteSheets(prev => ({ ...prev, [s.id]: { rows: data.rows ?? s.rows, headers: data.headers ?? s.headers, label: data.label ?? s.label } }))
        } else {
          // keep defaults already seeded locally
        }
        setLoading(false)
      }, err => {
        console.error('Spreadsheet snapshot error', err)
        setError('Failed to load spreadsheet from Firestore')
        setLoading(false)
      })
      unsub.push(u)
    }
    return () => unsub.forEach(u => u())
  }, [user, hasRole])

  // Helpers to read current sheet data (merge remote + local extra rows)
  const sheetMeta = SHEETS.find(s => s.id === activeSheet)!
  const headers = (remoteSheets[activeSheet]?.headers ?? sheetMeta.headers)
  const baseRemoteRows = (remoteSheets[activeSheet]?.rows ?? sheetMeta.rows) as CellValue[][]
  const baseRows = [...baseRemoteRows, ...(extraRows[activeSheet] || [])]
  const gridOvr = overrides[activeSheet] || {}
  const filter = filterVals[`${activeSheet}:${filterCol}`]

  const getCellValue = useCallback((col: number, row: number): CellValue => {
    const key = cellKey(col, row)
    if (key in gridOvr) return gridOvr[key]
    return (row < baseRows.length && col < (baseRows[row]?.length ?? 0)) ? baseRows[row][col] : ''
  }, [gridOvr, baseRows])

  // Merge overrides into base rows to produce the array to persist
  const mergeRows = (sheetId: string) => {
    const rows = (remoteSheets[sheetId]?.rows ?? SHEETS.find(s => s.id === sheetId)!.rows).map(r => [...r])
    // ensure enough rows to account for overrides
    const keys = Object.keys(overrides[sheetId] || {})
    for (const k of keys) {
      const colLetter = k.replace(/\d+/g, '')
      const rowNum = parseInt(k.replace(/[^0-9]/g, ''), 10) - 1
      const colIdx = COLS.indexOf(colLetter)
      if (rowNum >= rows.length) {
        for (let i = rows.length; i <= rowNum; i++) rows.push([])
      }
      const v = overrides[sheetId][k]
      rows[rowNum][colIdx] = v
    }
    return rows
  }

  const persistSheet = async (sheetId: string, rows: CellValue[][]) => {
    if (!canWrite) {
      push('You do not have permission to save changes (developer role required)', 'danger')
      return
    }
    try {
      await setDoc(doc(db, 'spreadsheet', `sheet-${sheetId}`), { rows, headers, label: sheetMeta.label, updatedAt: serverTimestamp() }, { merge: true })
      push('Saved', 'success')
    } catch (err) {
      console.error(err)
      push('Failed to save changes', 'danger')
    }
  }

  // Set a cell locally (override) and persist merged result
  const setCellValue = async (col: number, row: number, val: CellValue) => {
    setOverrides(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], [cellKey(col, row)]: val } }))
    // create merged rows and persist
    setTimeout(async () => {
      const merged = mergeRows(activeSheet)
      await persistSheet(activeSheet, merged)
    }, 10)
  }

  const startEdit = (col: number, row: number, initial?: string) => {
    setEditing({ col, row })
    setEditVal(initial ?? String(getCellValue(col, row)))
  }

  const commitEdit = useCallback(async () => {
    if (!editing) return
    const num = Number(editVal)
    const value: CellValue = !isNaN(num) && editVal !== '' ? num : editVal
    await setCellValue(editing.col, editing.row, value)
    setEditing(null)
  }, [editing, editVal, activeSheet])

  /* Sort & filter */
  const sortedRows = (() => {
    let rows = baseRows.map((_, i) => i)
    if (sortCol !== null && sortDir) {
      rows = [...rows].sort((a, b) => {
        const va = getCellValue(sortCol, a)
        const vb = getCellValue(sortCol, b)
        const na = typeof va === 'number', nb = typeof vb === 'number'
        let cmp = na && nb ? (va as number) - (vb as number)
                           : String(va).localeCompare(String(vb))
        return sortDir === 'desc' ? -cmp : cmp
      })
    }
    if (search) {
      rows = rows.filter(r => headers.some((_, c) => String(getCellValue(c, r)).toLowerCase().includes(search.toLowerCase())))
    }
    if (filter && filter.size > 0) {
      rows = rows.filter(r => filterCol !== null && filter.has(String(getCellValue(filterCol, r))))
    }
    const total = rows.length + EXTRA_ROWS
    for (let i = rows.length; i < total; i++) rows.push(baseRows.length + (i - rows.length))
    return rows
  })()

  /* Keyboard */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selected) return
    const { col, row } = selected
    if (e.key === 'Enter') {
      if (editing) { commitEdit(); setSelected({ col, row: row + 1 }) }
      else startEdit(col, row)
    } else if (e.key === 'Escape') { setEditing(null)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commitEdit()
      setSelected({ col: (col + 1) % headers.length, row })
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!editing) { setCellValue(col, row, ''); e.preventDefault() }
    } else if (e.key === 'ArrowDown')  { e.preventDefault(); if (editing) commitEdit(); setSelected({ col, row: row + 1 }) }
    else if (e.key === 'ArrowUp')    { e.preventDefault(); if (editing) commitEdit(); setSelected({ col, row: Math.max(0, row - 1) }) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (!editing) setSelected({ col: Math.min(headers.length - 1, col + 1), row }) }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); if (!editing) setSelected({ col: Math.max(0, col - 1), row }) }
    else if (e.key.length === 1 && !editing && !e.ctrlKey && !e.metaKey) { startEdit(col, row, e.key) }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const val = String(getCellValue(col, row))
      navigator.clipboard?.writeText(val).catch(() => {})
      setClipboard(val)
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      if (!editing) setCellValue(col, row, clipboard)
    }
  }

  useEffect(() => { if (editing && inputRef.current) inputRef.current.select() }, [editing])

  /* Context menu actions */
  const handleCtxAction = (action: string, col: number, row: number) => {
    if (action === 'copy') setClipboard(String(getCellValue(col, row)))
    if (action === 'cut') { setClipboard(String(getCellValue(col, row))); setCellValue(col, row, '') }
    if (action === 'del') { headers.forEach((_, c) => setCellValue(c, row, '')) }
    if (action === 'insBelow') {
      // append an empty persisted row if allowed, otherwise local
      if (canWrite) {
        const merged = mergeRows(activeSheet)
        merged.splice(row + 1, 0, [])
        persistSheet(activeSheet, merged)
      } else {
        setExtraRows(prev => ({ ...prev, [activeSheet]: [...(prev[activeSheet] || []), []] }))
      }
    }
  }

  /* Column filter dropdown helpers */
  const toggleFilter = (colIdx: number, e: React.MouseEvent) => { e.stopPropagation(); setFilterCol(prev => prev === colIdx ? null : colIdx) }
  const uniqueVals = filterCol !== null ? [...new Set(baseRows.map((_, r) => String(getCellValue(filterCol, r)).trim()).filter(Boolean))].sort() : []
  const toggleFilterVal = (colIdx: number, val: string) => { const key = `${activeSheet}:${colIdx}`; setFilterVals(prev => { const existing = new Set(prev[key] ?? []); existing.has(val) ? existing.delete(val) : existing.add(val); return { ...prev, [key]: existing } }) }
  const clearFilter = (colIdx: number) => { const key = `${activeSheet}:${colIdx}`; setFilterVals(prev => { const n = { ...prev }; delete n[key]; return n }); setFilterCol(null) }
  const hasFilter = (colIdx: number) => { const key = `${activeSheet}:${colIdx}`; return (filterVals[key]?.size ?? 0) > 0 }

  useEffect(() => { const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterCol(null) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])

  const isInRange = (col: number, row: number) => {
    if (!selRange) return false
    const minC = Math.min(selRange.start.col, selRange.end.col)
    const maxC = Math.max(selRange.start.col, selRange.end.col)
    const minR = Math.min(selRange.start.row, selRange.end.row)
    const maxR = Math.max(selRange.start.row, selRange.end.row)
    return col >= minC && col <= maxC && row >= minR && row <= maxR
  }

  /* ── Loading / permission / error states ── */
  if (authLoading || loading) return <div style={{ padding: 24 }}>Loading spreadsheet…</div>
  if (!canRead) return <div style={{ padding: 24, color: '#DC2626' }}>Permission denied — spreadsheet is viewable by managers and developers only.</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>

  /* ─── UI ────────────────────────────────────────────────────── */
  const sheet = SHEETS.find(s => s.id === activeSheet)!
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)', overflow: 'hidden', background: '#fff' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 42, flexShrink: 0, background: '#FAFAFA', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Table2 size={14} style={{ color: sheet.color }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0A0F1E', letterSpacing: '-0.02em' }}>COFKANS ERP</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#CBD5E1', letterSpacing: '0.04em' }}>· SPREADSHEET</span>
        </div>

        <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {[ { icon: Copy,  label: 'Copy' }, { icon: Scissors, label: 'Cut' }, { icon: Trash2, label: 'Delete Row' }, { icon: Plus, label: 'Add Row' } ].map(({ icon: Icon, label }) => (
          <button key={label} title={label} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 5, border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: '#6B7280' }}
            onClick={() => {
              if (label === 'Copy' && selected) setClipboard(String(getCellValue(selected.col, selected.row)))
              if (label === 'Add Row') {
                if (canWrite) {
                  const merged = mergeRows(activeSheet)
                  merged.push([])
                  persistSheet(activeSheet, merged)
                } else {
                  setExtraRows(prev => ({ ...prev, [activeSheet]: [...(prev[activeSheet] || []), []] }))
                }
              }
              if (label === 'Delete Row' && selected) headers.forEach((_, c) => setCellValue(c, selected.row, ''))
            }}
          >
            <Icon size={12} />
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative' }}>
          <Search size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find in sheet…" style={{ paddingLeft: 28, paddingRight: 8, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,0.09)', background: '#F8F9FB', fontSize: 11, width: 154 }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 14 }}>×</button>}
        </div>

        <button onClick={() => exportCSV(headers, baseRows, sheet.label)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 28, borderRadius: 6, border: 'none', background: '#16A34A', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={11} /> Export CSV
        </button>
      </div>

      {/* Formula bar */}
      <div style={{ display: 'flex', alignItems: 'center', height: 30, flexShrink: 0, borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: '100%', background: '#F8F9FB', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: sheet.color }}>{selected ? `${COLS[selected.col]}${selected.row + 1}` : 'A1'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: '100%', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#94A3B8' }}>ƒ</span>
        </div>
        <input style={{ flex: 1, height: '100%', padding: '0 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} value={editing ? editVal : (selected ? String(getCellValue(selected.col, selected.row)) : '')} onChange={e => editing && setEditVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }} onFocus={() => { if (!editing && selected) startEdit(selected.col, selected.row) }} placeholder="Select a cell…" readOnly={!editing} />
        {editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingRight: 8 }}>
            <button onClick={() => setEditing(null)} style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: '#FEF2F2', color: '#DC2626' }}>×</button>
            <button onClick={commitEdit} style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: '#F0FDF4', color: '#16A34A' }}><CornerDownLeft size={11} /></button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div ref={gridRef} tabIndex={0} onKeyDown={handleKeyDown} style={{ flex: 1, overflow: 'auto', outline: 'none', position: 'relative' }} onClick={() => setCtxMenu(null)}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '100%' }}>
          <colgroup>
            <col style={{ width: 52 }} />
            {headers.map((h, i) => <col key={i} style={{ width: Math.max(110, Math.min(200, h.length * 9 + 44)) }} />)}
          </colgroup>

          <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <tr style={{ background: '#F9FAFB' }}>
              <th style={{ width: 52, height: 22 }} />
              {headers.map((_, c) => (
                <th key={c} style={{ height: 22, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: selected?.col === c ? sheet.color : '#9CA3AF', borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>{COLS[c]}</th>
              ))}
            </tr>

            <tr>
              <th style={{ height: 30, position: 'sticky', left: 0, zIndex: 21, background: '#1E2430', textAlign: 'center' }}>#</th>
              {headers.map((h, c) => {
                const isSorted = sortCol === c
                const isFiltered = hasFilter(c)
                return (
                  <th key={c} style={{ height: 30, background: '#1E2430', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0 10px', textAlign: 'left', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => { if (sortCol === c) { if (sortDir === 'asc') setSortDir('desc'); else if (sortDir === 'desc') { setSortCol(null); setSortDir(null) } } else { setSortCol(c); setSortDir('asc') } }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isSorted ? '#4ADE80' : '#D1D5DB' }}>{h}</span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ChevronUp size={8} style={{ color: isSorted && sortDir === 'asc' ? '#4ADE80' : '#374151' }} />
                        <ChevronDown size={8} style={{ color: isSorted && sortDir === 'desc' ? '#4ADE80' : '#374151' }} />
                      </span>
                      <button onMouseDown={e => toggleFilter(c, e)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Filter column"><Filter size={9} /></button>
                    </div>

                    {filterCol === c && (
                      <div ref={filterRef} onMouseDown={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, minWidth: 180, background: '#fff', borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15)', padding: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', padding: '2px 4px 6px', textTransform: 'uppercase' }}>Filter by value</div>
                        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                          {uniqueVals.map(v => {
                            const active = filter?.has(v) ?? false
                            return (
                              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 4px', cursor: 'pointer', borderRadius: 4, fontSize: 12, color: '#374151' }}>
                                <input type="checkbox" checked={active} onChange={() => toggleFilterVal(c, v)} style={{ accentColor: sheet.color, width: 12, height: 12 }} />
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{v}</span>
                              </label>
                            )
                          })}
                        </div>
                        {isFiltered && <button onClick={() => clearFilter(c)} style={{ width: '100%', marginTop: 6, padding: '5px 0', background: '#FEF2F2', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, color: '#DC2626' }}>Clear filter</button>}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((rowIdx, displayIdx) => {
              const isEven = displayIdx % 2 === 1
              const isEmpty = rowIdx >= baseRows.length && !Object.keys(gridOvr).some(k => {
                const r = parseInt(k.slice(1)) - 1
                return r === rowIdx
              })
              return (
                <tr key={`${rowIdx}-${displayIdx}`} style={{ background: isEven ? '#FAFAFA' : '#fff' }}>
                  <td style={{ height: 26, textAlign: 'center', position: 'sticky', left: 0, zIndex: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9CA3AF', borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #F3F4F6', background: selected?.row === rowIdx ? `${sheet.color}10` : isEven ? '#F9FAFB' : '#fff' }}>{rowIdx + 1}</td>

                  {headers.map((_, colIdx) => {
                    const isSelected = selected?.col === colIdx && selected?.row === rowIdx
                    const isEditing  = editing?.col === colIdx && editing?.row === rowIdx
                    const inRange    = isInRange(colIdx, rowIdx)
                    const val        = getCellValue(colIdx, rowIdx)
                    const isStatus   = STATUS_MAP[String(val)] !== undefined
                    const isNum      = typeof val === 'number'
                    return (
                      <td key={colIdx} style={{ height: 26, padding: isEditing ? 0 : '0 10px', borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', outline: isSelected ? `2px solid ${sheet.color}` : inRange ? `1px solid ${sheet.color}60` : 'none', outlineOffset: -1, background: isSelected ? `${sheet.color}08` : inRange ? `${sheet.color}05` : undefined, fontSize: 12, color: '#0A0F1E', fontFamily: isNum ? 'JetBrains Mono, monospace' : 'Inter, sans-serif', textAlign: isNum ? 'right' : 'left', cursor: 'cell', userSelect: 'none', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'middle' }}
                        onClick={e => { if (editing && !(editing.col === colIdx && editing.row === rowIdx)) commitEdit(); if (e.shiftKey && selected) { setSelRange({ start: selected, end: { col: colIdx, row: rowIdx } }) } else { setSelRange(null); setSelected({ col: colIdx, row: rowIdx }) } gridRef.current?.focus() }}
                        onDoubleClick={() => startEdit(colIdx, rowIdx)}
                        onContextMenu={e => { e.preventDefault(); setSelected({ col: colIdx, row: rowIdx }); setCtxMenu({ x: e.clientX, y: e.clientY, col: colIdx, row: rowIdx }) }}
                      >
                        {isEditing ? (
                          <input ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={e => { if (e.key === 'Enter') { commitEdit(); setSelected({ col: colIdx, row: rowIdx + 1 }); e.stopPropagation() } if (e.key === 'Escape') setEditing(null) if (e.key === 'Tab') { e.preventDefault(); commitEdit(); setSelected({ col: (colIdx + 1) % headers.length, row: rowIdx }) } }} style={{ width: '100%', height: '100%', padding: '0 8px', border: 'none', outline: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, background: `${sheet.color}10`, color: '#0A0F1E' }} />
                        ) : isStatus ? (
                          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}><StatusPill val={val} /></div>
                        ) : (
                          <span>{isNum ? (val as number).toLocaleString() : String(val)}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 34, flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.07)', background: '#F8F9FB' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2, paddingLeft: 8 }}>
          {SHEETS.map(s => {
            const Icon = s.icon
            const isActive = s.id === activeSheet
            return (
              <button key={s.id} onClick={() => { setActiveSheet(s.id); setSelected(null); setEditing(null); setSearch(''); setSortCol(null); setSortDir(null) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 28, borderRadius: '6px 6px 0 0', fontSize: 11, fontWeight: isActive ? 600 : 400, cursor: 'pointer', background: isActive ? '#fff' : 'transparent', color: isActive ? s.color : '#94A3B8', borderColor: isActive ? 'rgba(0,0,0,0.08)' : 'transparent', boxShadow: isActive ? '0 -2px 0 0 ' + s.color + ' inset' : 'none' }}>
                <Icon size={11} />
                {remoteSheets[s.id]?.label ?? s.label}
              </button>
            )
          })}
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 28, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#CBD5E1', borderRadius: 5 }} onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')} onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1') }>
            <Plus size={11} /> Sheet
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 14 }}>
          {selected && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#94A3B8' }}>{COLS[selected.col]}{selected.row + 1}</span>}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#CBD5E1' }}>{baseRows.length} rows · {headers.length} cols</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#16A34A' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />AUTO-SAVE</span>
        </div>
      </div>

      <ContextMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} onAction={handleCtxAction} />

      {/* toasts */}
      <div style={{ position: 'fixed', right: 16, bottom: 16 }}>{toasts.map(t => <div key={t.id} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 8, background: t.tone === 'danger' ? '#FEF2F2' : '#0A0F1E', color: t.tone === 'danger' ? '#DC2626' : '#fff' }}>{t.message}</div>)}</div>
    </div>
  )
}
