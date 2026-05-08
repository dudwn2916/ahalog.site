'use client'

import BottomNav from '@/components/ui/BottomNav'
import PrismModal from '@/components/ui/PrismModal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Archive, BookOpen, PenLine, User, TrendingUp, Bell, ChevronLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

export default function NotificationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [serviceNotiOn, setServiceNotiOn] = useState(true)
  const [cardNotiOn, setCardNotiOn] = useState(true)
  const [cardNotiHour, setCardNotiHour] = useState('08')
  const [cardNotiMin, setCardNotiMin] = useState('00')
  const [articleNotiOn, setArticleNotiOn] = useState(true)
  const [articleNotiHour, setArticleNotiHour] = useState('09')
  const [articleNotiMin, setArticleNotiMin] = useState('00')
  const [selfNotiOn, setSelfNotiOn] = useState(true)
  const [selfNotiHour, setSelfNotiHour] = useState('20')
  const [selfNotiMin, setSelfNotiMin] = useState('00')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPrismModal, setShowPrismModal] = useState(false)

  // 기존 데이터 불러오기
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('service_noti_on, card_noti_on, card_noti_time, article_noti_on, article_noti_time, self_noti_on, self_noti_time')
        .eq('id', user.id)
        .single()

      if (data) {
        setServiceNotiOn(data.service_noti_on ?? true)
        setCardNotiOn(data.card_noti_on ?? true)
        setArticleNotiOn(data.article_noti_on ?? true)
        setSelfNotiOn(data.self_noti_on ?? true)

        // 시간 파싱 (HH:MM)
        if (data.card_noti_time) {
          const [h, m] = data.card_noti_time.split(':')
          setCardNotiHour(h)
          setCardNotiMin(m)
        }
        if (data.article_noti_time) {
          const [h, m] = data.article_noti_time.split(':')
          setArticleNotiHour(h)
          setArticleNotiMin(m)
        }
        if (data.self_noti_time) {
          const [h, m] = data.self_noti_time.split(':')
          setSelfNotiHour(h)
          setSelfNotiMin(m)
        }
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 저장
  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const { error } = await supabase
        .from('users')
        .update({
          notification_on: serviceNotiOn,
          service_noti_on: serviceNotiOn,
          card_noti_on: cardNotiOn,
          card_noti_time: `${cardNotiHour}:${cardNotiMin}`,
          article_noti_on: articleNotiOn,
          article_noti_time: `${articleNotiHour}:${articleNotiMin}`,
          self_noti_on: selfNotiOn,
          self_noti_time: `${selfNotiHour}:${selfNotiMin}`,
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage('저장됐어요!')
      setTimeout(() => router.push('/mypage'), 1000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 토글 컴포넌트
  function Toggle({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => setOn(!on)}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
          background: on ? '#0066ff' : '#e4e4e4',
          position: 'relative', flexShrink: 0, transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: on ? 21 : 3,
          transition: 'left 0.2s',
        }} />
      </button>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* 사이드바 */}
      <aside className="noti-sidebar" style={{
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
            { href: '/home', icon: Home, label: '홈' },
            { href: '/archive', icon: Archive, label: '아카이브' },
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
          <Link href="/mypage" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: 14 }}>
              <User size={18} strokeWidth={2.2} />마이페이지
            </div>
          </Link>
          {[
            { href: '/growth', icon: TrendingUp, label: '성장기록' },
            { href: '/notifications', icon: Bell, label: '알림' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14 }}>
                <Icon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* 메인 */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="noti-main">

        {/* 헤더 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => router.push('/mypage')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
            <ChevronLeft size={22} color="#0a0a0a" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>알림 설정</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : (
          <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* 서비스 알림 */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔔</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>서비스 알림</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>업데이트·공지 알림</div>
                  </div>
                </div>
                <Toggle on={serviceNotiOn} setOn={setServiceNotiOn} />
              </div>
            </div>

            {/* 안내 문구 */}
            <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0', lineHeight: 1.6 }}>
              각자의 루틴에 맞게 알림 시간을 설정하면 더 꾸준히 이어갈 수 있어요.
            </p>

            {/* 프리즘 알림 3개 */}
            {[
              {
                icon: '✦', label: '인사이트 워밍업', desc: '오늘의 금융·경제 용어와 개념 카드 알림',
                on: cardNotiOn, setOn: setCardNotiOn,
                hour: cardNotiHour, setHour: setCardNotiHour,
                min: cardNotiMin, setMin: setCardNotiMin,
              },
              {
                icon: '📰', label: '세상 한 조각', desc: '오늘의 경제·시사 기사 큐레이션 알림',
                on: articleNotiOn, setOn: setArticleNotiOn,
                hour: articleNotiHour, setHour: setArticleNotiHour,
                min: articleNotiMin, setMin: setArticleNotiMin,
              },
              {
                icon: '🪞', label: '나를 만드는 질문', desc: '나를 깊이 탐색하는 자기이해 질문 알림',
                on: selfNotiOn, setOn: setSelfNotiOn,
                hour: selfNotiHour, setHour: setSelfNotiHour,
                min: selfNotiMin, setMin: setSelfNotiMin,
              },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.on ? 14 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                  <Toggle on={item.on} setOn={item.setOn} />
                </div>

                {item.on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 30 }}>
                    <span style={{ fontSize: 12, color: '#555', minWidth: 48 }}>알림 시간</span>
                    <select
                      value={item.hour}
                      onChange={e => item.setHour(e.target.value)}
                      style={{ padding: '6px 10px', border: '1px solid #e4e4e4', borderRadius: 8, fontSize: 13, background: '#fff', color: '#0a0a0a', outline: 'none' }}
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                    <select
                      value={item.min}
                      onChange={e => item.setMin(e.target.value)}
                      style={{ padding: '6px 10px', border: '1px solid #e4e4e4', borderRadius: 8, fontSize: 13, background: '#fff', color: '#0a0a0a', outline: 'none' }}
                    >
                      {MINS.map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}

            {/* 저장 버튼 */}
            {message && (
              <p style={{ fontSize: 13, color: message === '저장됐어요!' ? '#0066ff' : '#e53e3e', margin: 0, textAlign: 'center' }}>{message}</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: saving ? '#e4e4e4' : '#0066ff',
                color: saving ? '#aaa' : '#fff',
                fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
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
          .noti-sidebar { display: flex !important; }
          .noti-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .noti-sidebar { display: none !important; }
          .noti-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}