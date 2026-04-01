export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <html><body style={{ background: '#060610', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '48px' }}>⚔️</div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Page not found</h1>
      <a href="/" style={{ color: '#a09af0', fontSize: '14px' }}>← Back to Nexus RPG</a>
    </body></html>
  )
}
