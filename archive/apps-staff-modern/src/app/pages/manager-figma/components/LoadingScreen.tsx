import { useEffect, useState, useRef } from 'react'
import logoSrc from '../imports/cofkans-BFw8TZ-5.png'

/* ─── Types ───────────────────────────────────────────────────── */

export type LoadStage = 'auth' | 'permissions' | 'dashboard' | 'finalize' | 'error' | 'done'

const STAGE_META: Record<Exclude<LoadStage, 'done' | 'error'>, { label: string; pct: number }> = {
  auth:        { label: 'Authenticating',     pct: 18  },
  permissions: { label: 'Applying settings',  pct: 46  },
  dashboard:   { label: 'Loading data',       pct: 76  },
  finalize:    { label: 'Almost ready',       pct: 100 },
}

/* ─── CSS keyframes ───────────────────────────────────────────── */

const CSS = `
  /* Bloom idle breathe */
  @keyframes bloom-breathe {
    0%, 100% { opacity: 0.45; transform: translate(-50%,-62%) scale(1);    }
    50%       { opacity: 0.70; transform: translate(-50%,-62%) scale(1.12); }
  }

  /* Single bloom flash after logo appears */
  @keyframes bloom-flash {
    0%   { opacity: 0;    transform: translate(-50%,-62%) scale(0.6); }
    40%  { opacity: 0.80; transform: translate(-50%,-62%) scale(1.1); }
    100% { opacity: 0.45; transform: translate(-50%,-62%) scale(1);   }
  }

  /* Logo entrance — expo-out feel */
  @keyframes logo-in {
    0%   { opacity: 0; transform: translateY(20px) scale(0.97); filter: blur(12px); }
    100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);    }
  }

  /* Subtitle: expand letter-spacing in as it fades up */
  @keyframes sub-in {
    0%   { opacity: 0; transform: translateY(6px); letter-spacing: 0.18em; }
    100% { opacity: 1; transform: translateY(0);   letter-spacing: 0.28em; }
  }

  /* Divider draw */
  @keyframes line-draw {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }

  /* Controls fade up */
  @keyframes ctrl-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Status text swap */
  @keyframes status-swap {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Progress bar fill shimmer — moves over the filled portion */
  @keyframes bar-sheen {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }

  /* Leading dot pulse */
  @keyframes dot-pulse {
    0%, 100% { box-shadow: 0 0  6px 1px rgba(226,201,146,0.45); }
    50%       { box-shadow: 0 0 18px 4px rgba(226,201,146,0.80); }
  }

  /* Completion flash on bar */
  @keyframes bar-done {
    0%   { box-shadow: 0 0 10px 2px rgba(201,169,110,0.55); }
    45%  { box-shadow: 0 0 38px 10px rgba(201,169,110,1);   }
    100% { box-shadow: 0 0  8px 2px rgba(201,169,110,0.30); }
  }

  /* Checkmark spring pop */
  @keyframes check-pop {
    0%   { transform: scale(0) rotate(-25deg); opacity: 0; }
    60%  { transform: scale(1.3) rotate(6deg);  opacity: 1; }
    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
  }

  /* EXIT — whole screen slides left as one piece */
  @keyframes slide-left {
    0%   { transform: translateX(0);     }
    100% { transform: translateX(-100%); }
  }

  /* Skeleton shimmer */
  @keyframes sk-shimmer {
    from { background-position:  200% 0; }
    to   { background-position: -200% 0; }
  }

  /* Error shake */
  @keyframes err-shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-7px); }
    40%      { transform: translateX(7px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`

/* ─── Skeleton (dark) ─────────────────────────────────────────── */

function Sk({ w, h, r = 5, d = 0 }: { w: string | number; h: number; r?: number; d?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#111824 25%,#1a2235 50%,#111824 75%)',
      backgroundSize: '400% 100%',
      animation: `sk-shimmer 1600ms ease-in-out ${d}ms infinite`,
    }} />
  )
}

