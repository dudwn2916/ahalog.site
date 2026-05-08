'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties, TouchEventHandler } from 'react'

import { createClient } from '@/lib/supabase/client'

const JOB_FIELDS = ['PB', '여신', '리스크', 'IT', '디지털']
const TARGET_COMPANIES = ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']
const INDUSTRIES = ['은행', '핀테크', '보험', '증권']

const TARGET_PERIODS = [
  { label: '2026 하반기', value: '2026 하반기' },
  { label: '2027 상반기', value: '2027 상반기' },
  { label: '2027 하반기', value: '2027 하반기' },
  { label: '기타 (직접 입력)', value: '기타' },
]

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

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
  height: 'calc(100vh - 32px)',  // pageStyle padding 16px * 2
  maxHeight: '780px',
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
  const [targetDateEtc, setTargetDateEtc] = useState('')
  const [jobEtc, setJobEtc] = useState('')
  const [companyEtc, setCompanyEtc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // 서비스 알림
  type RoutineType = 'card' | 'opinion' | 'self'
  type DayKey = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'
  interface DayRoutine { enabled: boolean; types: RoutineType[] }
  type Routine = Record<DayKey, DayRoutine>

  const [routine, setRoutine] = useState<Routine>({
    mon: { enabled: true,  types: ['card'] },
    tue: { enabled: true,  types: ['opinion'] },
    wed: { enabled: true,  types: ['self'] },
    thu: { enabled: true,  types: ['card', 'opinion'] },
    fri: { enabled: true,  types: ['self'] },
    sat: { enabled: false, types: [] },
    sun: { enabled: false, types: [] },
  })

  function toggleRoutineDay(day: DayKey) {
    setRoutine(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        types: !prev[day].enabled && prev[day].types.length === 0 ? ['card'] : prev[day].types,
      },
    }))
  }

  function toggleRoutineType(day: DayKey, type: RoutineType) {
    setRoutine(prev => {
      const current = prev[day].types
      if (current.includes(type) && current.length === 1) return prev
      return {
        ...prev,
        [day]: {
          ...prev[day],
          types: current.includes(type) ? current.filter(t => t !== type) : [...current, type],
        },
      }
    })
  }

  // 서비스 알림
  const [serviceNotiOn, setServiceNotiOn] = useState(true)

  // 프리즘 알림 개별 설정
  const [cardNotiOn, setCardNotiOn] = useState(true)
  const [cardNotiHour, setCardNotiHour] = useState('08')
  const [cardNotiMin, setCardNotiMin] = useState('00')

  const [articleNotiOn, setArticleNotiOn] = useState(true)
  const [articleNotiHour, setArticleNotiHour] = useState('09')
  const [articleNotiMin, setArticleNotiMin] = useState('00')

  const [selfNotiOn, setSelfNotiOn] = useState(true)
  const [selfNotiHour, setSelfNotiHour] = useState('20')
  const [selfNotiMin, setSelfNotiMin] = useState('00')

  const canGoNext =
    step === 0 ||
    (step === 1 && nickname.trim().length >= 2) ||
    (step === 2 && !!jobField && !!targetCompany &&
      (jobField !== '기타' || jobEtc.trim().length > 0) &&
      (targetCompany !== '기타' || companyEtc.trim().length > 0)) ||
    (step === 3 && !!targetDate &&
      (targetDate !== '기타' || targetDateEtc.trim().length > 0)) ||
      step === 4 ||
      step === 5 ||
      step === 6

    const moveStep = (nextStep: number) => setStep(Math.max(0, Math.min(6, nextStep)))
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

  const saveProfile = async (): Promise<boolean> => {
    setMessage('')
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')
  
      // 닉네임 중복 체크
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('nickname', nickname.trim())
        .neq('id', user.id)
        .maybeSingle()
  
      if (existing) {
        throw new Error('이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해 주세요.')
      }
  
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        nickname: nickname.trim(),
        job: jobField === '기타' ? jobEtc.trim() : jobField,
        company: targetCompany === '기타' ? companyEtc.trim() : targetCompany,
        industry,
        target_date: targetDate === '기타' ? targetDateEtc.trim() : targetDate,
        notification_on: serviceNotiOn,
        service_noti_on: serviceNotiOn,
        card_noti_on: cardNotiOn,
        card_noti_time: `${cardNotiHour.padStart(2, '0')}:${cardNotiMin}`,
        article_noti_on: articleNotiOn,
        article_noti_time: `${articleNotiHour.padStart(2, '0')}:${articleNotiMin}`,
        self_noti_on: selfNotiOn,
        self_noti_time: `${selfNotiHour.padStart(2, '0')}:${selfNotiMin}`,
        routine,
      })
      if (error) throw error
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '온보딩 저장 중 오류가 발생했습니다.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const renderChip = (
    value: string,
    selected: boolean,
    onClick: (next: string) => void,
    tone: 'job' | 'company' | 'industry' | 'neutral' = 'neutral',
    displayLabel?: string
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
        {displayLabel ?? value}
      </button>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
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

        <div style={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: 'flex',
              width: '700%',
              height: '100%',
              transform: `translateX(-${step * (100 / 7)}%)`,
              transition: 'transform 0.25s ease',
            }}
          >
            <section style={{ width: `${100 / 7}%`, paddingRight: '8px', overflowY: 'auto', height: '100%' }}>
              <h1 style={titleStyle}>AHALOGUE에 오신 걸 환영해요</h1>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>
                나만의 프리즘 아카이브를 시작하기 전에 간단한 설정을 진행할게요.
              </p>
            </section>

            <section style={{ width: `${100 / 7}%`, paddingRight: '8px', overflowY: 'auto', height: '100%' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>닉네임을 입력해 주세요</h2>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>프로필에 표시될 이름이에요.</p>
              <div style={{ marginTop: '12px' }}>
                <input
                  style={inputStyle}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="닉네임"
                />
                {nickname.trim().length > 0 && nickname.trim().length < 2 && (
                  <p style={{ fontSize: 12, color: '#e53e3e', marginTop: 6 }}>닉네임은 2글자 이상이어야 해요.</p>
                )}
              </div>
            </section>

            <section style={{ width: `${100 / 7}%`, paddingRight: '8px', overflowY: 'auto', height: '100%' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>
                목표 정보를 선택해 주세요
              </h2>
              <p style={{ ...bodyStyle, marginTop: '10px' }}>지망 직무, 기업, 산업을 각각 하나씩 선택해 주세요.</p>
              <div style={{ marginTop: '12px', display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {JOB_FIELDS.map((value) =>
                    renderChip(value, value === jobField, setJobField, 'job')
                  )}
                  {renderChip('기타', jobField === '기타', setJobField, 'job')}
                  {jobField === '기타' && (
                    <input
                      style={{ ...inputStyle, marginTop: 8 }}
                      value={jobEtc}
                      onChange={(e) => setJobEtc(e.target.value)}
                      placeholder="직무를 직접 입력해 주세요"
                    />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {TARGET_COMPANIES.map((value) =>
                    renderChip(value, value === targetCompany, setTargetCompany, 'company')
                  )}
                  {renderChip('기타', targetCompany === '기타', setTargetCompany, 'company')}
                  {targetCompany === '기타' && (
                    <input
                      style={{ ...inputStyle, marginTop: 8 }}
                      value={companyEtc}
                      onChange={(e) => setCompanyEtc(e.target.value)}
                      placeholder="기업을 직접 입력해 주세요"
                    />
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

            <section style={{ width: `${100 / 7}%`, paddingRight: '8px', overflowY: 'auto', height: '100%' }}>
  <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>
    취업 목표 시기를 선택해 주세요
  </h2>
  <p style={{ ...bodyStyle, marginTop: '10px' }}>목표 시기를 선택해 주세요.</p>
  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {TARGET_PERIODS.map(({ label, value }) =>
      renderChip(value, targetDate === value, () => setTargetDate(value), 'neutral', label)
    )}
  </div>
  {targetDate === '기타' && (
    <input
      style={{ ...inputStyle, marginTop: 12 }}
      value={targetDateEtc}
      onChange={(e) => setTargetDateEtc(e.target.value)}
      placeholder="예: 2028 상반기"
    />
  )}
</section>

<section style={{ width: `${100 / 7}%`, paddingRight: '8px', overflowY: 'auto', height: '100%' }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>루틴 설정</h2>
              <p style={{ ...bodyStyle, marginTop: '10px', marginBottom: '16px' }}>
                요일마다 할 루틴을 설정하세요. 마이페이지에서 언제든 변경할 수 있어요.
              </p>
              {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((day) => {
                const DAY_LABELS = { mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토', sun:'일' }
                const d = routine[day]
                const isWeekend = day === 'sat' || day === 'sun'
                return (
                  <div key={day} style={{
                    background: '#fff', border: `1px solid ${d.enabled ? '#c7d2fe' : '#e4e4e4'}`,
                    borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                    opacity: d.enabled ? 1 : 0.6, transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: d.enabled ? 12 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: d.enabled ? '#0a0a0a' : '#aaa', minWidth: 16 }}>
                          {DAY_LABELS[day]}
                        </span>
                        {isWeekend && <span style={{ fontSize: 11, color: '#bbb' }}>주말</span>}
                        {d.enabled && d.types.map(t => {
                          const meta = { card:{label:'카드뉴스',bg:'#fff4e6',color:'#b05000'}, opinion:{label:'기사',bg:'#e6f7ee',color:'#1a7a48'}, self:{label:'자기이해',bg:'#e0eaff',color:'#0052cc'} }[t]
                          return <span key={t} style={{ fontSize: 10, fontWeight: 700, background: meta.bg, color: meta.color, borderRadius: 6, padding: '2px 7px' }}>{meta.label}</span>
                        })}
                      </div>
                      <button type="button" onClick={() => toggleRoutineDay(day)} style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                        background: d.enabled ? '#4F46E5' : '#e4e4e4', position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                      }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: d.enabled ? 21 : 3, transition: 'left 0.2s' }} />
                      </button>
                    </div>
                    {d.enabled && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(['card','opinion','self'] as const).map(type => {
                          const selected = d.types.includes(type)
                          const meta = { card:{label:'카드뉴스',bg:'#fff4e6',color:'#b05000'}, opinion:{label:'기사',bg:'#e6f7ee',color:'#1a7a48'}, self:{label:'자기이해',bg:'#e0eaff',color:'#0052cc'} }[type]
                          return (
                            <button key={type} type="button" onClick={() => toggleRoutineType(day, type)} style={{
                              flex: 1, padding: '8px 0', borderRadius: 8,
                              border: selected ? `1.5px solid ${meta.color}` : '1.5px solid #e4e4e4',
                              background: selected ? meta.bg : '#fafafa',
                              color: selected ? meta.color : '#aaa',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
                            }}>{meta.label}</button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>

            <section style={{ width: `${100 / 7}%` }}>
              <h2 style={{ ...titleStyle, fontSize: '20px', fontWeight: 700 }}>알림 설정</h2>
              <p style={{ ...bodyStyle, marginTop: '10px', marginBottom: '16px' }}>
                마이페이지에서 언제든 변경할 수 있어요.
              </p>

              {/* ── 서비스 알림 ── */}
              <div style={{
                background: '#fff', border: '1px solid #e4e4e4', borderRadius: 12,
                padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🔔</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>서비스 알림</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>업데이트·공지 알림</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceNotiOn((v) => !v)}
                    style={{
                      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                      background: serviceNotiOn ? '#0066ff' : '#e4e4e4',
                      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: serviceNotiOn ? 21 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 10, lineHeight: 1.6 }}>
              콘텐츠마다 알림 시간을 정하고,
              루틴에 맞춰 받아보세요.
              </p>

              {[
                {
                  icon: '✦',
                  label: '인사이트 워밍업',
                  desc: '오늘의 금융·경제 용어와 개념 카드 알림',
                  on: cardNotiOn, setOn: setCardNotiOn,
                  hour: cardNotiHour, setHour: setCardNotiHour,
                  min: cardNotiMin, setMin: setCardNotiMin,
                },
                {
                  icon: '📰',
                  label: '세상 한 조각',
                  desc: '오늘의 경제·시사 기사 큐레이션 알림',
                  on: articleNotiOn, setOn: setArticleNotiOn,
                  hour: articleNotiHour, setHour: setArticleNotiHour,
                  min: articleNotiMin, setMin: setArticleNotiMin,
                },
                {
                  icon: '🪞',
                  label: '나를 만드는 질문',
                  desc: '나를 깊이 탐색하는 자기이해 질문 알림',
                  on: selfNotiOn, setOn: setSelfNotiOn,
                  hour: selfNotiHour, setHour: setSelfNotiHour,
                  min: selfNotiMin, setMin: setSelfNotiMin,
                },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#fff', border: '1px solid #e4e4e4', borderRadius: 12,
                  padding: '14px 16px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: item.on ? 12 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setOn((v) => !v)}
                      style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                        background: item.on ? '#0066ff' : '#e4e4e4',
                        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: item.on ? 21 : 3,
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>

                  {item.on && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 26 }}>
                      <span style={{ fontSize: 11, color: '#555', minWidth: 48 }}>알림 시간</span>
                      <select
                        value={item.hour}
                        onChange={(e) => item.setHour(e.target.value)}
                        style={{
                          padding: '5px 8px', border: '1px solid #e4e4e4', borderRadius: 8,
                          fontSize: 12, background: '#fff', color: '#0a0a0a', outline: 'none',
                        }}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>
                            {`${h}시`}
                          </option>
                        ))}
                      </select>
                      <select
                        value={item.min}
                        onChange={(e) => item.setMin(e.target.value)}
                        style={{
                          padding: '5px 8px', border: '1px solid #e4e4e4', borderRadius: 8,
                          fontSize: 12, background: '#fff', color: '#0a0a0a', outline: 'none',
                        }}
                      >
                        {MINS.map((m) => (
                          <option key={m} value={m}>{m}분</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section style={{ width: `${100 / 7}%`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px 8px' }}>
            <img src="/logo-diamond.svg" width={80} height={80} alt="AHALOGUE" style={{ marginBottom: 20 }} />
              <h2 style={{ ...titleStyle, fontSize: '22px', fontWeight: 800, marginBottom: 10 }}>
                준비 완료!
              </h2>
              <p style={{ ...bodyStyle, marginBottom: 32, lineHeight: 1.8 }}>
              작은 인사이트부터,<br />{nickname}님만의 언어로 만들어 보세요.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32, width: '100%' }}>
                {[
                  { icon: '✦', label: '인사이트 워밍업', sub: cardNotiOn ? `${cardNotiHour}:${cardNotiMin}` : '준비됨' },
                  { icon: '📰', label: '세상 한 조각', sub: articleNotiOn ? `${articleNotiHour}:${articleNotiMin}` : '준비됨' },
                  { icon: '🪞', label: '나를 만드는 질문', sub: selfNotiOn ? `${selfNotiHour}:${selfNotiMin}` : '준비됨' },
                ].map(({ icon, label, sub }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#3b3b41' }}>{label}</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{sub}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { router.push('/home'); router.refresh() }}
                style={{
                  width: '100%', borderRadius: 12, border: 'none',
                  padding: '13px 15px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', background: 'var(--blue)', color: '#fff',
                }}
              >
                첫 번째 프리즘 작성하러 가기 →
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
          {step < 5 ? (
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
          ) : step === 5 ? (
            <button
              type="button"
              onClick={async () => {
                const success = await saveProfile()
                if (success) moveStep(6)
              }}
              disabled={submitting}
              style={{
                ...buttonStyle,
                background: 'var(--blue)',
                color: '#fff',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? '저장 중...' : '다음'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}