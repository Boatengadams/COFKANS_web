interface Props { onClick: () => void }

export default function GlowEdge({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title="Open navigation"
      aria-label="Open navigation menu"
      style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: 4,
        zIndex: 35,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(22,163,74,0.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    />
  )
}
