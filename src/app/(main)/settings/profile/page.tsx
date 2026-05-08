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

const JOB_FIELDS = ['PB', '여신', '리스크', 'IT', '디지털']
const TARGET_COMPANIES = ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e4e4e4',
  fontSize: '14px',
  color: '#0a0a0a',
  outline: 'none',
  boxSizing: 'border-box' as const,
  marginTop: 8,
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [jobField, setJobField] = useState('')
  const [jobEtc, setJobEtc] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [companyEtc, setCompanyEtc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [targetDateEtc, setTargetDateEtc] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPrismModal, setShowPrismModal] = useState(false)

  const TARGET_PERIODS = [
    { label: '2026 하반기', value: '2026 하반기' },
    { label: '2027 상반기', value: '2027 상반기' },
    { label: '2027 하반기', value: '2027 하반기' },
    { label: '기타 (직접 입력)', value: '기타' },
  ]

  // 기존 데이터 불러오기
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('job, company, target_date')
        .eq('id', user.id)
        .single()

      if (data) {
        // 직무
        if (JOB_FIELDS.includes(data.job)) {
          setJobField(data.job)
        } else if (data.job) {
          setJobField('기타')
          setJobEtc(data.job)
        }
        // 기업
        if (TARGET_COMPANIES.includes(data.company)) {
          setTargetCompany(data.company)
        } else if (data.company) {
          setTargetCompany('기타')
          setCompanyEtc(data.company)
        }
        // 목표 시기
        const periods = TARGET_PERIODS.map(p => p.value)
        if (periods.includes(data.target_date)) {
          setTargetDate(data.target_date)
        } else if (data.target_date) {
          setTargetDate('기타')
          setTargetDateEtc(data.target_date)
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
          job: jobField === '기타' ? jobEtc.trim() : jobField,
          company: targetCompany === '기타' ? companyEtc.trim() : targetCompany,
          target_date: targetDate === '기타' ? targetDateEtc.trim() : targetDate,
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

  const canSave =
    !!jobField && !!targetCompany &&
    (jobField !== '기타' || jobEtc.trim().length > 0) &&
    (targetCompany !== '기타' || companyEtc.trim().length > 0) &&
    (!!targetDate && (targetDate !== '기타' || targetDateEtc.trim().length > 0))

  // 칩 렌더
  function renderChip(
    value: string,
    selected: boolean,
    onClick: (v: string) => void,
    tone: 'job' | 'company' | 'neutral' = 'neutral',
    displayLabel?: string
  ) {
    const toneStyle =
      tone === 'job' ? { background: '#eeebff', color: '#5040b0' } :
      tone === 'company' ? { background: '#e6f8f2', color: '#1a7a58' } :
      { background: '#f7f7f8', color: '#3b3b41' }
    return (
      <button
        key={value}
        type="button"
        onClick={() => onClick(value)}
        style={{
          border: 'none', borderRadius: '100px', padding: '8px 14px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          ...(selected ? { background: '#0a0a0a', color: '#fff' } : toneStyle),
        }}
      >
        {displayLabel ?? value}
      </button>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* 사이드바 */}
      <aside className="settings-sidebar" style={{
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
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="settings-main">

        {/* 헤더 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => router.push('/mypage')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
            <ChevronLeft size={22} color="#0a0a0a" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>직무 · 기업 설정</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : (
          <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 직무 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 14 }}>지망 직무</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {JOB_FIELDS.map(v => renderChip(v, v === jobField, setJobField, 'job'))}
                {renderChip('기타', jobField === '기타', setJobField, 'job')}
              </div>
              {jobField === '기타' && (
                <input
                  style={inputStyle}
                  value={jobEtc}
                  onChange={e => setJobEtc(e.target.value)}
                  placeholder="직무를 직접 입력해 주세요"
                />
              )}
            </div>

            {/* 기업 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 14 }}>지망 기업</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TARGET_COMPANIES.map(v => renderChip(v, v === targetCompany, setTargetCompany, 'company'))}
                {renderChip('기타', targetCompany === '기타', setTargetCompany, 'company')}
              </div>
              {targetCompany === '기타' && (
                <input
                  style={inputStyle}
                  value={companyEtc}
                  onChange={e => setCompanyEtc(e.target.value)}
                  placeholder="기업을 직접 입력해 주세요"
                />
              )}
            </div>

            {/* 목표 시기 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 14 }}>취업 목표 시기</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TARGET_PERIODS.map(({ label, value }) =>
                  renderChip(value, targetDate === value, () => setTargetDate(value), 'neutral', label)
                )}
              </div>
              {targetDate === '기타' && (
                <input
                  style={inputStyle}
                  value={targetDateEtc}
                  onChange={e => setTargetDateEtc(e.target.value)}
                  placeholder="예: 2028 상반기"
                />
              )}
            </div>

            {/* 저장 버튼 */}
            {message && (
              <p style={{ fontSize: 13, color: message === '저장됐어요!' ? '#0066ff' : '#e53e3e', margin: 0, textAlign: 'center' }}>{message}</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: canSave && !saving ? '#0066ff' : '#e4e4e4',
                color: canSave && !saving ? '#fff' : '#aaa',
                fontSize: 14, fontWeight: 700, cursor: canSave && !saving ? 'pointer' : 'not-allowed',
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
          .settings-sidebar { display: flex !important; }
          .settings-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .settings-sidebar { display: none !important; }
          .settings-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
