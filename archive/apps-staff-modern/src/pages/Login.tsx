import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import logoSrc from '../imports/cofkans-BFw8TZ-5.png'

interface Props {
  onLogin?: () => void
  onSubmit?: (email: string, password: string) => Promise<void>
  resetPassword?: (email: string) => Promise<void>
  externalError?: string | null
}

const CSS = `
  @keyframes lp-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-logo {
    from { opacity: 0; transform: scale(0.92); filter: blur(8px); }
    to   { opacity: 1; transform: scale(1);    filter: blur(0); }
  }
  @keyframes lp-err {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-spin { to { transform: rotate(360deg); } }
  @keyframes lp-shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes lp-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
    70%      { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
  }

  .lp-input {
    width: 100%;
    height: 50px;
    border-radius: 12px;
    border: 1.5px solid #E8EBF0;
    background: #F7F8FA;
    padding: 0 14px 0 46px;
    font-size: 14px;
    font-family: Inter, sans-serif;
    color: #0A0F1E;
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
    letter-spacing: -0.01em;
  }
  .lp-input::placeholder { color: #B8BFC9; }
  .lp-input:focus {
    border-color: #16A34A;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(22,163,74,0.09);
  }
  .lp-input.err {
    border-color: #F87171;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
  }
  .lp-input:disabled { opacity: 0.45; cursor: not-allowed; }

  .lp-btn {
    width: 100%;
    height: 52px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #15803D 0%, #16A34A 60%, #22C55E 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: Inter, sans-serif;
    letter-spacing: -0.02em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.18s, transform 0.14s, box-shadow 0.18s;
    box-shadow: 0 4px 20px rgba(22,163,74,0.3), 0 1px 3px rgba(22,163,74,0.2);
  }
  .lp-btn:hover:not(:disabled) {
    opacity: 0.93;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(22,163,74,0.36), 0 2px 6px rgba(22,163,74,0.22);
  }
  .lp-btn:active:not(:disabled) { transform: translateY(0); }
  .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .lp-forgot {
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: Inter, sans-serif; font-size: 12.5px; font-weight: 500;
    color: #16A34A; transition: opacity 0.15s;
  }
  .lp-forgot:hover { opacity: 0.75; }

  .lp-eye {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; padding: 5px; cursor: pointer;
    display: flex; align-items: center; color: #B8BFC9; transition: color 0.15s;
  }
  .lp-eye:hover { color: #6B7280; }
`

export default function Login({ onLogin, onSubmit, resetPassword, externalError }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [shaking, setShaking]   = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [pwdFocus, setPwdFocus]     = useState(false)

  useEffect(() => {
    if (externalError) setError(externalError)
  }, [externalError])

  const triggerError = (msg: string) => {
    setError(msg); setShaking(true)
    setTimeout(() => setShaking(false), 440)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim())        { triggerError('Email address is required.'); return }
    if (!email.includes('@')) { triggerError('Please enter a valid email address.'); return }
    if (!password.trim())     { triggerError('Password is required.'); return }
    setError('')
    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(email.trim(), password)
      } else {
        await new Promise(r => setTimeout(r, 1600))
        onLogin?.()
      }
    } catch (err) {
      triggerError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetPassword) return
    if (!email.trim()) { triggerError('Enter your email address first.'); return }
    setLoading(true)
    try {
      await resetPassword(email.trim())
      triggerError('Password reset link sent. Check your email.')
    } catch (err) {
      triggerError(err instanceof Error ? err.message : 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>

      {/* Page background */}
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 40%, #E8EDF5 0%, #DDE1EA 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Card ─────────────────────────────────────────── */}
        <div style={{
          width: '100%', maxWidth: 420,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.1), 0 40px 80px rgba(0,0,0,0.08)',
          animation: 'lp-in 650ms cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* ── Logo header — dark container ─────────────────── */}
          <div style={{
            padding: '40px 32px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: '#0D1117',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Radial glow behind crest */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -56%)',
              width: 320, height: 320, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(201,169,110,0.13) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <img
              src={logoSrc}
              alt="COFKANS"
              style={{
                width: 148, height: 'auto',
                display: 'block', position: 'relative',
                marginBottom: 20,
                filter: 'drop-shadow(0 8px 32px rgba(201,169,110,0.28)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                userSelect: 'none',
              }}
            />
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 5 }}>
                COFKANS <span style={{ color: '#4ADE80' }}>ELECTRICALS</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Enterprise Resource Portal
              </div>
            </div>
          </div>

          {/* Card form area */}
          <div style={{ padding: '26px 32px 0' }}>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{
                margin: '0 0 5px',
                fontSize: 22, fontWeight: 800,
                color: '#0A0F1E', letterSpacing: '-0.035em', lineHeight: 1.15,
              }}>
                Sign in
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: '#6B7280', lineHeight: 1.6 }}>
                Enter your credentials to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" aria-live="assertive" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10, marginBottom: 20,
                background: '#FEF2F2', border: '1px solid #FECACA',
                animation: 'lp-err 220ms ease both',
              }}>
                <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                display: 'flex', flexDirection: 'column', gap: 14,
                animation: shaking ? 'lp-shake 440ms ease-out' : undefined,
              }}
            >
              {/* Email */}
              <div>
                <label htmlFor="lp-email" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
                    color: emailFocus ? '#16A34A' : '#C4CAD4', pointerEvents: 'none', transition: 'color 0.18s',
                  }} />
                  <input
                    id="lp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="yourname@cofkans.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    disabled={loading}
                    className={`lp-input${error ? ' err' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label htmlFor="lp-pwd" style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>
                    Password
                  </label>
                  <button type="button" className="lp-forgot" onClick={handleForgotPassword}>Forgot password?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
                    color: pwdFocus ? '#16A34A' : '#C4CAD4', pointerEvents: 'none', transition: 'color 0.18s',
                  }} />
                  <input
                    id="lp-pwd"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError('') }}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                    disabled={loading}
                    className={`lp-input${error ? ' err' : ''}`}
                    style={{ paddingRight: 46 } as React.CSSProperties}
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowPwd(v => !v)} aria-label={showPwd ? 'Hide' : 'Show'}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="lp-btn" style={{ marginTop: 6 }}>
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'lp-spin 0.7s linear infinite' }}>
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Authenticating…
                  </>
                ) : (
                  <>Access Portal <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Card footer */}
          <div style={{
            margin: '24px 0 0',
            padding: '14px 32px',
            borderTop: '1px solid #F0F2F6',
            background: '#F8F9FB',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ShieldCheck size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.5 }}>
              Encrypted · Role-based access control
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                background: '#4ADE80', boxShadow: '0 0 4px #4ADE80',
                animation: 'lp-pulse 2.2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 10.5, color: '#B0B8C4', fontFamily: 'JetBrains Mono, monospace' }}>v2.4.1</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
