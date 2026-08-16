import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string | number
  onChange?: (val: string) => void
  type?: 'text' | 'number' | 'currency'
  style?: React.CSSProperties
  className?: string
}

export default function EditableCell({ value, onChange, type = 'text', style, className }: Props) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setVal(String(value)) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    onChange?.(val)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(String(value)); setEditing(false) } }}
        style={{
          border: 'none',
          outline: '2px solid #00FF88',
          borderRadius: 4,
          background: 'rgba(0,255,136,0.06)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          width: '100%',
          padding: '1px 6px',
          color: '#0A0E1A',
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={className}
      title="Click to edit"
      style={{
        cursor: 'text',
        borderRadius: 4,
        padding: '1px 4px',
        transition: 'background 0.15s',
        display: 'inline-block',
        minWidth: 40,
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,136,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {value}
    </span>
  )
}
