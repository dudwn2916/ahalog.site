'use client'

import BottomNav from '@/components/ui/BottomNav'
import PrismModal from '@/components/ui/PrismModal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Archive, BookOpen, PenLine, User, TrendingUp, Bell,
  ChevronRight, LogOut, FileText, Shield, Settings, Award, Download, Layers, MessageSquare, CalendarDays
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface UserProfile {
  nickname: string
  job: string
  company: string
  industry: string
  notification_on: boolean
}

interface Stats {
  totalPrisms: number
  streak: number
  badges: Badge[]
}

interface Badge {
  id: string
  icon: string
  label: string
  desc: string
  earned: boolean
}

// ─── 배지 정의 (prisms 누적 수 기반) ────────────────────────────────────────

function calcBadges(total: number): Badge[] {
  return [
    {
      id: 'first',
      icon: '🌱',
      label: '인사이트 새싹',
      desc: '첫 프리즘 작성',
      earned: total >= 1,
    },
    {
      id: 'ten',
      icon: '✨',
      label: '10개 달성',
      desc: '프리즘 10개 작성',
      earned: total >= 10,
    },
    {
      id: 'thirty',
      icon: '🔥',
      label: '30개 달성',
      desc: '프리즘 30개 작성',
      earned: total >= 30,
    },
    {
      id: 'hundred',
      icon: '💎',
      label: '100개 달성',
      desc: '프리즘 100개 작성',
      earned: total >= 100,
    },
  ]
}

// ─── 더미 데이터 (Supabase 연동 전 폴백) ────────────────────────────────────

