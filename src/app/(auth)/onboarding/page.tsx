'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties, TouchEventHandler } from 'react'

import { createClient } from '@/lib/supabase/client'

const JOB_FIELDS = ['PB', '여신', '리스크', 'IT', '디지털']
const TARGET_COMPANIES = ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']
const INDUSTRIES = ['은행', '핀테크', '보험', '증권']

// 연/월 선택용 — 현재 달부터 24개월
const generateTargetMonths = () => {
  const months: { label: string; value: string }[] = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push({
      label: `${d.getFullYear()}년 ${d.getMonth() + 1}월`,
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
    })
  }
  return months
}
const TARGET_MONTHS = generateTargetMonths()

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg)',
  display: 'flex',
  justifyContent: 'center',
  padding: '16px',
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '390px',
  background: '#fff',
  border: '0.5px solid var(--border)',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '26px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
}

const bodyStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: 'var(--fg3)',
  lineHeight: 1.7,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--ink)',
  outline: 'none',
}

const buttonStyle: CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  border: 'none',
  padding: '13px 15px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [nickname, setNickname] = useState('')
  const [jobField, setJobField] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [notificationOn, setNotificationOn] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const canGoNext =
    step === 0 ||
    (step === 1 && nickname.trim().length > 0) ||
    (step === 2 && !!jobField && !!targetCompany) ||
    (step === 3 && !!targetDate) ||
    step === 4

  const moveStep = (nextStep: number) => setStep(Math.max(0, Math.min(4, nextStep)))
  const onTouchStart: TouchEventHandler<HTMLDivElement> = (event) =>
    setTouchStartX(event.changedTouches[0]?.clientX ?? null)
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX
    const delta = endX - touchStartX
    if (delta < -40) moveStep(step + 1)
    if (delta > 40) moveStep(step - 1)
    setTouchStartX(null)
  }

  const saveProfile = async () => {
    setMessage('')
    setSubmitting(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('로그인이 필요합니다.')

        const { error } = await supabase.from('users').upsert({
          id: user.id,
          nickname: nickname.trim(),
          job: jobField,
          company: targetCompany,
          industry,
          target_date: targetDate,
          notification_on: notificationOn,
        })
        if (error) throw error
      router.push('/home')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '온보딩 저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderChip = (
    value: string,
    selected: boolean,
    onClick: (next: string) => void,
    tone: 'job' | 'company' | 'industry' | 'neutral' = 'neutral'
  ) => {
    const toneStyle =
      tone === 'job'
        ? { background: '#eeebff', color: '#5040b0' }
        : tone === 'company'
          ? { background: '#e6f8f2', color: '#1a7a58' }
          : tone === 'industry'
            ? { background: '#e0eaff', color: '#0066ff' }
            : { background: '#f7f7f8', color: 'var(--fg2)' }
    return (
      <button
        key={value}
        type="button"
        onClick={() => onClick(value)}
        style={{
          border: 'none',
          borderRadius: '100px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          ...(selected ? { background: 'var(--ink)', color: '#fff' } : toneStyle),
        }}
      >
        {value}
      </button>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              style={{
                height: '6px',
                flex: 1,
                borderRadius: '999px',
                background: index <= step ? 'var(--blue)' : 'var(--blue-sub)',
              }}
            />
          ))}
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: '500%',
              transform: `translateX(-${step * 20}%)`,
              transition: 'transform 0.25s ease',
            }}
          >
            <section style={{ width: '20%', paddingRight: '8px' }}>
              <h1 style={titleStyle}>AHALOGUE에 오신 걸 환영해요</h1>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>
                나만의 프리즘 아카이브를 시작하기 전에 간단한 설정을 진행할게요.
              </p>
            </section>

            <section style={{ width: '20%', paddingRight: '8px' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>닉네임을 입력해 주세요</h2>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>프로필에 표시될 이름이에요.</p>
              <div style={{ marginTop: '12px' }}>
                <input
                  style={inputStyle}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="닉네임"
                />
              </div>
            </section>

            <section style={{ width: '20%', paddingRight: '8px' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>
                목표 정보를 선택해 주세요
              </h2>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>지망 직무, 기업, 산업을 각각 하나씩 선택해 주세요.</p>
              <div style={{ marginTop: '12px', display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {JOB_FIELDS.map((value) =>
                    renderChip(value, value === jobField, setJobField, 'job')
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TARGET_COMPANIES.map((value) =>
                    renderChip(value, value === targetCompany, setTargetCompany, 'company')
                  )}
                </div>
                {/* 베타: 은행권 중심, 산업 선택 숨김 */}
{false && (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {INDUSTRIES.map((value) =>
      renderChip(value, value === industry, setIndustry, 'industry')
    )}
  </div>
  )}
              </div>
            </section>

            <section style={{ width: '20%', paddingRight: '8px' }}>
  <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>
    취업 목표 시기를 선택해 주세요
  </h2>
  <p style={{ ...bodyStyle, marginTop: '10px' }}>목표 월을 선택해 주세요.</p>
  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '200px', overflowY: 'auto' }}>
    {TARGET_MONTHS.map(({ label, value }) =>
      renderChip(label, value === targetDate, () => setTargetDate(value))
    )}
  </div>
</section>

            <section style={{ width: '20%' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>알림 설정</h2>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>새 콘텐츠와 추천 알림을 받을지 선택해 주세요.</p>
              <button
                type="button"
                onClick={() => setNotificationOn((prev) => !prev)}
                style={{
                  marginTop: '12px',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: notificationOn ? 'var(--ink)' : '#f7f7f8',
                  color: notificationOn ? '#fff' : 'var(--fg2)',
                }}
              >
                {notificationOn ? '알림 ON' : '알림 OFF'}
              </button>
            </section>
          </div>
        </div>

        {message && (
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--danger)' }}>{message}</p>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => moveStep(step - 1)}
              style={{
                ...buttonStyle,
                background: '#fff',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
              }}
            >
              이전
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => moveStep(step + 1)}
              disabled={!canGoNext}
              style={{
                ...buttonStyle,
                background: 'var(--blue)',
                color: '#fff',
                opacity: canGoNext ? 1 : 0.45,
              }}
            >
              {step === 0 ? '시작하기' : '다음'}
            </button>
          ) : (
            <button
              type="button"
              onClick={saveProfile}
              disabled={submitting}
              style={{
                ...buttonStyle,
                background: 'var(--blue)',
                color: '#fff',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? '저장 중...' : '완료하고 홈으로'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}