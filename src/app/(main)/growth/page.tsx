'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/ui/BottomNav'
import PrismModal from '@/components/ui/PrismModal'
import {
  Home,
  Archive,
  BookOpen,
  PenLine,
  User,
  TrendingUp,
  Bell,
} from 'lucide-react'

// ── 타입 ──────────────────────────────────────────────
interface Prism {
  id: string
  type: 'card' | 'opinion' | 'self'
  created_at: string
}

type RoutineType = 'card' | 'opinion' | 'self'
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface DayRoutine {
  enabled: boolean
  types: RoutineType[]
}

type Routine = Record<DayKey, DayRoutine>

const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<DayKey, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
}
const WEEK_INDEX_TO_DAY_KEY: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DEFAULT_ROUTINE: Routine = {
  mon: { enabled: true, types: ['card'] },
  tue: { enabled: true, types: ['card'] },
  wed: { enabled: true, types: ['card'] },
  thu: { enabled: true, types: ['card'] },
  fri: { enabled: true, types: ['card'] },
  sat: { enabled: true, types: ['card'] },
  sun: { enabled: true, types: ['card'] },
}

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDateKey(date: Date): string {
  return toDateOnly(date).toLocaleDateString('sv')
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function getDayKeyFromDate(date: Date): DayKey {
  return WEEK_INDEX_TO_DAY_KEY[toDateOnly(date).getDay()]
}

function createdAtToLocalDateKey(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('sv')
}

function isDayAchieved(date: string, prisms: Prism[], routine: Routine): boolean {
  const dayKey = getDayKeyFromDate(new Date(date))
  const dayRoutine = routine[dayKey]
  if (!dayRoutine?.enabled) return false
  const required = dayRoutine.types ?? []
  if (required.length === 0) return false
  const writtenTypes = new Set(
    prisms
      .filter((p) => createdAtToLocalDateKey(p.created_at) === date)
      .map((p) => p.type),
  )
  return required.every((type) => writtenTypes.has(type))
}

function getDayProgress(date: string, prisms: Prism[], routine: Routine): number {
  const dayKey = getDayKeyFromDate(new Date(date))
  const dayRoutine = routine[dayKey]
  if (!dayRoutine?.enabled) return 0
  const required = dayRoutine.types ?? []
  if (required.length === 0) return 0
  const writtenTypes = new Set(
    prisms
      .filter((p) => createdAtToLocalDateKey(p.created_at) === date)
      .map((p) => p.type),
  )
  const doneCount = required.filter((type) => writtenTypes.has(type)).length
  return doneCount / required.length
}

// ── 현재 연속 일수 ─────────────────────────────────────
function calcCurrentStreak(prisms: Prism[], routine: Routine): number {
  const today = toDateOnly(new Date())
  let streak = 0
  let cursor = today
  let checkedEnabledDay = false

  for (let i = 0; i < 730; i++) {
    const key = formatDateKey(cursor)
    const dayKey = getDayKeyFromDate(cursor)
    if (!routine[dayKey].enabled) {
      cursor = addDays(cursor, -1)
      continue
    }
    checkedEnabledDay = true
    if (isDayAchieved(key, prisms, routine)) {
      streak++
      cursor = addDays(cursor, -1)
      continue
    }
    break
  }

  return checkedEnabledDay ? streak : 0
}

// ── 최장 스트릭 ────────────────────────────────────────
function calcMaxStreak(prisms: Prism[], routine: Routine): number {
  const today = toDateOnly(new Date())
  const earliestPrismDate = prisms.length
    ? toDateOnly(new Date(prisms[0].created_at.slice(0, 10)))
    : today
  const start = earliestPrismDate < today ? earliestPrismDate : today

  let cur = 0
  let max = 0
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const dayKey = getDayKeyFromDate(d)
    if (!routine[dayKey].enabled) continue

    if (isDayAchieved(formatDateKey(d), prisms, routine)) {
      cur++
      if (cur > max) max = cur
    } else {
      cur = 0
    }
  }
  return max
}