function SkNav() {
  return (
    <div style={{ width: 218, flexShrink: 0, background: '#0b0e18', padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Sk w={32} h={32} r={8} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Sk w="65%" h={8} r={3} /><Sk w="42%" h={6} r={3} d={40} />
        </div>
      </div>
      {[42,58,50,64,36,52,46,60].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px' }}>
          <Sk w={14} h={14} r={3} d={i * 30} />
          <Sk w={`${w}%`} h={7} r={3} d={i * 30 + 20} />
        </div>
      ))}
    </div>
  )
}

function SkBar() {
  return (
    <div style={{ height: 50, background: '#0e1220', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', flexShrink: 0 }}>
      <Sk w={130} h={8} r={3} />
      <div style={{ flex: 1 }} />
      <Sk w={156} h={26} r={6} d={30} /><Sk w={26} h={26} r={6} d={60} /><Sk w={26} h={26} r={13} d={90} />
    </div>
  )
}

function SkKPI() {
  return (
    <div style={{ background: '#0e1220', borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.03)' }}>
      <Sk w={52} h={7} r={3} />
      <div style={{ marginTop: 10 }}><Sk w={86} h={24} r={5} d={50} /></div>
      <div style={{ marginTop: 8 }}><Sk w={46} h={7} r={3} d={90} /></div>
    </div>
  )
}

function SkChart() {
  return (
    <div style={{ background: '#0e1220', borderRadius: 10, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.03)', gridColumn: 'span 4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Sk w={108} h={8} r={3} /><Sk w={80} h={28} r={5} d={50} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 88 }}>
        {[52,38,70,48,82,44,68,74,40,88,60,72,46,80,56,84,50,76,64,78].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0', background: 'linear-gradient(90deg,#111824 25%,#1a2235 50%,#111824 75%)', backgroundSize: '400% 100%', animation: `sk-shimmer 1600ms ease-in-out ${i * 22}ms infinite` }} />
        ))}
      </div>
    </div>
  )
}

function SkRow({ d }: { d: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
      <Sk w={26} h={26} r={13} d={d} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Sk w="54%" h={8} r={3} d={d + 30} /><Sk w="34%" h={6} r={3} d={d + 60} />
      </div>
      <Sk w={52} h={8} r={3} d={d + 90} />
    </div>
  )
}

function SkeletonApp() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#090c14', overflow: 'hidden' }}>
      <SkNav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SkBar />
        <div style={{ flex: 1, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><Sk w={90} h={7} r={3} /><Sk w={170} h={13} r={4} d={30} /></div>
            <Sk w={120} h={28} r={7} d={60} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[0,1,2,3].map(i => <SkKPI key={i} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}><SkChart /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[0,1].map(p => (
              <div key={p} style={{ background: '#0e1220', borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <Sk w={90} h={8} r={3} d={p * 80} />
                <div style={{ marginTop: 14 }}>
                  {[0,1,2,3].map(i => <SkRow key={i} d={p * 80 + i * 45} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage dots ──────────────────────────────────────────────── */

const STAGE_ORDER: Exclude<LoadStage, 'done' | 'error'>[] = ['auth','permissions','dashboard','finalize']
const STAGE_LABEL = { auth:'Auth', permissions:'Config', dashboard:'Data', finalize:'Ready' }

function StageDots({ current }: { current: LoadStage }) {
  const idx = STAGE_ORDER.indexOf(current as any)
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STAGE_ORDER.map((s, i) => {
        const done   = i < idx
        const active = i === idx
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: done || active ? '#C9A96E' : 'rgba(255,255,255,0.1)',
                boxShadow: active ? '0 0 0 3px rgba(201,169,110,0.18), 0 0 12px rgba(201,169,110,0.55)' : 'none',
                transform: active ? 'scale(1.45)' : 'scale(1)',
                transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
              <span style={{
                fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: done || active ? '#C9A96E' : 'rgba(255,255,255,0.18)',
                transition: 'color 0.4s ease',
                fontFamily: 'Inter, sans-serif',
              }}>
                {STAGE_LABEL[s]}
              </span>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div style={{
                width: 30, height: 1, margin: '0 8px', marginBottom: 16,
                background: i < idx ? '#C9A96E' : 'rgba(255,255,255,0.08)',
                opacity: i < idx ? 0.5 : 1,
                transition: 'background 0.5s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Error card ──────────────────────────────────────────────── */

function ErrorCard({ onRetry, countdown }: { onRetry: () => void; countdown: number }) {
  return (
    <div role="alert" aria-live="assertive" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', animation: 'err-shake 420ms ease-out' }}>
      <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#EF4444" stroke="none"/></svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', margin: 0, letterSpacing: '-0.02em' }}>Unable to connect</p>
        <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.75 }}>
          Network issue — check your connection.<br />
          Auto-retry in <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FCA5A5', fontWeight: 700 }}>{countdown}s</span>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <button autoFocus onClick={onRetry}
          style={{ padding: '11px 0', borderRadius: 8, border: '1px solid rgba(201,169,110,0.35)', background: 'rgba(201,169,110,0.08)', color: '#C9A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.16)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)' }}
        >Retry now</button>
        <button style={{ padding: '9px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#4B5563', fontSize: 12, cursor: 'pointer' }}>
          Open offline snapshot
        </button>
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────── */

interface Props {
  stage: LoadStage
  onRetry?: () => void
  /** Optional one-line descriptor shown beneath the logo. Defaults to the app suite name. */
  subtitle?: string
}

export default function LoadingScreen({ stage, onRetry, subtitle = 'Enterprise Suite' }: Props) {
  const [pct, setPct]                   = useState(0)
  const [logoLoaded, setLogoLoaded]     = useState(false)
  const [bloomReady, setBloomReady]     = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [statusKey, setStatusKey]       = useState(0)
  const [countdown, setCountdown]       = useState(10)
  const [exiting, setExiting]           = useState(false)
  const [gone, setGone]                 = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* Progress bar */
  useEffect(() => {
    if (stage === 'error' || stage === 'done') return
    const meta = STAGE_META[stage as keyof typeof STAGE_META]
    if (!meta) return
    const t = setTimeout(() => setPct(meta.pct), 120)
    setStatusKey(k => k + 1)
    return () => clearTimeout(t)
  }, [stage])

  /* Skeleton preview during finalize */
  useEffect(() => {
    if (stage !== 'finalize') return
    const t = setTimeout(() => setShowSkeleton(true), 650)
    return () => clearTimeout(t)
  }, [stage])

  /* Bloom flash once logo loads */
  const handleLogoLoad = () => {
    setLogoLoaded(true)
    setTimeout(() => setBloomReady(true), 200)
  }

  /* Exit sequence:
     t=0   stage='done' → pct→100
     t=320 slide-left begins (580ms)
     t=900 unmount                   */
  useEffect(() => {
    if (stage !== 'done') return
    setPct(100)
    const t1 = setTimeout(() => setExiting(true), 320)
    const t2 = setTimeout(() => setGone(true),    920)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [stage])

  /* Error auto-retry */
  useEffect(() => {
    if (stage !== 'error') { setCountdown(10); return }
    intervalRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { onRetry?.(); return 10 } return p - 1 })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [stage, onRetry])

  if (gone) return null

  const isError = stage === 'error'
  const meta    = !isError ? STAGE_META[stage as keyof typeof STAGE_META] : null
  const label   = meta?.label ?? ''

  return (
    <>
      <style>{CSS}</style>

      {/* Skeleton app silhouette — visible during finalize, hidden before exit */}
      {showSkeleton && !exiting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none', filter: 'blur(5px) brightness(0.4) saturate(0.15)', transform: 'scale(1.04)' }}>
          <SkeletonApp />
        </div>
      )}

      {/* ── Screen — slides left as one rigid panel on exit ───── */}
      <div
        role="status"
        aria-live="polite"
        aria-label={isError ? 'Connection failed' : label}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#07090f',
          willChange: 'transform',
          animation: exiting ? 'slide-left 580ms cubic-bezier(0.76,0,0.24,1) both' : undefined,
        }}
      >
        {/* Subtle noise grain */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, opacity: 0.8 }} />

        {/* Gold bloom — flashes in when logo loads, then breathes */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 580, height: 360, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.04) 50%, transparent 75%)',
          animation: bloomReady
            ? 'bloom-breathe 5s ease-in-out 0.4s infinite'
            : logoLoaded
              ? 'bloom-flash 900ms ease-out both'
              : 'none',
        }} />

        {/* Edge vignette */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)' }} />

        {/* ── Composition ───────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 460, padding: '0 36px' }}>

          {/* Logo */}
          <div style={{ animation: 'logo-in 900ms cubic-bezier(0.16,1,0.3,1) 60ms both' }}>
            {!logoLoaded && (
              <div style={{ width: 272, height: 72, borderRadius: 6, background: 'linear-gradient(90deg,rgba(201,169,110,0.04) 25%,rgba(201,169,110,0.08) 50%,rgba(201,169,110,0.04) 75%)', backgroundSize: '400% 100%', animation: 'sk-shimmer 1600ms ease-in-out infinite' }} />
            )}
            <img
              src={logoSrc}
              alt="COFKANS"
              onLoad={handleLogoLoad}
              style={{
                width: 272,
                display: logoLoaded ? 'block' : 'none',
                filter: 'drop-shadow(0 0 32px rgba(201,169,110,0.32)) drop-shadow(0 4px 8px rgba(0,0,0,0.75))',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          </div>

          {/* Subtitle */}
          <p style={{
            margin: '18px 0 0',
            fontSize: 9, fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(201,169,110,0.4)',
            fontFamily: 'Inter, sans-serif',
            animation: 'sub-in 800ms cubic-bezier(0.16,1,0.3,1) 280ms both',
          }}>
            {subtitle}
          </p>

          {/* Ornamental divider */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 24px', animation: 'ctrl-in 600ms ease-out 500ms both' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.2))', transformOrigin: 'left', animation: 'line-draw 700ms cubic-bezier(0.16,1,0.3,1) 500ms both' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 0.5L5.2 2.8L7.5 4L5.2 5.2L4 7.5L2.8 5.2L0.5 4L2.8 2.8Z" fill="rgba(201,169,110,0.45)" />
            </svg>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,169,110,0.2))', transformOrigin: 'right', animation: 'line-draw 700ms cubic-bezier(0.16,1,0.3,1) 500ms both' }} />
          </div>

          {/* Error or loading controls */}
          {isError ? (
            <ErrorCard onRetry={() => onRetry?.()} countdown={countdown} />
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, animation: 'ctrl-in 600ms ease-out 640ms both' }}>

              {/* Progress bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Track */}
                <div style={{ position: 'relative', width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'visible' }}>
                  {/* Fill */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${pct}%`,
                    borderRadius: 1,
                    /* Animated sheen over the fill */
                    background: 'linear-gradient(90deg, #9A733C 0%, #C9A96E 40%, #E2C992 60%, #C9A96E 80%, #9A733C 100%)',
                    backgroundSize: '200% 100%',
                    animation: pct === 100
                      ? 'bar-done 550ms ease-out both'
                      : 'bar-sheen 2.2s linear infinite',
                    transition: 'width 640ms cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    {/* Leading glow dot */}
                    {pct > 0 && pct < 100 && (
                      <div style={{
                        position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)',
                        width: 5, height: 5, borderRadius: '50%', background: '#E2C992',
                        animation: 'dot-pulse 1.8s ease-in-out infinite',
                      }} />
                    )}
                    {/* Checkmark ring at 100% */}
                    {pct === 100 && !exiting && (
                      <div style={{
                        position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'check-pop 360ms cubic-bezier(0.34,1.56,0.64,1) both',
                      }}>
                        <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.8 7L7.5 2" stroke="#E2C992" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Label + percentage */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    key={statusKey}
                    aria-live="polite"
                    style={{ fontSize: 11, color: 'rgba(168,180,196,0.55)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em', animation: 'status-swap 300ms ease-out both' }}
                  >
                    {pct === 100 ? 'Opening…' : label}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: 'rgba(201,169,110,0.6)', letterSpacing: '0.06em' }}>
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>

              {/* Stage progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StageDots current={stage} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div style={{
          position: 'absolute', bottom: 22, left: 0, right: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          animation: 'ctrl-in 500ms ease-out 1000ms both',
        }}>
          {['COFKANS', 'v2.4.1', '© 2024'].map((t, i) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.1em' }}>{t}</span>
              {i < 2 && <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
