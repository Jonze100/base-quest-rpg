'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useState } from 'react'

const MASTER_ABI = [
  { name: 'createHero', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_name', type: 'string' }], outputs: [] },
  { name: 'battle', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_monsterId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'claimDailyLogin', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getHero', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'name', type: 'string' }, { name: 'strength', type: 'uint256' }, { name: 'hp', type: 'uint256' }, { name: 'level', type: 'uint256' }, { name: 'xp', type: 'uint256' }, { name: 'totalXpEarned', type: 'uint256' }] }] },
  { name: 'hasHero', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'getXPProgress', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: 'current', type: 'uint256' }, { name: 'needed', type: 'uint256' }] },
  { name: 'getLastBattle', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'heroName', type: 'string' }, { name: 'monsterName', type: 'string' }, { name: 'heroWon', type: 'bool' }, { name: 'xpEarned', type: 'uint256' }, { name: 'message', type: 'string' }] }] },
  { name: 'getPlayerProgress', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: 'battlesToday', type: 'uint256' }, { name: 'loginStreak', type: 'uint256' }, { name: 'totalLogins', type: 'uint256' }, { name: 'questsCompleted', type: 'uint256' }, { name: 'claimedLoginToday', type: 'bool' }, { name: 'totalWins', type: 'uint256' }, { name: 'totalLosses', type: 'uint256' }] },
  { name: 'getQuestStatus', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: 'names', type: 'string[]' }, { name: 'descriptions', type: 'string[]' }, { name: 'required', type: 'uint256[]' }, { name: 'rewards', type: 'uint256[]' }, { name: 'completed', type: 'bool[]' }] },
] as const

const PROFILE_ABI = [
  { name: 'createProfile', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_username', type: 'string' }, { name: '_xHandle', type: 'string' }, { name: '_farcasterHandle', type: 'string' }, { name: '_avatarEmoji', type: 'string' }], outputs: [] },
  { name: 'updateProfile', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_xHandle', type: 'string' }, { name: '_farcasterHandle', type: 'string' }, { name: '_avatarEmoji', type: 'string' }], outputs: [] },
  { name: 'getProfile', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'username', type: 'string' }, { name: 'xHandle', type: 'string' }, { name: 'farcasterHandle', type: 'string' }, { name: 'avatarEmoji', type: 'string' }, { name: 'exists', type: 'bool' }, { name: 'createdAt', type: 'uint256' }, { name: 'updatedAt', type: 'uint256' }] }] },
  { name: 'getUsername', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'string' }] },
] as const

const LOOT_ABI = [
  { name: 'rollLoot', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_player', type: 'address' }], outputs: [] },
  { name: 'getInventory', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'tuple[]', components: [{ name: 'name', type: 'string' }, { name: 'powerBoost', type: 'uint256' }, { name: 'rarity', type: 'uint256' }] }] },
] as const

const PRIZEPOOL_ABI = [
  { name: 'createRoom', type: 'function', stateMutability: 'payable', inputs: [], outputs: [{ name: '', type: 'uint256' }, { name: '', type: 'string' }] },
  { name: 'joinRoomByCode', type: 'function', stateMutability: 'payable', inputs: [{ name: '_code', type: 'string' }], outputs: [] },
  { name: 'withdraw', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getOpenRooms', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256[]' }] },
  { name: 'getPlayerStats', type: 'function', stateMutability: 'view', inputs: [{ name: '_player', type: 'address' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'totalWins', type: 'uint256' }, { name: 'totalLosses', type: 'uint256' }, { name: 'totalEarned', type: 'uint256' }, { name: 'currentStreak', type: 'uint256' }, { name: 'bestStreak', type: 'uint256' }] }] },
  { name: 'pendingWithdrawals', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'rooms', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }], outputs: [{ name: 'player1', type: 'address' }, { name: 'player2', type: 'address' }, { name: 'prizePool', type: 'uint256' }, { name: 'active', type: 'bool' }, { name: 'completed', type: 'bool' }, { name: 'winner', type: 'address' }, { name: 'createdAt', type: 'uint256' }, { name: 'roomCode', type: 'string' }] },
] as const

const TOURNAMENT_ABI = [
  { name: 'register', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'getLeaderboard', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: 'players', type: 'address[10]' }, { name: 'wins', type: 'uint256[10]' }] },
  { name: 'getWeekInfo', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: 'startTime', type: 'uint256' }, { name: 'endTime', type: 'uint256' }, { name: 'prizePool', type: 'uint256' }, { name: 'distributed', type: 'bool' }] },
  { name: 'getTimeRemaining', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
] as const

const MASTER = process.env.NEXT_PUBLIC_MASTER_CONTRACT as string
const LOOT = process.env.NEXT_PUBLIC_LOOT_CONTRACT as string
const PRIZEPOOL = process.env.NEXT_PUBLIC_PRIZEPOOL_CONTRACT as string
const TOURNAMENT = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT as string
const PROFILE = process.env.NEXT_PUBLIC_PROFILE_CONTRACT as string
const ENTRY_FEE = BigInt('100000000000000')
const AVATARS = ['⚔️','🧙','🛡️','🏹','🐉','💀','👑','🔥','⚡','🌙','🦅','🐺','🦁','🌊','💎','🍀']

const monsters = [
  { id: 0, name: 'Goblin', hp: 30, str: 5, xp: 25, diff: 'Easy', color: '#10b981', emoji: '👺' },
  { id: 1, name: 'Orc', hp: 60, str: 10, xp: 50, diff: 'Medium', color: '#f59e0b', emoji: '👹' },
  { id: 2, name: 'Dragon', hp: 150, str: 25, xp: 100, diff: 'Hard', color: '#ef4444', emoji: '🐉' },
]
const winStories = [
  (h: string, m: string) => `⚔️ ${h} charges forward and strikes the ${m} down with one decisive blow!`,
  (h: string, m: string) => `🗡️ ${h} outmaneuvered every attack — the ${m} never stood a chance!`,
  (h: string, m: string) => `💥 ${h} unleashed a devastating combo — the ${m} crumbled!`,
  (h: string, m: string) => `🏆 ${h} dominated the ${m} from start to finish. A flawless victory!`,
]
const loseStories = [
  (h: string, m: string) => `💀 The ${m} was too powerful — ${h} fought bravely but fell.`,
  (h: string, m: string) => `🔥 The ${m}'s fury was overwhelming. Level up and try again!`,
  (h: string, m: string) => `😤 ${h} underestimated the ${m}. Train harder and return!`,
]

