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

const CATEGORIES = [
  { value: 'bug',        label: '🐛 버그 신고' },
  { value: 'feature',    label: '✨ 기능 개선 요청' },
  { value: 'content',    label: '📰 콘텐츠 관련' },
  { value: 'account',    label: '👤 계정 문의' },
  { value: 'other',      label: '💬 기타 문의' },
]

export default function FeedbackPage() {
  const router = useRouter()
  const supabase = createClient()

  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState('')
  const [showPrismModal, setShowPrismModal] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single()
    if (data) setNickname(data.nickname || '')
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    if (!category || body.trim().length < 5) return
    setSubmitting(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const { error } = await supabase.from('feedbacks').insert({
        user_id: user.id,
        nickname,
        category,
        body: body.trim(),
      })
      if (error) throw error
      setDone(true)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = !!category && body.trim().length >= 5 && !submitting

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* 사이드바 */}
      <aside className="feedback-sidebar" style={{
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

      {/* 메인 */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="feedback-main">

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button type="button" onClick={() => router.push('/mypage')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
            <ChevronLeft size={22} color="#0a0a0a" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>문의하기</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : done ? (
          /* 완료 화면 */
          <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}>💙</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a' }}>소중한 의견 감사해요!</div>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: 0 }}>
              빠르게 검토하고 서비스에 반영할게요.<br />
              더 좋은 AHALOGUE가 되겠습니다.
            </p>
            <button
              type="button"
              onClick={() => router.push('/mypage')}
              style={{
                marginTop: 8, padding: '12px 28px', borderRadius: 12, border: 'none',
                background: '#0066ff', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              마이페이지로 돌아가기
            </button>
          </div>
        ) : (
          <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* 안내 */}
            <div style={{
              background: '#EEF2FF', border: '1px solid #c7d2fe',
              borderRadius: 14, padding: '14px 16px',
              fontSize: 13, color: '#4F46E5', lineHeight: 1.6,
            }}>
              불편한 점이나 개선 아이디어를 자유롭게 남겨주세요.<br />
              <span style={{ fontSize: 12, color: '#818cf8' }}>모든 의견을 직접 읽고 반영해요.</span>
            </div>

            {/* 카테고리 */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 12 }}>문의 유형</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    style={{
                      padding: '11px 14px', borderRadius: 10, textAlign: 'left',
                      border: category === c.value ? '1.5px solid #4F46E5' : '1.5px solid #e4e4e4',
                      background: category === c.value ? '#EEF2FF' : '#fafafa',
                      color: category === c.value ? '#4F46E5' : '#3b3b41',
                      fontSize: 13, fontWeight: category === c.value ? 700 : 500,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 내용 */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e4', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 12 }}>
                내용
                <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6 }}>({body.length}자)</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="문의 내용을 자유롭게 작성해 주세요."
                rows={6}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1px solid #e4e4e4', fontSize: 14, lineHeight: 1.7,
                  color: '#0a0a0a', outline: 'none', resize: 'none',
                  fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
                  boxSizing: 'border-box',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4F46E5' }}
                onBlur={(e) => { e.target.style.borderColor = '#e4e4e4' }}
              />
            </div>

            {message && (
              <p style={{ fontSize: 13, color: '#e53e3e', margin: 0, textAlign: 'center' }}>{message}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: canSubmit ? '#0066ff' : '#e4e4e4',
                color: canSubmit ? '#fff' : '#aaa',
                fontSize: 14, fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all .15s',
              }}
            >
              {submitting ? '제출 중...' : '문의 제출하기'}
            </button>

          </div>
        )}
      </main>

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
      <BottomNav />

      <style>{`
        @media (min-width: 768px) {
          .feedback-sidebar { display: flex !important; }
          .feedback-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .feedback-sidebar { display: none !important; }
          .feedback-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}