const DUMMY_PROFILE: UserProfile = {
  nickname: '아하로거',
  job: 'PB',
  company: 'KB국민은행',
  industry: '은행',
  notification_on: true,
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE)
  const [stats, setStats] = useState<Stats>({ totalPrisms: 0, streak: 0, badges: calcBadges(0) })
  const [loading, setLoading] = useState(true)
  const [showPrismModal, setShowPrismModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [withdrawError, setWithdrawError] = useState('')

  // ── Supabase 데이터 불러오기 ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        // 유저 프로필
        const { data: userData } = await supabase
          .from('users')
          .select('nickname, job, company, industry, notification_on')
          .eq('id', user.id)
          .single()

        if (userData) setProfile(userData)

        // 누적 프리즘 수
        const { count: totalCount } = await supabase
          .from('prisms')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        const total = totalCount ?? 0

        // 연속 기록 스트릭 계산 (날짜별 그룹)
        const { data: prismDates } = await supabase
          .from('prisms')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const streak = calcStreak(prismDates ?? [])
        const badges = calcBadges(total)

        setStats({ totalPrisms: total, streak, badges })
      } catch {
        // 에러 시 더미 유지
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 스트릭 계산 ──────────────────────────────────────────────────────────
  function calcStreak(rows: { created_at: string }[]): number {
    if (!rows.length) return 0
    const dates = Array.from(new Set(rows.map(r => r.created_at.slice(0, 10)))).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  
    // 오늘 또는 어제 기록이 없으면 스트릭 0
    if (dates[0] !== today && dates[0] !== yesterday) return 0
  
    let cursor = dates[0] // 가장 최근 날짜부터 시작
    for (const d of dates) {
      if (d === cursor) {
        streak++
        const prev = new Date(cursor)
        prev.setDate(prev.getDate() - 1)
        cursor = prev.toISOString().slice(0, 10)
      } else break
    }
    return streak
  }

  // ── 로그아웃 ─────────────────────────────────────────────────────────────
  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  function openLogoutConfirm() {
    setShowLogoutConfirm(true)
  }

  // 회원탈퇴
  async function handleWithdraw() {
    setWithdrawing(true)
    setWithdrawError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      // 비밀번호 재인증
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: withdrawPassword,
      })
      if (authError) throw new Error('비밀번호가 올바르지 않아요.')

      // 데이터 삭제
      await supabase.from('prisms').delete().eq('user_id', user.id)
      await supabase.from('users').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (e) {
      setWithdrawError(e instanceof Error ? e.message : '탈퇴 중 오류가 발생했습니다.')
    } finally {
      setWithdrawing(false)
    }
  }

  // ── 데이터 내보내기 ───────────────────────────────────────────────────────
  async function handleExport() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prisms } = await supabase
        .from('prisms')
        .select('type, body, job_tags, company_tags, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!prisms) return

      // 텍스트 형식으로 변환
      const lines = prisms.map((p, i) => [
        `[${i + 1}] ${p.type.toUpperCase()} · ${p.created_at?.slice(0, 10)}`,
        `직무: ${p.job_tags?.join(', ') || '-'} | 기업: ${p.company_tags?.join(', ') || '-'}`,
        p.body,
        '',
      ].join('\n'))

      const content = `AHALOGUE 프리즘 기록\n내보내기: ${new Date().toLocaleDateString('ko-KR')}\n닉네임: ${profile.nickname}\n\n${'─'.repeat(40)}\n\n${lines.join('\n─'.repeat(40) + '\n\n')}`

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ahalogue_prisms_${new Date().toISOString().slice(0, 10)}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('내보내기 중 오류가 발생했습니다.')
    }
  }

  // ── 아바타 이니셜 ─────────────────────────────────────────────────────────
  const initial = profile.nickname?.[0] ?? 'A'
  const earnedCount = stats.badges.filter(b => b.earned).length

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── PC 사이드바 ── */}
      <aside className="mypage-sidebar" style={{
        width: 240, flexShrink: 0, background: '#fff',
        borderRight: '1px solid #e4e4e4', padding: '24px 0',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        overflowY: 'auto', zIndex: 100,
      }}>
        {/* 로고 */}
        <div style={{
          fontSize: 18, fontWeight: 800, padding: '4px 20px 28px',
          background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AHALOGUE</div>

        {/* 메인 섹션 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>메인</div>

          {[
            { href: '/home',    icon: Home,     label: '홈' },
            { href: '/archive', icon: Archive,  label: '아카이브' },
            { href: '/library', icon: BookOpen, label: '라이브러리' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}

          <button type="button" onClick={() => setShowPrismModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)', textAlign: 'left' }}>
            <PenLine size={18} strokeWidth={1.8} />프리즘 작성
          </button>
        </div>

        {/* 계정 섹션 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>계정</div>

          <Link href="/mypage" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              <User size={18} strokeWidth={2.2} />마이페이지
            </div>
          </Link>

          {[
            { href: '/growth',        icon: TrendingUp, label: '성장기록' },
            { href: '/notifications', icon: Bell,       label: '알림' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="mypage-main">

        {/* 스티키 헤더 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)', padding: '20px 20px 16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a0a0a', margin: 0, letterSpacing: '-0.5px' }}>마이페이지</h1>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── 프로필 히어로 카드 ── */}
          <div style={{ background: 'linear-gradient(145deg,#fdfcff,#f0ecff)', border: '1px solid #ebe6fa', borderRadius: 16, padding: 24 }}>

            {/* 아바타 + 닉네임 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#c8b8f8,#98ccf4,#f4a8d8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {loading ? '·' : initial}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0a0a0a', marginBottom: 3 }}>
                  {loading ? '불러오는 중...' : profile.nickname}
                </div>
                <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: '#eeebff', color: '#5040b0', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{profile.job}</span>
                  <span style={{ background: '#e0eaff', color: '#0052cc', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{profile.company}</span>
                  {/* 베타: 산업 숨김 */}
                  {false && <span style={{ background: '#e0eaff', color: '#0066ff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{profile.industry}</span>}
                  {stats.streak >= 7 && <span>🔥</span>}
                </div>
              </div>
            </div>

            {/* 통계 3개 */}
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { num: stats.totalPrisms, label: '프리즘' },
                { num: stats.streak,      label: '연속 일수' },
                { num: earnedCount,       label: '획득 배지' },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{loading ? '-' : num}</div>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 배지 섹션 ── */}
          <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={15} color="#4F46E5" /> 배지
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.badges.map(badge => (
                <div key={badge.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  opacity: badge.earned ? 1 : 0.35,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: badge.earned ? 'linear-gradient(135deg,#eeebff,#e0eaff)' : '#f7f7f8',
                    border: badge.earned ? '1.5px solid #c8b8f8' : '1px solid #e4e4e4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {badge.icon}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: badge.earned ? '#4F46E5' : '#aaa', textAlign: 'center', maxWidth: 52 }}>{badge.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 메뉴 카드 ── */}
          <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '0 20px' }}>

            {/* 성장 기록 */}
            <button type="button" onClick={() => router.push('/growth')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={16} color="#4F46E5" />
                <span style={menuLabelStyle}>나의 성장 기록</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#888' }}>총 {stats.totalPrisms}개 · {stats.streak}일 연속</span>
                <ChevronRight size={15} color="#aaa" />
              </div>
            </button>

            {/* 직무·기업 설정 */}
            <button type="button" onClick={() => router.push('/settings/profile')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Settings size={16} color="#555" />
                <span style={menuLabelStyle}>직무 · 기업 설정</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>

            {/* 알림 설정 */}
            <button type="button" onClick={() => router.push('/settings/notifications')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={16} color="#555" />
                <span style={menuLabelStyle}>알림 설정</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: profile.notification_on ? '#4F46E5' : '#aaa', fontWeight: 600 }}>
                  {profile.notification_on ? 'ON' : 'OFF'}
                </span>
                <ChevronRight size={15} color="#aaa" />
              </div>
            </button>

            {/* 루틴 설정 */}
            <button type="button" onClick={() => router.push('/settings/routine')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CalendarDays size={16} color="#555" />
                <span style={menuLabelStyle}>루틴 설정</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>

            {/* 데이터 내보내기 */}
            <button type="button" onClick={handleExport} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Download size={16} color="#555" />
                <span style={menuLabelStyle}>프리즘 기록 내보내기</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>

            {/* 문의하기 */}
            <button type="button" onClick={() => router.push('/settings/feedback')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={16} color="#555" />
                <span style={menuLabelStyle}>문의하기</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>
            
            
            {/* 이용약관 */}
            <button type="button" onClick={() => router.push('/settings/terms')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={16} color="#555" />
                <span style={menuLabelStyle}>이용약관</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>

            {/* 개인정보처리방침 */}
            <button type="button" onClick={() => router.push('/settings/privacy')} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={16} color="#555" />
                <span style={menuLabelStyle}>개인정보처리방침</span>
              </div>
              <ChevronRight size={15} color="#aaa" />
            </button>

            {/* 기업 HR 노출 — 베타: 숨김 */}
            {false && (
              <button type="button" style={menuItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Layers size={16} color="#555" />
                  <span style={menuLabelStyle}>기업 HR 담당자 노출</span>
                </div>
                <ChevronRight size={15} color="#aaa" />
              </button>
            )}

            {/* 로그아웃 */}
            <button type="button" onClick={openLogoutConfirm} disabled={loggingOut} style={menuItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LogOut size={16} color="#e53e3e" />
                <span style={{ ...menuLabelStyle, color: '#e53e3e' }}>{loggingOut ? '로그아웃 중...' : '로그아웃'}</span>
              </div>
              <ChevronRight size={15} color="#ddd" />
            </button>

            {/* 회원탈퇴 */}
            <button
              type="button"
              onClick={() => { setShowWithdrawModal(true); setWithdrawPassword(''); setWithdrawError('') }}
              disabled={withdrawing}
              style={{ ...menuItemStyle, borderBottom: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#ccc' }}>
                  {withdrawing ? '탈퇴 중...' : '회원탈퇴'}
                </span>
              </div>
            </button>
          </div>

        </div>
      </main>

      {/* 로그아웃 확인 모달 */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 300, backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 340,
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>로그아웃</div>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
              로그아웃 하시겠어요?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowLogoutConfirm(false)} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e4e4e4',
                background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#3b3b41',
              }}>취소</button>
              <button type="button" onClick={() => { setShowLogoutConfirm(false); handleLogout() }} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: '#e53e3e', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff',
              }}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 300, backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 340,
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>회원탈퇴</div>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 6 }}>
              탈퇴하면 모든 프리즘 기록이 <strong>영구 삭제</strong>되며 복구할 수 없어요.
            </p>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, marginBottom: 20 }}>
              계속하려면 비밀번호를 입력해 주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호"
              value={withdrawPassword}
              onChange={e => setWithdrawPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid #e4e4e4', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', marginBottom: withdrawError ? 8 : 20,
              }}
            />
            {withdrawError && (
              <p style={{ fontSize: 12, color: '#e53e3e', marginBottom: 16 }}>{withdrawError}</p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setShowWithdrawModal(false); setWithdrawPassword(''); setWithdrawError('') }} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e4e4e4',
                background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#3b3b41',
              }}>취소</button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawPassword.length === 0}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: withdrawing || withdrawPassword.length === 0 ? '#e4e4e4' : '#e53e3e',
                  fontSize: 14, fontWeight: 700, cursor: withdrawing || withdrawPassword.length === 0 ? 'not-allowed' : 'pointer',
                  color: withdrawing || withdrawPassword.length === 0 ? '#aaa' : '#fff',
                }}
              >
                {withdrawing ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
      <BottomNav />

      <style>{`
        @media (min-width: 768px) {
          .mypage-sidebar { display: flex !important; }
          .mypage-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .mypage-sidebar { display: none !important; }
          .mypage-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

// ─── 공통 스타일 ─────────────────────────────────────────────────────────────

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 0',
  width: '100%', background: 'none', border: 'none',
  borderBottom: '0.5px solid #e4e4e4',
  cursor: 'pointer', textAlign: 'left',
}

const menuLabelStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 500, color: '#3b3b41',
}