// ── 이번 달 달성률 ─────────────────────────────────────
function calcMonthlyRate(prisms: Prism[], routine: Routine): { rate: number; done: number; passed: number } {
    const now = toDateOnly(new Date())
    // 이번 주 월요일
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = addDays(now, mondayOffset)
  
    let doneDays = 0
    let routineDays = 0
  
    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, i)
      if (d > now) break // 아직 안 온 날은 제외
      const dayKey = getDayKeyFromDate(d)
      if (!routine[dayKey].enabled) continue
      routineDays++
      if (isDayAchieved(formatDateKey(d), prisms, routine)) doneDays++
    }
  
    const rate = routineDays > 0 ? Math.round((doneDays / routineDays) * 100) : 0
    return { rate, done: doneDays, passed: routineDays }
  }

function calcMonthRateForRange(prisms: Prism[], routine: Routine, year: number, month: number, endDay: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month, endDay)
  let done = 0
  let routineDays = 0
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const dayKey = getDayKeyFromDate(d)
    if (!routine[dayKey].enabled) continue
    routineDays++
    if (isDayAchieved(formatDateKey(d), prisms, routine)) done++
  }
  return routineDays > 0 ? Math.round((done / routineDays) * 100) : 0
}

// ── 이번 주 요일별 달성 상태 (월~일) ─────────────────────
function calcWeekData(prisms: Prism[], routine: Routine) {
  const labels = ['월', '화', '수', '목', '금', '토', '일']
  const dayKeys: DayKey[] = DAY_KEYS
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)

  return labels.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const dayRoutine = routine[dayKeys[i]]
    const enabled = !!dayRoutine?.enabled
    const achieved = enabled ? isDayAchieved(key, prisms, routine) : false
    const progress = enabled ? getDayProgress(key, prisms, routine) : 0
   const achievedCount = enabled
  ? (dayRoutine.types ?? []).filter(t =>
      prisms.some(p => createdAtToLocalDateKey(p.created_at) === key && p.type === t)
    ).length
  : 0
return { label, date: key, enabled, achieved, progress, achievedCount }
  })
}

// ── 이번 주 바 색상 — 루틴 달성 기준 ─────────────────────
function weekBarColor(params: { enabled: boolean; achieved: boolean; isPastOrToday: boolean; achievedCount?: number }): string {
  if (!params.enabled) return '#f1f1f3'
  if (!params.achieved) return params.isPastOrToday ? '#e2e8f0' : '#f1f1f3'
  const count = params.achievedCount ?? 1
  if (count >= 3) return 'linear-gradient(to top, #a78bfa, #7c3aed)'
  if (count === 2) return 'linear-gradient(to top, #c4b5fd, #a78bfa)'
  return 'linear-gradient(to top, #ddd6fe, #c4b5fd)'
}

