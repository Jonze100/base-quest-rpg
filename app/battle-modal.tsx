'use client'
import { useEffect, useState } from 'react'

const PHASES = ['countdown', 'clash', 'result'] as const
type Phase = typeof PHASES[number]

const winLines = [
  (h: string, m: string) => `${h} obliterates the ${m} in one devastating strike!`,
  (h: string, m: string) => `The ${m} never stood a chance against ${h}!`,
  (h: string, m: string) => `${h} is UNSTOPPABLE — the ${m} crumbles!`,
  (h: string, m: string) => `FLAWLESS! ${h} dominates the ${m}!`,
]
const loseLines = [
  (h: string, m: string) => `The ${m} was too powerful — ${h} falls!`,
  (h: string, m: string) => `${h} underestimated the ${m}. Train harder!`,
  (h: string, m: string) => `The ${m} wins this round — come back stronger!`,
]

interface Props {
  heroName: string
  monsterName: string
  monsterEmoji: string
  heroEmoji: string
  won: boolean
  xp: number
  onClose: () => void
}

export function BattleModal({ heroName, monsterName, monsterEmoji, heroEmoji, won, xp, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [count, setCount] = useState(3)
  const [shake, setShake] = useState(false)
  const [story] = useState(() => {
    const lines = won ? winLines : loseLines
    return lines[Math.floor(Math.random() * lines.length)](heroName, monsterName)
  })

  useEffect(() => {
    const t1 = setTimeout(() => setCount(2), 600)
    const t2 = setTimeout(() => setCount(1), 1200)
    const t3 = setTimeout(() => { setPhase('clash'); setShake(true) }, 1800)
    const t4 = setTimeout(() => setShake(false), 2400)
    const t5 = setTimeout(() => setPhase('result'), 2800)
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout)
  }, [])

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  }

  const modalStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a0a1a 0%, #0e0e2a 100%)',
    border: `2px solid ${won ? '#10b981' : '#ef4444'}`,
    borderRadius: '20px',
    padding: '48px 56px',
    textAlign: 'center',
    maxWidth: '520px',
    width: '90%',
    position: 'relative',
    boxShadow: `0 0 80px ${won ? '#10b98133' : '#ef444433'}, 0 0 200px ${won ? '#10b98111' : '#ef444411'}`,
    animation: shake ? 'shake 0.4s ease-in-out' : 'fadeIn 0.3s ease',
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-12px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
        @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{text-shadow:0 0 20px currentColor} 50%{text-shadow:0 0 40px currentColor,0 0 80px currentColor} }
        @keyframes countDown { 0%{transform:scale(1.5);opacity:0} 30%{opacity:1} 100%{transform:scale(0.8);opacity:0} }
        @keyframes clashSpark { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(2) rotate(180deg);opacity:0} }
        @keyframes heroSlideIn { from{transform:translateX(-60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes monsterSlideIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes victoryBounce { 0%{transform:translateY(0)} 30%{transform:translateY(-20px)} 60%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
        @keyframes xpPop { 0%{transform:scale(0) translateY(0);opacity:0} 50%{transform:scale(1.3) translateY(-10px);opacity:1} 100%{transform:scale(1) translateY(-20px);opacity:0.8} }
      `}</style>
      <div style={overlay} onClick={phase === 'result' ? onClose : undefined}>
        <div style={modalStyle}>

          {/* COUNTDOWN PHASE */}
          {phase === 'countdown' && (
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '32px' }}>Battle Starting</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                <div style={{ animation: 'heroSlideIn 0.4s ease forwards' }}>
                  <div style={{ fontSize: '64px', marginBottom: '8px' }}>{heroEmoji}</div>
                  <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: 700 }}>{heroName}</div>
                </div>
                <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: 900, animation: 'pulse 0.6s ease infinite' }}>VS</div>
                <div style={{ animation: 'monsterSlideIn 0.4s ease forwards' }}>
                  <div style={{ fontSize: '64px', marginBottom: '8px' }}>{monsterEmoji}</div>
                  <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700 }}>{monsterName}</div>
                </div>
              </div>
              <div key={count} style={{ fontSize: '96px', fontWeight: 900, color: '#f59e0b', animation: 'countDown 0.6s ease forwards', lineHeight: 1 }}>
                {count}
              </div>
            </div>
          )}

          {/* CLASH PHASE */}
          {phase === 'clash' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                <div style={{ fontSize: '72px', animation: 'heroSlideIn 0.2s ease' }}>{heroEmoji}</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}>
                  <div style={{ position: 'absolute', fontSize: '48px', animation: 'clashSpark 0.6s ease forwards' }}>💥</div>
                  <div style={{ position: 'absolute', fontSize: '32px', animation: 'clashSpark 0.6s 0.1s ease forwards', opacity: 0 }}>⚡</div>
                </div>
                <div style={{ fontSize: '72px', animation: 'monsterSlideIn 0.2s ease' }}>{monsterEmoji}</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b', animation: 'pulse 0.3s ease infinite', letterSpacing: '4px' }}>
                CLASH!
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {['⚔️','🗡️','🔥','⚡','💥'].map((e,i) => (
                  <span key={i} style={{ fontSize: '20px', animation: `spin ${0.3 + i*0.1}s linear infinite` }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && (
            <div>
              <div style={{ fontSize: won ? '80px' : '64px', marginBottom: '16px', animation: won ? 'victoryBounce 0.6s ease' : 'bounceIn 0.5s ease' }}>
                {won ? '🏆' : '💀'}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: won ? '#10b981' : '#ef4444', marginBottom: '8px', animation: 'glow 2s ease infinite' }}>
                {won ? 'VICTORY!' : 'DEFEATED!'}
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px', lineHeight: 1.6, animation: 'slideUp 0.4s 0.2s ease both' }}>
                {story}
              </div>
              {won && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #065f46, #047857)', border: '1px solid #10b981', borderRadius: '12px', padding: '12px 24px', marginBottom: '24px', animation: 'bounceIn 0.5s 0.3s ease both' }}>
                  <span style={{ fontSize: '20px' }}>⭐</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>+{xp} XP</span>
                  <span style={{ fontSize: '13px', color: '#6ee7b7' }}>Hero grows stronger!</span>
                </div>
              )}
              {!won && (
                <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '12px 24px', marginBottom: '24px', animation: 'slideUp 0.4s 0.3s ease both' }}>
                  <span style={{ fontSize: '13px', color: '#fca5a5' }}>Complete daily quests to level up and return stronger!</span>
                </div>
              )}
              <button onClick={onClose} style={{ background: won ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #b91c1c, #ef4444)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 40px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', animation: 'slideUp 0.4s 0.5s ease both', letterSpacing: '1px' }}>
                {won ? 'CONTINUE ⚔️' : 'TRY AGAIN 🔄'}
              </button>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#374151' }}>tap anywhere to close</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
