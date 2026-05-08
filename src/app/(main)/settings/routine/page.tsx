'use client'

import BottomNav from '@/components/ui/BottomNav'
import PrismModal from '@/components/ui/PrismModal'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Archive, BookOpen, PenLine, User, TrendingUp, Bell, ChevronLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── 타입 ──────────────────────────────────────────────
type RoutineType = 'card' | 'opinion' | 'self'

interface DayRoutine {
  enabled: boolean
  types: RoutineType[]
}

interface Routine {
  mon: DayRoutine
  tue: DayRoutine
  wed: DayRoutine
  thu: DayRoutine
  fri: DayRoutine
  sat: DayRoutine
  sun: DayRoutine
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
type DayKey = typeof DAY_KEYS[number]

const DAY_LABELS: Record<DayKey, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
}

const TYPE_META: Record<RoutineType, { label: string; bg: string; color: string }> = {
  card:    { label: '인사이트 워밍업', bg: '#fff4e6', color: '#b05000' },
  opinion: { label: '세상 한 조각',     bg: '#e6f7ee', color: '#1a7a48' },
  self:    { label: '나를 만드는 질문', bg: '#e0eaff', color: '#0052cc' },
}

const DEFAULT_ROUTINE: Routine = {
  mon: { enabled: true,  types: ['card'] },
  tue: { enabled: true,  types: ['opinion'] },
  wed: { enabled: true,  types: ['self'] },
  thu: { enabled: true,  types: ['card', 'opinion'] },
  fri: { enabled: true,  types: ['self'] },
  sat: { enabled: false, types: [] },
  sun: { enabled: false, types: [] },
}

export default function RoutineSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [routine, setRoutine] = useState<Routine>(DEFAULT_ROUTINE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPrismModal, setShowPrismModal] = useState(false)

  // ── 불러오기 ──
  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('users')
      .select('routine')
      .eq('id', user.id)
      .single()

    if (data?.routine) {
      // 저장된 값 있으면 불러오기, 없는 요일은 기본값으로
      const merged = { ...DEFAULT_ROUTINE }
      for (const key of DAY_KEYS) {
        if (data.routine[key] !== undefined) {
          merged[key] = data.routine[key]
        }
      }
      setRoutine(merged)
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { load() }, [load])

  // ── 요일 on/off 토글 ──
  function toggleDay(day: DayKey) {
    setRoutine(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        types: !prev[day].enabled ? (prev[day].types.length > 0 ? prev[day].types : ['card']) : prev[day].types,
      },
    }))
  }

  // ── 루틴 타입 토글 ──
  function toggleType(day: DayKey, type: RoutineType) {
    setRoutine(prev => {
      const current = prev[day].types
      const already = current.includes(type)
      // 마지막 하나는 해제 불가
      if (already && current.length === 1) return prev
      return {
        ...prev,
        [day]: {
          ...prev[day],
          types: already ? current.filter(t => t !== type) : [...current, type],
        },
      }
    })
  }

  // ── 저장 ──
  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const { error } = await supabase
        .from('users')
        .update({ routine })
        .eq('id', user.id)

      if (error) throw error
      setMessage('저장됐어요!')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // ── 활성 요일 수 ──
  const activeDays = DAY_KEYS.filter(d => routine[d].enabled).length

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── 사이드바 ── */}
      <aside className="routine-sidebar" style={{
        width: 240, background: '#fff', borderRight: '1px solid #e4e4e4',
        padding: '24px 0', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 100,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800, padding: '4px 20px 28px',
          background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AHALOGUE</div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>메인</div>
          {[
            { href: '/home',    icon: Home,     label: '홈' },
            { href: '/archive', icon: Archive,  label: '아카이브' },
            { href: '/library', icon: BookOpen, label: '라이브러리' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14 }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}
          <button type="button" onClick={() => setShowPrismModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)', textAlign: 'left' }}>
            <PenLine size={18} strokeWidth={1.8} />프리즘 작성
          </button>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>계정</div>
          {[
            { href: '/mypage',        icon: User,       label: '마이페이지' },
            { href: '/growth',        icon: TrendingUp, label: '성장기록' },
            { href: '/notifications', icon: Bell,       label: '알림' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14 }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── 메인 ── */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="routine-main">

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button type="button" onClick={() => router.push('/mypage')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
            <ChevronLeft size={22} color="#0a0a0a" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>루틴 설정</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : (
          <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* 안내 */}
            <div style={{
              background: '#EEF2FF', border: '1px solid #c7d2fe',
              borderRadius: 14, padding: '14px 16px',
              fontSize: 13, color: '#4F46E5', lineHeight: 1.6,
            }}>
              요일마다 할 루틴을 설정하면 성장기록에서 달성 여부를 확인할 수 있어요.<br />
              <span style={{ fontSize: 12, color: '#818cf8' }}>현재 주 {activeDays}일 활성화</span>
            </div>

            {/* 요일별 카드 */}
            {DAY_KEYS.map((day) => {
              const d = routine[day]
              const isWeekend = day === 'sat' || day === 'sun'

              return (
                <div key={day} style={{
                  background: '#fff',
                  border: `1px solid ${d.enabled ? '#c7d2fe' : '#e4e4e4'}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  opacity: d.enabled ? 1 : 0.6,
                  transition: 'all .15s',
                }}>
                  {/* 요일 + 토글 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: d.enabled ? 14 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 15, fontWeight: 800,
                        color: d.enabled ? '#0a0a0a' : '#aaa',
                      }}>
                        {DAY_LABELS[day]}
                      </span>
                      {isWeekend && (
                        <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>주말</span>
                      )}
                      {d.enabled && (
                        <div style={{ display: 'flex', gap: 5 }}>
                          {d.types.map(t => (
                            <span key={t} style={{
                              fontSize: 10, fontWeight: 700,
                              background: TYPE_META[t].bg, color: TYPE_META[t].color,
                              borderRadius: 6, padding: '2px 7px',
                            }}>
                              {TYPE_META[t].label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 토글 스위치 */}
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none',
                        background: d.enabled ? '#4F46E5' : '#e4e4e4',
                        cursor: 'pointer', position: 'relative', flexShrink: 0,
                        transition: 'background .2s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: d.enabled ? 23 : 3,
                        transition: 'left .2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </div>

                  {/* 루틴 타입 선택 */}
                  {d.enabled && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['card', 'opinion', 'self'] as RoutineType[]).map(type => {
                        const selected = d.types.includes(type)
                        const meta = TYPE_META[type]
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleType(day, type)}
                            style={{
                              flex: 1, padding: '10px 0', borderRadius: 10,
                              border: selected ? `1.5px solid ${meta.color}` : '1.5px solid #e4e4e4',
                              background: selected ? meta.bg : '#fafafa',
                              color: selected ? meta.color : '#aaa',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              transition: 'all .15s',
                            }}
                          >
                            {meta.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* 저장 */}
            {message && (
              <p style={{
                fontSize: 13, margin: 0, textAlign: 'center',
                color: message === '저장됐어요!' ? '#0066ff' : '#e53e3e',
              }}>
                {message}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: saving ? '#e4e4e4' : '#0066ff',
                color: saving ? '#aaa' : '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>

          </div>
        )}
      </main>

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
      <BottomNav />

      <style>{`
        @media (min-width: 768px) {
          .routine-sidebar { display: flex !important; }
          .routine-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .routine-sidebar { display: none !important; }
          .routine-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}