const ZERO = '0x0000000000000000000000000000000000000000'
const short = (a: string) => a && a !== ZERO ? a.slice(0,6)+'...'+a.slice(-4) : '—'
const fmtEth = (wei: bigint) => (Number(wei)/1e18).toFixed(4)
const rarityColor = (r: number, dark: boolean) => r===3?'#f59e0b':r===2?'#3b82f6':dark?'#6b7280':'#9ca3af'
const rarityLabel = (r: number) => r===3?'Legendary':r===2?'Rare':'Common'
const medals = ['🥇','🥈','🥉','4','5','6','7','8','9','10']
const fmtTime = (s: bigint) => { const n=Number(s); return Math.floor(n/86400)+'d '+Math.floor((n%86400)/3600)+'h '+Math.floor((n%3600)/60)+'m' }

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'hero', label: 'My Hero', icon: '⚔️' },
  { id: 'battle', label: 'Battle', icon: '⚡' },
  { id: 'prizepool', label: 'Prize Pool', icon: '💰' },
  { id: 'tournament', label: 'Tournament', icon: '🏆' },
  { id: 'quests', label: 'Daily Quests', icon: '📋' },
  { id: 'loot', label: 'Loot & Inventory', icon: '🎲' },
]

function RoomRow({ roomId, address, writeContract, isPending, setMsg, dark }: any) {
  const { data: room } = useReadContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'rooms', args: [roomId], query: { enabled: true } })
  const { data: creatorName } = useReadContract({ address: PROFILE as any, abi: PROFILE_ABI, functionName: 'getUsername', args: room ? [room[0]] : undefined, query: { enabled: !!room } })
  const [copied, setCopied] = useState(false)
  if (!room || !room[3]) return null
  const isOwn = room[0].toLowerCase() === address?.toLowerCase()
  const code = room[7] as string
  const name = creatorName || short(room[0])
  function copyCode() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const b = dark ? '#2d2d3a' : '#e5e7eb'
  const bg = dark ? '#13131f' : '#f9fafb'
  const codeBg = dark ? '#1e1e30' : '#eef2ff'
  return (
    <div style={{ background: bg, border: `1px solid ${b}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: codeBg, border: `1px solid ${dark?'#3d3d6a':'#c7d2fe'}`, borderRadius: '8px', padding: '5px 12px', fontFamily: 'monospace', fontSize: '17px', fontWeight: 700, color: dark?'#818cf8':'#4f46e5', letterSpacing: '4px' }}>{code}</div>
        <div>
          <div style={{ fontSize: '13px', color: dark?'#e0e0e0':'#111827', fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '11px', color: dark?'#6b7280':'#9ca3af', marginTop: '2px' }}>Pot: {fmtEth(room[2])} ETH</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#10b981', background: dark?'#052e16':'#ecfdf5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #10b981', fontWeight: 600 }}>Open</span>
        <button onClick={copyCode} style={{ background: copied?(dark?'#052e16':'#ecfdf5'):(dark?'#1e1e30':'#eef2ff'), color: copied?'#10b981':(dark?'#818cf8':'#4f46e5'), border: `1px solid ${copied?'#10b981':(dark?'#3d3d6a':'#c7d2fe')}`, borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
          {copied ? '✅ Copied' : 'Copy Code'}
        </button>
        {!isOwn && address ? (
          <button onClick={() => { writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'joinRoomByCode', args: [code], value: ENTRY_FEE }); setMsg('Joining room '+code+'...') }} disabled={isPending} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
            Join & Fight
          </button>
        ) : isOwn ? (
          <span style={{ fontSize: '12px', color: dark?'#6b7280':'#9ca3af', background: dark?'#1a1a2a':'#f3f4f6', padding: '6px 12px', borderRadius: '6px' }}>Your Room</span>
        ) : (
          <span style={{ fontSize: '12px', color: dark?'#4b5563':'#d1d5db', background: dark?'#1a1a2a':'#f3f4f6', padding: '6px 12px', borderRadius: '6px' }}>Connect wallet</span>
        )}
      </div>
    </div>
  )
}

function LeaderboardRow({ addr, wins, rank, dark }: { addr: string, wins: bigint, rank: number, dark: boolean }) {
  const { data: profile } = useReadContract({ address: PROFILE as any, abi: PROFILE_ABI, functionName: 'getProfile', args: [addr as `0x${string}`], query: { enabled: addr !== ZERO } })
  const displayName = profile?.username || short(addr)
  const avatar = profile?.avatarEmoji || ''
  const gold='#f59e0b'; const silver='#94a3b8'; const bronze='#b45309'
  const c = rank===0?gold:rank===1?silver:rank===2?bronze:(dark?'#4b5563':'#9ca3af')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: rank<3?(dark?'#13131f':'#fafafa'):'transparent', borderRadius: '10px', marginBottom: '4px', border: `1px solid ${rank<3?(dark?'#2d2d3a':'#e5e7eb'):'transparent'}` }}>
      <div style={{ width: '28px', fontSize: rank<3?'20px':'13px', fontWeight: 700, color: c, textAlign: 'center' as const }}>{rank<3?medals[rank]:rank+1}</div>
      {avatar && <span style={{ fontSize: '18px' }}>{avatar}</span>}
      <div style={{ flex: 1, fontSize: '14px', color: addr!==ZERO?(dark?'#e0e0e0':'#111827'):(dark?'#374151':'#d1d5db'), fontWeight: addr!==ZERO?600:400 }}>{addr!==ZERO?displayName:'—'}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: c }}>{addr!==ZERO?wins.toString()+' wins':'—'}</div>
    </div>
  )
}

export default function AppClient() {
  const { address, isConnected } = useAccount()
  const [page, setPage] = useState('dashboard')
  const [pageHistory, setPageHistory] = useState<string[]>([])
  const [dark, setDark] = useState(true)
  const [heroName, setHeroName] = useState('')
  const [selectedMonster, setSelectedMonster] = useState(0)
  const [msg, setMsg] = useState('')
  const [showMoreLb, setShowMoreLb] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [battleStory, setBattleStory] = useState('')
  const [localResult, setLocalResult] = useState<{won:boolean,xp:number}|null>(null)
  const [pUsername, setPUsername] = useState('')
  const [pX, setPX] = useState('')
  const [pFarcaster, setPFarcaster] = useState('')
  const [pAvatar, setPAvatar] = useState('⚔️')
  const [profileMsg, setProfileMsg] = useState('')
  const { writeContract, isPending } = useWriteContract()

  function navigate(target: string) {
    setPageHistory(h => [...h, page])
    setPage(target)
    setMsg('')
  }
  function goBack() {
    if (pageHistory.length === 0) return
    const prev = pageHistory[pageHistory.length - 1]
    setPageHistory(h => h.slice(0, -1))
    setPage(prev)
    setMsg('')
  }

  const { data: heroData, refetch: refetchHero } = useReadContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'getHero', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: xpProgress, refetch: refetchXP } = useReadContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'getXPProgress', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: questProgress, refetch: refetchProgress } = useReadContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'getPlayerProgress', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: questStatus, refetch: refetchQuests } = useReadContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'getQuestStatus', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: inventory } = useReadContract({ address: LOOT as any, abi: LOOT_ABI, functionName: 'getInventory', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: openRooms } = useReadContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'getOpenRooms', query: { enabled: true } })
  const { data: playerStats } = useReadContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'getPlayerStats', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: pendingWin } = useReadContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'pendingWithdrawals', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: leaderboard } = useReadContract({ address: TOURNAMENT as any, abi: TOURNAMENT_ABI, functionName: 'getLeaderboard', query: { enabled: true } })
  const { data: weekInfo } = useReadContract({ address: TOURNAMENT as any, abi: TOURNAMENT_ABI, functionName: 'getWeekInfo', query: { enabled: true } })
  const { data: timeRemaining } = useReadContract({ address: TOURNAMENT as any, abi: TOURNAMENT_ABI, functionName: 'getTimeRemaining', query: { enabled: true } })
  const { data: myProfile, refetch: refetchProfile } = useReadContract({ address: PROFILE as any, abi: PROFILE_ABI, functionName: 'getProfile', args: address ? [address] : undefined, query: { enabled: !!address } })

  const loginXp = questProgress ? 20 + (Number(questProgress[1]) * 5) : 20
  const xpPct = xpProgress ? Math.min(100, Math.floor((Number(xpProgress[0]) / Number(xpProgress[1])) * 100)) : 0
  const hasHero = !!heroData?.name
  const hasProfile = myProfile?.exists

  // ── Theme ──
  const T = {
    bg:          dark ? '#0e0e1a' : '#f3f4f6',
    sidebar:     dark ? '#080814' : '#ffffff',
    border:      dark ? '#1e1e2e' : '#e5e7eb',
    card:        dark ? '#13131f' : '#ffffff',
    text:        dark ? '#f1f5f9' : '#111827',
    muted:       dark ? '#6b7280' : '#6b7280',
    subtle:      dark ? '#1e1e30' : '#eef2ff',
    accent:      dark ? '#818cf8' : '#4f46e5',
    inputBg:     dark ? '#0e0e1a' : '#f9fafb',
    inputBorder: dark ? '#2d2d3a' : '#d1d5db',
  }

  function handleBattle() {
    const monster = monsters[selectedMonster]
    const name = heroData?.name || 'Your Hero'
    const heroPower = heroData ? Number(heroData.strength) * Number(heroData.level) : 10
    const won = heroPower >= monster.str
    const stories = won ? winStories : loseStories
    setBattleStory(stories[Math.floor(Math.random() * stories.length)](name, monster.name))
    setLocalResult({ won, xp: won ? monster.xp : 0 })
    writeContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'battle', args: [BigInt(selectedMonster)] }, {
      onSuccess: () => { setTimeout(() => { refetchHero(); refetchXP(); refetchProgress(); refetchQuests() }, 2000); setMsg('Battle complete! XP updated ✅') }
    })
    setMsg('Sending battle to Base...')
  }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({ width: '100%', background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: '8px', padding: '10px 14px', color: T.text, fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const, ...extra })
  const btn = (color: string, disabled = false): React.CSSProperties => ({ border: 'none', padding: '11px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', background: disabled ? (dark ? '#1e1e2e' : '#e5e7eb') : color, color: disabled ? T.muted : '#fff', opacity: disabled ? 0.7 : 1 })
  const sec = (extra?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px', ...extra })
  const lbl: React.CSSProperties = { fontSize: '11px', color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '6px' }
  const statC = (color: string): React.CSSProperties => ({ background: T.subtle, borderRadius: '10px', padding: '14px 16px', borderLeft: `3px solid ${color}` })

  const currentLabel = [...navItems, { id: 'profile', label: 'Profile', icon: '👤' }].find(n => n.id === page)?.label || 'Dashboard'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '228px', background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.5px', color: T.text }}>Nexus <span style={{ color: T.accent }}>RPG</span></div>
          <div style={{ fontSize: '11px', color: T.muted, marginTop: '3px' }}>Onchain · Base Mainnet</div>
        </div>
        <nav style={{ flex: 1, padding: '10px' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: page===item.id?600:400, background: page===item.id?T.subtle:'transparent', color: page===item.id?T.accent:T.muted, marginBottom: '2px', textAlign: 'left' as const }}>
              <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' as const }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: '8px', paddingTop: '8px' }}>
            <button onClick={() => navigate('profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: page==='profile'?600:400, background: page==='profile'?T.subtle:'transparent', color: page==='profile'?T.accent:T.muted, textAlign: 'left' as const }}>
              <span style={{ fontSize: '15px' }}>{myProfile?.exists ? myProfile.avatarEmoji : '👤'}</span>
              {myProfile?.exists ? myProfile.username : 'Profile'}
            </button>
          </div>
        </nav>
        <div style={{ padding: '14px', borderTop: `1px solid ${T.border}` }}>
          <button onClick={() => setDark(!dark)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: T.subtle, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: T.muted }}>
            <span>{dark ? '☀️' : '🌙'}</span>
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── HEADER ── */}
        <header style={{ background: T.sidebar, borderBottom: `1px solid ${T.border}`, padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Back button */}
            {pageHistory.length > 0 && (
              <button onClick={goBack} style={{ background: T.subtle, border: `1px solid ${T.border}`, borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text, fontSize: '16px', flexShrink: 0 }}>
                ←
              </button>
            )}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: T.text }}>{currentLabel}</div>
              {msg && <div style={{ fontSize: '12px', color: T.accent, marginTop: '2px' }}>{msg}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pendingWin && BigInt(pendingWin.toString()) > 0n && (
              <button onClick={() => { writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'withdraw' }); setMsg('Withdrawing...') }} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                💰 Withdraw {fmtEth(BigInt(pendingWin.toString()))} ETH
              </button>
            )}
            {myProfile?.exists && (
              <div style={{ background: T.subtle, border: `1px solid ${T.border}`, borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontSize: '15px' }}>{myProfile.avatarEmoji}</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{myProfile.username}</span>
              </div>
            )}
            <ConnectButton />
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

          {!isConnected && !['dashboard','tournament'].includes(page) && (
            <div style={{ ...sec(), textAlign: 'center', padding: '80px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ color: T.text, marginBottom: '8px', fontSize: '20px' }}>Connect your wallet to continue</h2>
              <p style={{ color: T.muted, fontSize: '14px', marginBottom: '20px' }}>Use the button in the top-right corner to connect MetaMask, Rabby, or Coinbase Wallet.</p>
            </div>
          )}

          {/* ══════════════ DASHBOARD ══════════════ */}
          {page === 'dashboard' && (
            <div>
              {/* ── Not connected: landing ── */}
              {!isConnected && (
                <div>
                  <div style={{ textAlign: 'center', padding: '48px 20px 40px' }}>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>⚔️</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: T.text, marginBottom: '8px' }}>Welcome to Nexus RPG</h1>
                    <p style={{ color: T.muted, fontSize: '15px', maxWidth: '420px', margin: '0 auto 28px' }}>
                      A fully onchain RPG on Base. Create a hero, fight monsters, earn real ETH — all recorded permanently on the blockchain.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: dark ? '#052e16' : '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '10px 18px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                      👆 Connect your wallet in the top-right corner to start playing
                    </div>
                  </div>

                  {/* How it works */}
                  <div style={{ ...sec({ marginBottom: '20px' }) }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '20px' }}>How it works</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[
                        { step: '1', icon: '🔗', title: 'Connect Wallet', desc: 'Use MetaMask, Rabby, or Coinbase Wallet. You need a tiny bit of ETH on Base for gas.' },
                        { step: '2', icon: '⚔️', title: 'Create a Hero', desc: 'Name your hero and mint them onchain. One hero per wallet — they level up forever.' },
                        { step: '3', icon: '⚡', title: 'Battle & Earn XP', desc: 'Fight monsters to earn XP. More XP means higher level and stronger heroes.' },
                        { step: '4', icon: '💰', title: 'Win Real ETH', desc: 'Enter Prize Pool battles. Pay 0.0001 ETH, winner takes 90% of the pot.' },
                      ].map(s => (
                        <div key={s.step} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '24px', height: '24px', background: T.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{s.step}</div>
                            <span style={{ fontSize: '22px' }}>{s.icon}</span>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: T.text }}>{s.title}</div>
                          </div>
                          <div style={{ fontSize: '13px', color: T.muted, lineHeight: '1.5' }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live open rooms anyone can see */}
                  <div style={sec()}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>Live Battle Rooms</div>
                    <div style={{ fontSize: '13px', color: T.muted, marginBottom: '16px' }}>These rooms are open right now. Connect your wallet to join one.</div>
                    {openRooms && (openRooms as bigint[]).length > 0
                      ? (openRooms as bigint[]).map(id => <RoomRow key={id.toString()} roomId={id} address={address} writeContract={writeContract} isPending={isPending} setMsg={setMsg} dark={dark} />)
                      : <div style={{ color: T.muted, fontSize: '13px', textAlign: 'center', padding: '24px', background: T.bg, borderRadius: '10px', border: `1px solid ${T.border}` }}>No open rooms yet — be the first to create one after connecting!</div>}
                  </div>
                </div>
              )}

              {/* ── Connected: personalised dashboard ── */}
              {isConnected && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: T.text, margin: 0 }}>
                      {myProfile?.exists ? `Welcome back, ${myProfile.username} 👋` : 'Welcome to Nexus RPG 👋'}
                    </h1>
                    <p style={{ color: T.muted, fontSize: '14px', marginTop: '5px' }}>
                      {hasHero ? `Your hero is Level ${heroData?.level} — keep grinding to get stronger.` : 'Get started below — your first step is creating a hero.'}
                    </p>
                  </div>

                  {/* ── Onboarding checklist (shown until all 3 steps done) ── */}
                  {(!hasHero || !hasProfile || !questProgress?.[4]) && (
                    <div style={{ ...sec({ marginBottom: '20px', borderColor: dark ? '#3d3d6a' : '#c7d2fe' }) }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>🚀 Get started — complete these steps</div>
                      <div style={{ fontSize: '13px', color: T.muted, marginBottom: '16px' }}>Three things to do before you can battle for real ETH.</div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                        {[
                          { done: hasHero, label: 'Create your hero', sub: 'Name your hero and mint them onchain — they grow with you forever.', page: 'hero', cta: 'Create Hero →' },
                          { done: hasProfile, label: 'Set up your profile', sub: 'Choose a username and avatar so others recognise you on leaderboards.', page: 'profile', cta: 'Set Up Profile →' },
                          { done: Boolean(questProgress?.[4]), label: 'Claim your daily login bonus', sub: 'Log in every day to earn XP — it makes your hero stronger in battles.', page: 'quests', cta: 'Claim Bonus →' },
                        ].map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: s.done ? (dark ? '#052e16' : '#f0fdf4') : T.bg, border: `1px solid ${s.done ? '#10b981' : T.border}`, borderRadius: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.done ? '#10b981' : T.subtle, border: `2px solid ${s.done ? '#10b981' : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                              {s.done ? '✓' : i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: s.done ? '#10b981' : T.text, marginBottom: '2px' }}>{s.label}</div>
                              {!s.done && <div style={{ fontSize: '12px', color: T.muted }}>{s.sub}</div>}
                            </div>
                            {!s.done && (
                              <button onClick={() => navigate(s.page)} style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                                {s.cta}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Hero snapshot (only if hero exists) ── */}
                  {hasHero && heroData && (
                    <div style={{ ...sec({ marginBottom: '20px', padding: '20px 24px' }) }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {myProfile?.exists && <span style={{ fontSize: '36px' }}>{myProfile.avatarEmoji}</span>}
                          <div>
                            <div style={{ fontSize: '17px', fontWeight: 700, color: T.text }}>{heroData.name}</div>
                            <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>Level {heroData.level.toString()} · {heroData.totalXpEarned.toString()} XP earned total</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          {[['STR', heroData.strength.toString(), '#ef4444'], ['HP', heroData.hp.toString(), '#10b981'], ['LVL', heroData.level.toString(), '#f59e0b']].map(([k,v,c]) => (
                            <div key={k} style={{ textAlign: 'center' as const }}>
                              <div style={{ fontSize: '11px', color: T.muted }}>{k}</div>
                              <div style={{ fontSize: '20px', fontWeight: 800, color: c }}>{v}</div>
                            </div>
                          ))}
                          <div style={{ width: '130px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: T.muted, marginBottom: '4px' }}>
                              <span>XP</span><span style={{ color: T.accent }}>{xpProgress ? xpProgress[0]+'/'+xpProgress[1] : '—'}</span>
                            </div>
                            <div style={{ background: T.inputBg, borderRadius: '4px', height: '6px', overflow: 'hidden', border: `1px solid ${T.inputBorder}` }}>
                              <div style={{ background: `linear-gradient(90deg, ${T.accent}, #10b981)`, height: '100%', width: xpPct+'%', transition: 'width 0.5s' }} />
                            </div>
                          </div>
                          <button onClick={() => navigate('hero')} style={{ background: T.subtle, border: `1px solid ${T.border}`, color: T.accent, borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>View →</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Main 2-col grid ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Open rooms */}
                    <div style={sec()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: T.text }}>Open Battle Rooms</div>
                          <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>Enter a code from a friend, or create your own room</div>
                        </div>
                        <button onClick={() => navigate('prizepool')} style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>+ Create</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        <input value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())} placeholder="Enter code e.g. WNW9" maxLength={4} style={{ ...inp({ marginBottom: 0, flex: 1, fontFamily: 'monospace', fontSize: '16px', letterSpacing: '3px', textAlign: 'center', fontWeight: 700 }) }} />
                        <button onClick={() => { if (!manualCode || !address) return; writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'joinRoomByCode', args: [manualCode.toUpperCase()], value: ENTRY_FEE }); setMsg('Joining room...') }} style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Join</button>
                      </div>
                      {openRooms && (openRooms as bigint[]).length > 0
                        ? (openRooms as bigint[]).map(id => <RoomRow key={id.toString()} roomId={id} address={address} writeContract={writeContract} isPending={isPending} setMsg={setMsg} dark={dark} />)
                        : <div style={{ color: T.muted, fontSize: '13px', textAlign: 'center', padding: '20px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}` }}>No open rooms — create one and share your code!</div>}
                    </div>

                    {/* Leaderboard */}
                    <div style={sec()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: T.text }}>Weekly Leaderboard</div>
                          {weekInfo && <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>Prize: {fmtEth(weekInfo[2])} ETH · {timeRemaining ? fmtTime(timeRemaining) : '—'} left</div>}
                        </div>
                        <button onClick={() => navigate('tournament')} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.accent, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Full table →</button>
                      </div>
                      {leaderboard
                        ? [0,1,2].map(i => <LeaderboardRow key={i} addr={leaderboard[0][i]} wins={leaderboard[1][i]} rank={i} dark={dark} />)
                        : <div style={{ color: T.muted, textAlign: 'center', padding: '24px', fontSize: '13px' }}>No players yet — register to be first!</div>}
                    </div>
                  </div>

                  {/* ── Quick actions (only after hero created) ── */}
                  {hasHero && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      {[
                        { icon: '⚡', label: 'Battle a Monster', sub: 'Earn XP · level up · get stronger for Prize Pool', color: '#ef4444', page: 'battle' },
                        { icon: '📋', label: 'Daily Quests', sub: questProgress?.[4] ? '✅ Login bonus claimed today' : '⏰ Login bonus available now!', color: '#f59e0b', page: 'quests' },
                        { icon: '🎲', label: 'Roll for Loot', sub: `${inventory?.length ?? 0} items in inventory`, color: '#8b5cf6', page: 'loot' },
                      ].map(item => (
                        <button key={item.page} onClick={() => navigate(item.page)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <span style={{ fontSize: '26px', lineHeight: 1, marginTop: '2px' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '12px', color: item.sub.startsWith('✅') ? '#10b981' : item.sub.startsWith('⏰') ? '#f59e0b' : T.muted }}>{item.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ HERO ══════════════ */}
          {page === 'hero' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Create Your Hero</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>One hero per wallet. XP from battles and quests makes you stronger over time.</p>
                <span style={lbl}>Hero Name</span>
                <input value={heroName} onChange={e => setHeroName(e.target.value)} placeholder="e.g. Shadowblade" style={inp()} />
                <button onClick={() => { if (!heroName) { setMsg('Enter a hero name!'); return }; writeContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'createHero', args: [heroName] }); setMsg('Creating hero...') }} disabled={isPending} style={btn(T.accent)}>
                  {isPending ? 'Confirming...' : 'Create Hero on Base'}
                </button>
              </div>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '20px', fontSize: '16px' }}>Your Hero</h3>
                {heroData?.name ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', background: T.bg, borderRadius: '10px', padding: '16px', border: `1px solid ${T.border}` }}>
                      {myProfile?.exists && <span style={{ fontSize: '40px' }}>{myProfile.avatarEmoji}</span>}
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: T.text }}>{heroData.name}</div>
                        {myProfile?.exists && <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>@{myProfile.username}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      {[['Strength', heroData.strength.toString(), '#ef4444'], ['HP', heroData.hp.toString(), '#10b981'], ['Level', heroData.level.toString(), '#f59e0b'], ['Total XP', heroData.totalXpEarned.toString(), T.accent]].map(([k,v,c]) => (
                        <div key={k} style={{ background: T.bg, borderRadius: '8px', padding: '12px 14px', border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: '11px', color: T.muted }}>{k}</div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {xpProgress && (
                      <div style={{ background: T.bg, borderRadius: '8px', padding: '14px', border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                          <span style={{ color: T.muted }}>XP to next level</span>
                          <span style={{ color: T.accent, fontWeight: 600 }}>{xpProgress[0].toString()} / {xpProgress[1].toString()}</span>
                        </div>
                        <div style={{ background: T.inputBg, borderRadius: '4px', height: '8px', overflow: 'hidden', border: `1px solid ${T.inputBorder}` }}>
                          <div style={{ background: `linear-gradient(90deg, ${T.accent}, #10b981)`, height: '100%', width: xpPct+'%', transition: 'width 0.5s' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: T.muted, marginTop: '8px' }}>Each level up gives +5 STR and +20 HP</div>
                      </div>
                    )}
                  </div>
                ) : <div style={{ color: T.muted, textAlign: 'center', padding: '48px', fontSize: '14px' }}>No hero yet — create one on the left!</div>}
              </div>
            </div>
          )}

          {/* ══════════════ BATTLE ══════════════ */}
          {page === 'battle' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Choose Your Enemy</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Win battles to earn XP and level up your hero</p>
                {monsters.map(m => (
                  <div key={m.id} onClick={() => setSelectedMonster(m.id)} style={{ background: selectedMonster===m.id?T.subtle:T.bg, border: `1px solid ${selectedMonster===m.id?T.accent:T.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px' }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: T.text, fontSize: '15px' }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>HP {m.hp} · STR {m.str} · +{m.xp} XP on win</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${m.color}`, color: m.color, fontWeight: 600 }}>{m.diff}</span>
                  </div>
                ))}
                {heroData?.name && (
                  <div style={{ background: T.bg, borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '13px', border: `1px solid ${T.border}` }}>
                    <span style={{ color: T.muted }}>Your power: </span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{Number(heroData.strength) * Number(heroData.level)}</span>
                    <span style={{ color: T.muted }}> vs monster STR: </span>
                    <span style={{ color: monsters[selectedMonster].color, fontWeight: 700 }}>{monsters[selectedMonster].str}</span>
                    <span style={{ marginLeft: '10px', fontWeight: 700, color: Number(heroData.strength) * Number(heroData.level) >= monsters[selectedMonster].str ? '#10b981' : '#ef4444' }}>
                      {Number(heroData.strength) * Number(heroData.level) >= monsters[selectedMonster].str ? '✅ You should win!' : '⚠️ You might lose!'}
                    </span>
                  </div>
                )}
                <button onClick={handleBattle} disabled={isPending} style={btn('#ef4444')}>
                  {isPending ? 'Fighting...' : `⚔️ Fight ${monsters[selectedMonster].emoji} ${monsters[selectedMonster].name}`}
                </button>
              </div>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '20px', fontSize: '16px' }}>Battle Report</h3>
                {battleStory && (
                  <div style={{ background: T.bg, border: `1px solid ${localResult?.won?'#10b981':'#ef4444'}`, borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
                    <p style={{ color: T.text, fontSize: '15px', lineHeight: '1.7', margin: 0 }}>{battleStory}</p>
                  </div>
                )}
                {localResult && (
                  <div style={{ textAlign: 'center', background: T.bg, borderRadius: '10px', padding: '24px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{localResult.won?'🏆':'💀'}</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: localResult.won?'#10b981':'#ef4444', marginBottom: '6px' }}>{localResult.won?'Victory!':'Defeat!'}</div>
                    {localResult.won && <div style={{ color: T.accent, fontSize: '14px', fontWeight: 600 }}>+{localResult.xp} XP earned — hero grows stronger!</div>}
                    {!localResult.won && <div style={{ color: T.muted, fontSize: '13px' }}>Complete daily quests to level up and try again.</div>}
                  </div>
                )}
                {!battleStory && <div style={{ color: T.muted, textAlign: 'center', padding: '48px', fontSize: '14px' }}>Select a monster and press Fight.</div>}
              </div>
            </div>
          )}

          {/* ══════════════ PRIZE POOL ══════════════ */}
          {page === 'prizepool' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ ...sec({ marginBottom: '16px' }) }}>
                  <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Create a Battle Room</h3>
                  <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Pay 0.0001 ETH · Winner takes 90% · A unique 4-letter code is generated — share it with anyone to challenge them.</p>
                  <button onClick={() => { writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'createRoom', value: ENTRY_FEE }); setMsg('Creating room — your code will appear below shortly!') }} disabled={isPending} style={btn(T.accent)}>
                    {isPending ? 'Creating...' : '+ Create Battle Room (0.0001 ETH)'}
                  </button>
                </div>
                <div style={{ ...sec({ marginBottom: '16px' }) }}>
                  <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Join by Code</h3>
                  <p style={{ color: T.muted, fontSize: '13px', marginBottom: '14px' }}>Got a code from a friend? Enter it here to challenge them directly.</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())} placeholder="XXXX" maxLength={4} style={{ ...inp({ marginBottom: 0, flex: 1, fontFamily: 'monospace', fontSize: '20px', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }) }} />
                    <button onClick={() => { if (!manualCode) return; writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'joinRoomByCode', args: [manualCode.toUpperCase()], value: ENTRY_FEE }); setMsg('Joining room...') }} style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Join</button>
                  </div>
                </div>
                {pendingWin && BigInt(pendingWin.toString()) > 0n && (
                  <div style={sec()}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: T.text, marginBottom: '10px' }}>🎉 You have winnings to collect!</div>
                    <button onClick={() => { writeContract({ address: PRIZEPOOL as any, abi: PRIZEPOOL_ABI, functionName: 'withdraw' }); setMsg('Withdrawing...') }} style={btn('#10b981')}>
                      Withdraw {fmtEth(BigInt(pendingWin.toString()))} ETH
                    </button>
                  </div>
                )}
              </div>
              <div>
                <div style={{ ...sec({ marginBottom: '16px' }) }}>
                  <h3 style={{ color: T.text, marginBottom: '16px', fontSize: '16px' }}>Your Stats</h3>
                  {playerStats ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[['Wins', playerStats.totalWins.toString(), '#10b981'], ['Losses', playerStats.totalLosses.toString(), '#ef4444'], ['Earned', fmtEth(playerStats.totalEarned)+' ETH', T.accent], ['Best Streak', playerStats.bestStreak.toString()+'🔥', '#f59e0b']].map(([k,v,c]) => (
                        <div key={k} style={statC(c)}>
                          <div style={{ fontSize: '11px', color: T.muted, marginBottom: '4px' }}>{k}</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ color: T.muted, textAlign: 'center', padding: '20px', fontSize: '13px' }}>No battles yet</div>}
                </div>
                <div style={sec()}>
                  <h3 style={{ color: T.text, marginBottom: '14px', fontSize: '16px' }}>Open Rooms</h3>
                  {openRooms && (openRooms as bigint[]).length > 0
                    ? (openRooms as bigint[]).map(id => <RoomRow key={id.toString()} roomId={id} address={address} writeContract={writeContract} isPending={isPending} setMsg={setMsg} dark={dark} />)
                    : <div style={{ color: T.muted, fontSize: '13px', textAlign: 'center', padding: '20px' }}>No open rooms right now</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TOURNAMENT ══════════════ */}
          {page === 'tournament' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Weekly Tournament</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Top 3 players split the prize pool every week.</p>
                {weekInfo && (
                  <div style={{ background: T.bg, borderRadius: '10px', padding: '16px', marginBottom: '16px', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: T.muted }}>Prize Pool</span>
                      <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 700 }}>{fmtEth(weekInfo[2])} ETH</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: T.muted }}>Time Remaining</span>
                      <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 700 }}>{timeRemaining ? fmtTime(timeRemaining) : '—'}</span>
                    </div>
                  </div>
                )}
                {isConnected && <button onClick={() => { writeContract({ address: TOURNAMENT as any, abi: TOURNAMENT_ABI, functionName: 'register', value: ENTRY_FEE }); setMsg('Registering...') }} disabled={isPending} style={btn('#f59e0b')}>Register (0.0001 ETH)</button>}
                <div style={{ marginTop: '20px', background: T.bg, borderRadius: '8px', padding: '14px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', color: T.muted, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>Prize Split</div>
                  {[['🥇 1st Place', '50%'], ['🥈 2nd Place', '30%'], ['🥉 3rd Place', '20%']].map(([p,s]) => (
                    <div key={p} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: T.text }}>
                      <span>{p}</span><span style={{ fontWeight: 700 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={sec()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: T.text, margin: 0, fontSize: '16px' }}>Top 10 Leaderboard</h3>
                  <button onClick={() => setShowMoreLb(!showMoreLb)} style={{ background: T.subtle, border: `1px solid ${T.border}`, color: T.accent, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    {showMoreLb ? 'Show Top 3' : 'Show All 10'}
                  </button>
                </div>
                {leaderboard
                  ? (showMoreLb ? Array.from({length:10},(_,i)=>i) : [0,1,2]).map(i => <LeaderboardRow key={i} addr={leaderboard[0][i]} wins={leaderboard[1][i]} rank={i} dark={dark} />)
                  : <div style={{ color: T.muted, textAlign: 'center', padding: '40px', fontSize: '13px' }}>No players registered yet</div>}
              </div>
            </div>
          )}

          {/* ══════════════ QUESTS ══════════════ */}
          {page === 'quests' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Daily Login Bonus</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Log in every day to earn XP — XP levels up your hero, and a stronger hero wins more ETH in Prize Pool battles.</p>
                <div style={{ background: T.bg, borderRadius: '10px', padding: '18px', marginBottom: '16px', border: `1px solid ${T.border}` }}>
                  {[['Login Streak', `${questProgress?questProgress[1].toString():'0'} days 🔥`, '#f59e0b'], ['Total Logins', questProgress?questProgress[2].toString():'0', T.text], ["Today's XP Reward", `+${loginXp} XP`, T.accent]].map(([k,v,c]) => (
                    <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: T.muted }}>{k}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: c as string }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { writeContract({ address: MASTER as any, abi: MASTER_ABI, functionName: 'claimDailyLogin' }, { onSuccess: () => { setTimeout(() => { refetchHero(); refetchXP(); refetchProgress() }, 2000); setMsg('Login bonus claimed! ✅') } }); setMsg('Claiming...') }} disabled={isPending || Boolean(questProgress?.[4])} style={btn('#10b981', Boolean(questProgress?.[4]))}>
                  {questProgress?.[4] ? '✅ Already Claimed Today' : isPending ? 'Claiming...' : 'Claim Daily Login Bonus'}
                </button>
                <div style={{ marginTop: '12px', background: T.bg, borderRadius: '8px', padding: '12px', fontSize: '12px', color: T.muted, border: `1px solid ${T.border}` }}>
                  Day 1–6: +25–50 XP &nbsp;·&nbsp; Day 7+: +100 XP &nbsp;·&nbsp; Day 30+: +250 XP
                </div>
              </div>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '20px', fontSize: '16px' }}>Daily Quests</h3>
                {questStatus ? questStatus[0].map((name: string, i: number) => (
                  <div key={i} style={{ background: questStatus[4][i]?(dark?'#052e16':'#f0fdf4'):T.bg, border: `1px solid ${questStatus[4][i]?'#10b981':T.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, color: questStatus[4][i]?'#10b981':T.text, fontSize: '14px' }}>{name} {questStatus[4][i]?'✅':''}</div>
                      <div style={{ fontSize: '12px', color: T.accent, fontWeight: 600 }}>+{questStatus[3][i].toString()} XP</div>
                    </div>
                    <div style={{ fontSize: '12px', color: T.muted, marginBottom: questStatus[4][i]?0:'8px' }}>{questStatus[1][i]}</div>
                    {!questStatus[4][i] && questProgress && (
                      <div style={{ background: T.inputBg, borderRadius: '4px', height: '4px', overflow: 'hidden', border: `1px solid ${T.inputBorder}` }}>
                        <div style={{ background: T.accent, height: '100%', width: Math.min(100,(Number(questProgress[0])/Number(questStatus[2][i]))*100)+'%', transition: 'width 0.3s' }} />
                      </div>
                    )}
                  </div>
                )) : <div style={{ color: T.muted, textAlign: 'center', padding: '40px', fontSize: '13px' }}>No quests found</div>}
              </div>
            </div>
          )}

          {/* ══════════════ LOOT & INVENTORY ══════════════ */}
          {page === 'loot' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>Roll for Loot</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Pay a small gas fee to roll a random item from the loot table.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                  {[['Common', '60%', dark?'#6b7280':'#9ca3af'], ['Rare', '30%', '#3b82f6'], ['Legendary', '10%', '#f59e0b']].map(([r,p,c]) => (
                    <div key={r} style={{ background: T.bg, borderRadius: '8px', padding: '12px', textAlign: 'center' as const, border: `1px solid ${T.border}`, borderTop: `3px solid ${c}` }}>
                      <div style={{ fontSize: '11px', color: c, fontWeight: 600, marginBottom: '4px' }}>{r}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: T.text }}>{p}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { if (!address) return; writeContract({ address: LOOT as any, abi: LOOT_ABI, functionName: 'rollLoot', args: [address] }); setMsg('Rolling loot...') }} disabled={isPending} style={btn('#8b5cf6')}>
                  {isPending ? 'Rolling...' : '🎲 Roll Loot on Base'}
                </button>
              </div>
              <div style={sec()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: T.text, margin: 0, fontSize: '16px' }}>Your Inventory</h3>
                  {inventory && inventory.length > 0 && <span style={{ fontSize: '13px', color: T.muted, background: T.subtle, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${T.border}` }}>{inventory.length} items</span>}
                </div>
                {inventory && inventory.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {(inventory as any[]).map((item, i) => (
                      <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '16px', textAlign: 'center' as const, borderTop: `3px solid ${rarityColor(Number(item.rarity),dark)}` }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: T.text, marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: T.muted }}>+{item.powerBoost.toString()} power</div>
                        <div style={{ fontSize: '11px', marginTop: '6px', color: rarityColor(Number(item.rarity),dark), fontWeight: 600 }}>{rarityLabel(Number(item.rarity))}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎒</div>
                    <div style={{ color: T.muted, fontSize: '14px' }}>No items yet — roll for loot to fill your inventory!</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════ PROFILE ══════════════ */}
          {page === 'profile' && isConnected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '4px', fontSize: '16px' }}>{myProfile?.exists?'Edit Profile':'Create Profile'}</h3>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Your username appears on battle rooms, leaderboards and throughout the game.</p>
                {!myProfile?.exists && (
                  <>
                    <span style={lbl}>Username (3–20 chars, permanent)</span>
                    <input value={pUsername} onChange={e => setPUsername(e.target.value)} placeholder="e.g. Shadowblade" style={inp()} />
                  </>
                )}
                <span style={lbl}>Avatar</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '20px' }}>
                  {AVATARS.map(emoji => (
                    <button key={emoji} onClick={() => setPAvatar(emoji)} style={{ background: pAvatar===emoji?T.subtle:T.bg, border: `2px solid ${pAvatar===emoji?T.accent:T.border}`, borderRadius: '8px', padding: '8px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <span style={lbl}>𝕏 / Twitter Handle (optional)</span>
                <input value={pX} onChange={e => setPX(e.target.value)} placeholder="@username" style={inp()} />
                <span style={lbl}>Farcaster Handle (optional)</span>
                <input value={pFarcaster} onChange={e => setPFarcaster(e.target.value)} placeholder="@username" style={inp()} />
                {profileMsg && <div style={{ background: T.subtle, border: `1px solid ${T.accent}`, color: T.accent, padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{profileMsg}</div>}
                <button onClick={() => {
                  if (myProfile?.exists) {
                    writeContract({ address: PROFILE as any, abi: PROFILE_ABI, functionName: 'updateProfile', args: [pX, pFarcaster, pAvatar] }, { onSuccess: () => { refetchProfile(); setProfileMsg('Profile updated! ✅') } })
                  } else {
                    if (!pUsername) { setProfileMsg('Enter a username!'); return }
                    writeContract({ address: PROFILE as any, abi: PROFILE_ABI, functionName: 'createProfile', args: [pUsername, pX, pFarcaster, pAvatar] }, { onSuccess: () => { refetchProfile(); setProfileMsg('Profile created! ✅') } })
                    setProfileMsg('Creating profile on Base...')
                  }
                }} disabled={isPending} style={btn(T.accent)}>
                  {isPending ? 'Saving...' : myProfile?.exists ? 'Update Profile' : 'Create Profile on Base'}
                </button>
              </div>
              <div style={sec()}>
                <h3 style={{ color: T.text, marginBottom: '20px', fontSize: '16px' }}>Your Profile</h3>
                {myProfile?.exists ? (
                  <div>
                    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '64px', marginBottom: '10px' }}>{myProfile.avatarEmoji}</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: T.text, marginBottom: '4px' }}>{myProfile.username}</div>
                      <div style={{ fontSize: '12px', color: T.muted, fontFamily: 'monospace' }}>{short(address||'')}</div>
                    </div>
                    {[myProfile.xHandle && ['𝕏', myProfile.xHandle], myProfile.farcasterHandle && ['🟣', myProfile.farcasterHandle]].filter(Boolean).map((row: any) => (
                      <div key={row[0]} style={{ background: T.bg, borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${T.border}` }}>
                        <span style={{ fontWeight: 700 }}>{row[0]}</span>
                        <span style={{ fontSize: '13px', color: T.muted }}>{row[1]}</span>
                      </div>
                    ))}
                    {heroData?.name && (
                      <div style={{ background: T.bg, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${T.border}`, marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', color: T.muted, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>Hero Stats</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {[['LVL', heroData.level.toString(), '#f59e0b'], ['STR', heroData.strength.toString(), '#ef4444'], ['XP', heroData.totalXpEarned.toString(), T.accent]].map(([k,v,c]) => (
                            <div key={k} style={{ flex: 1, textAlign: 'center', background: T.subtle, borderRadius: '6px', padding: '10px', border: `1px solid ${T.border}` }}>
                              <div style={{ fontSize: '10px', color: T.muted, marginBottom: '2px' }}>{k}</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: c }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '64px 32px', color: T.muted }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                    <div style={{ fontSize: '14px' }}>Create your profile to show your username everywhere in the game.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
