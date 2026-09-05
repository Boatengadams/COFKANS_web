import React, { useState } from 'react'

function Placeholder({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,.2),transparent_35%),linear-gradient(145deg,#172033,#080d18)] text-white ${className ?? ''}`}
      style={style}
      aria-label="Product image pending upload"
    >
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true" className="text-primary">
        <circle cx="23" cy="20" r="13" stroke="currentColor" strokeWidth="2" opacity=".8"/>
        <path d="M16 20h14M23 13v14M8 36h30" stroke="currentColor" strokeWidth="2" opacity=".55"/>
      </svg>
      <span className="text-[10px] font-bold tracking-[0.28em] text-white/85">COFKANS</span>
      <span className="text-[9px] tracking-[0.16em] text-primary/80">IMAGE PENDING</span>
    </div>
  )
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const { src, alt, style, className, ...rest } = props

  if (!src) return <Placeholder className={className} style={style} />
  if (status === 'error') return <Placeholder className={className} style={style} />

  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        {...rest}
      />
    </div>
  )
}