// ── 배지 정의 (Beta 설계 주석 기준 8종) ──────────────
function calcBadges(prisms: Prism[], maxStreak: number, currentStreak: number) {
  const total = prisms.length
  const cardCount = prisms.filter((p) => p.type === 'card').length
  const opinionCount = prisms.filter((p) => p.type === 'opinion').length
  const selfCount = prisms.filter((p) => p.type === 'self').length

  return [
    { id: 'first',    emoji: '✨', label: '첫 프리즘',    desc: '첫 번째 프리즘 작성',             earned: total >= 1 },
    { id: 'streak7',  emoji: '🔥', label: '7일 연속',     desc: '7일 연속 프리즘 작성',            earned: maxStreak >= 7 || currentStreak >= 7 },
    { id: 'total10',  emoji: '💡', label: '프리즘 10개',  desc: '누적 프리즘 10개 달성',           earned: total >= 10 },
    { id: 'balance',  emoji: '🌀', label: '균형 시각',    desc: '카드·기사·자기이해 3종 모두 작성', earned: cardCount > 0 && opinionCount > 0 && selfCount > 0 },
    { id: 'streak30', emoji: '🏆', label: '30일 연속',    desc: '30일 연속 프리즘 작성',           earned: maxStreak >= 30 },
    { id: 'total50',  emoji: '⭐', label: '프리즘 50개',  desc: '누적 프리즘 50개 달성',           earned: total >= 50 },
    { id: 'total100', emoji: '💎', label: '프리즘 100개', desc: '누적 프리즘 100개 달성',          earned: total >= 100 },
    { id: 'streak60', emoji: '🎯', label: '60일 연속',    desc: '60일 연속 프리즘 작성',           earned: maxStreak >= 60 },
  ]
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export default function GrowthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [prisms, setPrisms] = useState<Prism[]>([])
  const [nickname, setNickname] = useState('')
  const [routine, setRoutine] = useState<Routine>(DEFAULT_ROUTINE)
  const [loading, setLoading] = useState(true)
  const [showPrismModal, setShowPrismModal] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const [{ data: userData }, { data: prismData }] = await Promise.all([
      supabase.from('users').select('nickname, routine').eq('id', user.id).single(),
      supabase
        .from('prisms')
        .select('id, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ])

    if (userData) {
      setNickname(userData.nickname || '')
      const loadedRoutine = userData.routine as Routine | null
      if (loadedRoutine) {
        setRoutine({
          mon: loadedRoutine.mon ?? DEFAULT_ROUTINE.mon,
          tue: loadedRoutine.tue ?? DEFAULT_ROUTINE.tue,
          wed: loadedRoutine.wed ?? DEFAULT_ROUTINE.wed,
          thu: loadedRoutine.thu ?? DEFAULT_ROUTINE.thu,
          fri: loadedRoutine.fri ?? DEFAULT_ROUTINE.fri,
          sat: loadedRoutine.sat ?? DEFAULT_ROUTINE.sat,
          sun: loadedRoutine.sun ?? DEFAULT_ROUTINE.sun,
        })
      } else {
        setRoutine(DEFAULT_ROUTINE)
      }
    }
    if (prismData) setPrisms(prismData as Prism[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f7f7f8',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #e4e4e4', borderTopColor: '#4F46E5',
          borderRadius: '50%', animation: 'spin .8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── 통계 계산 ──
  const total = prisms.length
  const currentStreak = calcCurrentStreak(prisms, routine)
  const maxStreak = calcMaxStreak(prisms, routine)
  const { rate, done, passed } = calcMonthlyRate(prisms, routine)
  const cardCount = prisms.filter((p) => p.type === 'card').length
  const opinionCount = prisms.filter((p) => p.type === 'opinion').length
  const selfCount = prisms.filter((p) => p.type === 'self').length
  const weekData = calcWeekData(prisms, routine)
  const badges = calcBadges(prisms, maxStreak, currentStreak)
  const earnedCount = badges.filter((b) => b.earned).length
  const todayDate = toDateOnly(new Date())
  const today = formatDateKey(todayDate)
  const weekEnabledMaxProgress = Math.max(
    ...weekData.filter((d) => d.enabled).map((d) => d.progress),
    1,
  )
  const now = new Date()
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthLastDay = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate()
  const prevMonthRate = calcMonthRateForRange(
    prisms,
    routine,
    prevMonthDate.getFullYear(),
    prevMonthDate.getMonth(),
    prevMonthLastDay,
  )
  const weekdayStats = DAY_KEYS.map((dayKey) => {
    let totalEnabledDays = 0
    let achievedDays = 0
    const startDate = prisms.length
      ? toDateOnly(new Date(prisms[0].created_at.slice(0, 10)))
      : todayDate
    for (let d = startDate; d <= todayDate; d = addDays(d, 1)) {
      if (getDayKeyFromDate(d) !== dayKey) continue
      if (!routine[dayKey].enabled) continue
      totalEnabledDays++
      if (isDayAchieved(formatDateKey(d), prisms, routine)) achievedDays++
    }
    const rate = totalEnabledDays > 0 ? Math.round((achievedDays / totalEnabledDays) * 100) : 0
    return { dayKey, rate, totalEnabledDays }
  })
  const bestWeekday = [...weekdayStats].sort((a, b) => b.rate - a.rate)[0]
  const startOfWeek = addDays(todayDate, todayDate.getDay() === 0 ? -6 : 1 - todayDate.getDay())
  let weekHasEnabled = false
  let weekPerfect = true
  for (let d = startOfWeek; d <= todayDate; d = addDays(d, 1)) {
    const dayKey = getDayKeyFromDate(d)
    if (!routine[dayKey].enabled) continue
    weekHasEnabled = true
    if (!isDayAchieved(formatDateKey(d), prisms, routine)) {
      weekPerfect = false
      break
    }
  }
  const insightItems: string[] = []
  if (currentStreak >= 7) {
    insightItems.push(`${Math.floor(currentStreak / 7)}주 연속 루틴 유지 중`)
  } else if (currentStreak >= 3) {
    insightItems.push(`${currentStreak}일 연속 루틴 유지 중`)
  }
  if (rate >= 80 || rate > prevMonthRate) {
    insightItems.push(`이번 주 달성률 ${rate}% — 순항 중이에요`)
  }
  if (bestWeekday && bestWeekday.totalEnabledDays > 0 && bestWeekday.rate >= 70) {
    insightItems.push(`${DAY_LABELS[bestWeekday.dayKey]}요일 루틴 ${bestWeekday.rate}% 유지 중`)
  }
  if (weekHasEnabled && weekPerfect) {
    insightItems.push('이번 주 루틴 완벽 달성!')
  }
  const insights = insightItems.length > 0 ? insightItems.slice(0, 3) : ['루틴을 꾸준히 쌓아가고 있어요. 계속 이어가세요 💙']
  const ym = new Date().toISOString().slice(0, 7)
  const thisMonthCount = prisms.filter((p) => p.created_at.startsWith(ym)).length

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── PC 사이드바 — 라이브러리와 동일 구조 ── */}
      <aside
        className="growth-sidebar"
        style={{
          width: 240, flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e4e4e4', padding: '24px 0',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, height: '100vh',
          overflowY: 'auto', zIndex: 100,
        }}
      >
        {/* 로고 */}
        <div
          onClick={() => router.push('/home')}
          style={{
            fontSize: 18, fontWeight: 800, padding: '4px 20px 28px', cursor: 'pointer',
            background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          AHALOGUE
        </div>

        {/* 섹션: 메인 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#aaa',
            letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase',
          }}>
            메인
          </div>

          {[
            { href: '/home',        Icon: Home,     label: '홈' },
            { href: '/archive',     Icon: Archive,  label: '아카이브' },
            { href: '/library',     Icon: BookOpen, label: '라이브러리' },
          ].map(({ href, Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
                background: 'transparent', color: '#3b3b41',
                fontWeight: 500, fontSize: 14, cursor: 'pointer',
              }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}

          {/* 프리즘 작성 — 모달 오픈 */}
          <button
            type="button"
            onClick={() => setShowPrismModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
              background: 'transparent', color: '#3b3b41',
              fontWeight: 500, fontSize: 14,
              border: 'none', cursor: 'pointer',
              width: 'calc(100% - 16px)', textAlign: 'left',
            }}
          >
            <PenLine size={18} strokeWidth={1.8} />프리즘 작성
          </button>
        </div>

        {/* 섹션: 계정 */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#aaa',
            letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase',
          }}>
            계정
          </div>

          <Link href="/mypage" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
              background: 'transparent', color: '#3b3b41',
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}>
              <User size={18} strokeWidth={1.8} />마이페이지
            </div>
          </Link>

          {/* 성장기록 — 현재 페이지 (활성) */}
          <Link href="/growth" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
              background: '#EEF2FF', color: '#4F46E5',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
              <TrendingUp size={18} strokeWidth={2.2} />성장기록
            </div>
          </Link>

          <Link href="/notifications" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
              background: 'transparent', color: '#3b3b41',
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}>
              <Bell size={18} strokeWidth={1.8} />알림
            </div>
          </Link>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="growth-main">

        {/* 헤더 */}
        <div style={{ padding: '32px 24px 0' }}>
          {/* 백 버튼 */}
          <div
            onClick={() => router.push('/mypage')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#888', cursor: 'pointer',
              marginBottom: 14, transition: 'color .15s',
            }}
          >
            ← 마이페이지
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0a', margin: 0, letterSpacing: '-0.5px' }}>
            성장 기록
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 24px' }}>
            {nickname ? `${nickname}님의 ` : ''}누적 인사이트 훈련 현황이에요
          </p>
        </div>

        <div style={{ padding: '0 24px 32px' }}>

          {/* ── 통계 그리드 ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12, marginBottom: 16,
          }} className="growth-stat-grid">

            {/* 총 프리즘 */}
            <div style={{
              background: '#EEF2FF', border: '1px solid #c7d2fe',
              borderRadius: 14, padding: '18px 16px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>총 프리즘</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#4F46E5', letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>
                {total}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>이번 달 +{thisMonthCount}</div>
            </div>

            {/* 최장 스트릭 */}
            <div style={{
              background: '#fff', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '18px 16px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>최장 스트릭</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0a0a', letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>
                {maxStreak}<span style={{ fontSize: 14, fontWeight: 600, color: '#888', marginLeft: 1 }}>일</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>현재 {currentStreak}일 연속</div>
            </div>

            {/* 이번 달 달성률 */}
            <div style={{
              background: '#fff', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '18px 16px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>이번 주 달성률</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0a0a', letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>
                {rate}<span style={{ fontSize: 14, fontWeight: 600, color: '#888', marginLeft: 1 }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>{done} / {passed}일 완료</div>
            </div>

            {/* 작성 유형 */}
            <div style={{
              background: '#fff', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '18px 16px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10 }}>작성 유형</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fff4e6', color: '#b05000', borderRadius: 6, padding: '3px 8px', width: 'fit-content' }}>
                  카드 {cardCount}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#e6f7ee', color: '#1a7a48', borderRadius: 6, padding: '3px 8px', width: 'fit-content' }}>
                  기사 {opinionCount}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#e0eaff', color: '#0052cc', borderRadius: 6, padding: '3px 8px', width: 'fit-content' }}>
                  자기 {selfCount}
                </span>
              </div>
            </div>
          </div>

          {/* ── 이번 주 기록 ── */}
          <div style={{
            background: '#fff', border: '1px solid #e4e4e4',
            borderRadius: 14, padding: '22px 24px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 20 }}>
              이번 주 기록
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110 }}>
              {weekData.map((d) => {
                const isToday = d.date === today
                const isPastOrToday = d.date <= today
                const barH = d.enabled
                  ? Math.max((d.progress / weekEnabledMaxProgress) * 72, 12)
                  : 4

                return (
                  <div key={d.label} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end',
                  }}>
                    <span style={{ minHeight: 14 }} />

                    <div style={{
                      width: '100%',
                      height: `${barH}px`,
                      borderRadius: '6px 6px 3px 3px',
                      background: weekBarColor({ enabled: d.enabled, achieved: d.achieved, isPastOrToday, achievedCount: d.achievedCount }),
                      outline: isToday && !d.achieved ? '2px solid #6366f1' : 'none',
                      outlineOffset: 2,
                      transition: 'height .5s cubic-bezier(.4,0,.2,1)',
                    }} />

                    <span style={{
                      fontSize: 11, fontWeight: isToday ? 800 : 600,
                      color: d.enabled ? (isToday ? '#4F46E5' : '#aaa') : '#ddd',
                    }}>
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>

          </div>

          {/* ── 루틴 인사이트 ── */}
          <div style={{
            background: '#fff', border: '1px solid #e4e4e4',
            borderRadius: 14, padding: '22px 24px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 12 }}>
              루틴 인사이트
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.map((text, idx) => (
                <div key={`${text}-${idx}`} style={{
                  background: '#fafbff',
                  border: '1px solid #e0e7ff',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#3b3b41',
                }}>
                  <span>💡</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 배지 전체 보기 ── */}
          <div style={{
            background: '#fff', border: '1px solid #e4e4e4',
            borderRadius: 14, padding: '22px 24px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 18 }}>
              배지 전체 보기 · {earnedCount}/{badges.length}
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
            }} className="growth-badge-grid">
              {badges.map((b) => (
                <div key={b.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 5, padding: '14px 8px 12px',
                  borderRadius: 12,
                  border: b.earned ? '1px solid #c7d2fe' : '1px solid #e4e4e4',
                  background: b.earned ? '#fafbff' : '#fff',
                  opacity: b.earned ? 1 : 0.4,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 26 }}>{b.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111', lineHeight: 1.3, wordBreak: 'keep-all' }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', wordBreak: 'keep-all', lineHeight: 1.4 }}>
                    {b.desc}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, borderRadius: 20, padding: '2px 8px', marginTop: 2,
                    background: b.earned ? '#EEF2FF' : '#f4f4f4',
                    color: b.earned ? '#4F46E5' : '#bbb',
                  }}>
                    {b.earned ? '획득' : '잠김'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* 프리즘 작성 모달 */}
      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}

      {/* 모바일 하단 네비게이션 */}
      <BottomNav />

      {/* 반응형 CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (min-width: 768px) {
          .growth-sidebar { display: flex !important; }
          .growth-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .growth-sidebar { display: none !important; }
          .growth-main    { margin-left: 0 !important; }
          .growth-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .growth-badge-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}