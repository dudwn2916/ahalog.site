'use client'

import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { savePrism } from '@/lib/supabase/prisms'
import { useState, useRef, useCallback } from 'react'

// ── 더미 데이터 (Supabase 연동 전) ──────────────────────────────
const USER = {
  jobs:      ['PB', '여신', '리스크', 'IT', '디지털'],
  companies: ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협'],
  industries:['은행', '핀테크', '보험', '증권'],
  defaultJob:      'PB',
  defaultCompany:  'KB국민은행',
  defaultIndustry: '은행',
}


const CARDS = [
  { id: 1, tag: '금리', title: '머니무브의 시작', body: '기준금리 인상이 본격화되며 은행 수신 상품으로 자금이 집중되고 있다. 고객들은 더 높은 금리를 찾아 은행을 옮기고 있다.' },
  { id: 2, tag: '고객행동', title: '고객이 움직이고 있다', body: '금리 민감도가 높아진 고객은 0.1%p 차이에도 은행을 이동한다. 이탈 방어와 신규 유치가 동시에 필요한 시점이다.' },
  { id: 3, tag: '상품전략', title: '특판 예금의 귀환', body: '각 은행은 앞다퉈 특판 정기예금을 출시하고 있다. 금리 경쟁력 확보가 영업 현장의 핵심 과제로 떠올랐다.' },
  { id: 4, tag: '자산관리', title: 'PB의 역할 변화', body: '단순 금리 안내를 넘어 포트폴리오 재조정 상담으로 무게중심이 이동하고 있다. 자산배분 역량이 더 중요해졌다.' },
  { id: 5, tag: '리스크', title: '대출 부실화 우려', body: '금리 인상은 가계 대출 부담을 키운다. 변동금리 대출 비중이 높은 고객군의 리스크 모니터링이 필수다.' },
  { id: 6, tag: '디지털', title: '앱 비교가 쉬워졌다', body: '핀테크 앱을 통한 금리 비교가 일반화되며 고객의 협상력이 높아졌다. 비대면 채널 대응력이 요구된다.' },
  { id: 7, tag: '기업금융', title: '기업고객의 선택', body: '기업도 여유자금 운용 전략을 바꾸고 있다. 단기 CP·MMF 대신 정기예금으로 이동하는 흐름이 포착된다.' },
  { id: 8, tag: '글로벌', title: 'Fed의 시그널', body: '미 연준의 금리 경로가 국내 은행 전략에 직접 영향을 미친다. 글로벌 매크로 이해가 영업 현장에서도 요구된다.' },
  { id: 9, tag: '규제', title: '예대율 규제 압박', body: '수신 증가에도 대출 규제로 여신이 제한되며 운용 수익성 관리가 화두다. 비이자수익 확대 전략이 부각된다.' },
  { id: 10, tag: '인사이트', title: '변화 속의 기회', body: '머니무브가 활발할수록 고객 접점이 늘어난다. 이 시점을 관계 심화의 기회로 삼는 것이 핵심 전략이다.' },
]

const KEYWORDS = ['머니무브', '금리 인상', '수신 전략', '고객 이탈', '자산배분']


const HINTS = [
  'PB 직무라면, 고객 포트폴리오를 재조정할 접점이 생긴 셈이에요. 어떤 대화로 연결하시겠어요?',
  '금리 민감 고객을 리텐션하는 구체적인 방법이 있다면 적어보세요.',
  '이 변화가 자소서의 "지원 동기"나 "직무 역량"과 어떻게 연결되나요?',
]

interface Props {
  onClose: () => void
}

export default function CardPrism({ onClose }: Props) {
  const [current, setCurrent] = useState(0)
  const [reached, setReached] = useState(0) // 최대 도달 인덱스
  const [hintOpen, setHintOpen] = useState(false)
  const [hintIdx, setHintIdx] = useState(0)
  const [text, setText] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<string[]>([USER.defaultJob])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([USER.defaultCompany])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([USER.defaultIndustry])
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentId = searchParams.get('contentId')
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [userJob, setUserJob] = useState(USER.defaultJob)
  const [userCompany, setUserCompany] = useState(USER.defaultCompany)
  const [userIndustry, setUserIndustry] = useState(USER.defaultIndustry)
  const [cards, setCards] = useState(CARDS)
  const [contentKeywords, setContentKeywords] = useState(KEYWORDS)

  // 온보딩에서 저장한 유저 정보 불러오기
useEffect(() => {
  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .select('job, company, industry')
      .eq('id', user.id)
      .single()

    if (error || !data) return

    // 불러온 값으로 기본값 교체
    if (data.job)      setUserJob(data.job)
    if (data.company)  setUserCompany(data.company)
    if (data.industry) setUserIndustry(data.industry)

    // 관점 태그 기본값도 함께 업데이트
    if (data.job)      setSelectedJobs([data.job])
    if (data.company)  setSelectedCompanies([data.company])
    if (data.industry) setSelectedIndustries([data.industry])
  }
  loadUser()
}, []) // eslint-disable-line react-hooks/exhaustive-deps

// contentId 있으면 contents 테이블에서 카드뉴스 불러오기
useEffect(() => {
  if (!contentId) return

  async function loadContent() {
    const { data, error } = await supabase
      .from('contents')
      .select('title, body, keywords, card_images')
      .eq('id', contentId)
      .single()

    if (error || !data) return

    // card_images 배열을 CARDS 형식으로 변환
    // 이미지 없으면 더미 CARDS 유지
    if (data.card_images && data.card_images.length > 0) {
      const mapped = data.card_images.map((img: string, i: number) => ({
        id: i + 1,
        tag: data.keywords?.[i] ?? '',
        title: data.title,
        body: data.body ?? '',
        image: img,
      }))
      setCards(mapped)
    }

    // 키워드 교체
    if (data.keywords?.length > 0) setContentKeywords(data.keywords)
  }
  loadContent()
}, [contentId]) // eslint-disable-line react-hooks/exhaustive-deps

  // 터치/마우스 스와이프
  const touchStartX = useRef<number | null>(null)

  const completed = true
  const charCount = text.length
  const MAX = 150

  const goTo = useCallback((idx: number) => {
    const next = Math.max(0, Math.min(idx, CARDS.length - 1))
    setCurrent(next)
    setReached(r => Math.max(r, next))
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1))
    touchStartX.current = null
  }
  const onMouseDown = (e: React.MouseEvent) => { touchStartX.current = e.clientX }
  const onMouseUp = (e: React.MouseEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.clientX
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1))
    touchStartX.current = null
  }

  const toggleChip = (val: string, list: string[], setList: (v: string[]) => void) => {
    if (val === '해당 없음') { setList(['해당 없음']); return }
    const next = list.includes('해당 없음')
      ? [val]
      : list.includes(val)
        ? list.filter(v => v !== val)
        : [...list, val]
    setList(next.length === 0 ? ['해당 없음'] : next)
  }

  const canSave = charCount >= 1

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await savePrism({
        type: 'card',
        body: text,
        job_tags: selectedJobs.filter(v => v !== '해당 없음'),
        company_tags: selectedCompanies.filter(v => v !== '해당 없음'),
        industry_tags: selectedIndustries.filter(v => v !== '해당 없음'),
      })
      router.push('/archive')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={styles.headerTitle}>인사이트 워밍업</span>
        <div style={{ width: 28 }} />
      </div>

      {/* 카드 슬라이더 */}
      <div
        style={styles.cardWrap}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <div style={styles.card}>
        <p style={styles.cardNum}>{String(current + 1).padStart(2, '0')} / {cards.length}</p>
        <h3 style={styles.cardTitle}>{cards[current].title}</h3>
        <p style={styles.cardBody}>{cards[current].body}</p>
        </div>

        {/* 화살표 */}
        {current > 0 && (
          <button type="button" style={{ ...styles.arrow, left: 0 }} onClick={() => goTo(current - 1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 13.5L6.5 9L11 4.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {current < cards.length - 1 && (
          <button type="button" style={{ ...styles.arrow, right: 0 }} onClick={() => goTo(current + 1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4.5L11.5 9L7 13.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* 인디케이터 도트 */}
      <div style={styles.dots}>
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            style={{
              ...styles.dot,
              background: i === current ? '#0066ff' : i <= reached ? '#c7d8ff' : '#e4e4e4',
              width: i === current ? 16 : 6,
            }}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* 작성 영역 */}
      <div style={{ ...styles.writeArea, opacity: completed ? 1 : 0.4, pointerEvents: completed ? 'auto' : 'none' }}>

        {/* 키워드 칩 */}
        <div style={styles.fieldLabel}>키워드</div>
        <div style={styles.chipsRow}>
        {contentKeywords.map(kw => (
            <span key={kw} style={styles.keywordChip}>{kw}</span>
          ))}
        </div>

        {/* 프리즘 작성란 */}
        <div style={styles.fieldLabel}>
          나의 프리즘
          <span style={styles.fieldSub}> — 내 직무의 시각으로 재해석하세요</span>
        </div>
        <div style={styles.textareaWrap}>
          <textarea
            style={styles.textarea}
            rows={5}
            maxLength={MAX}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder='"고객이 이동하는 시점이 새로운 관계의 시작이다..."'
          />
          <span style={styles.charCount}>{charCount} / {MAX}</span>
        </div>

        {/* 힌트 */}
        <button type="button" style={styles.hintToggle} onClick={() => { setHintOpen(o => !o); setHintIdx(i => (i + 1) % HINTS.length) }}>
          <span style={styles.hintBtn}>HINT</span>
          <span style={styles.hintLabel}>{hintOpen ? '힌트 닫기' : '눌러서 힌트 보기'}</span>
        </button>
        {hintOpen && (
          <div style={styles.hintBox}>
            {HINTS[hintIdx]}
          </div>
        )}

        {/* 관점 태그 — 직무 */}
        <div style={styles.fieldLabel}>
          직무 관점
          <span style={styles.fieldSub}> — 어떤 직무 시각으로 썼나요? (복수 선택 가능)</span>
        </div>
        <div style={styles.chipsRow}>
          {[...USER.jobs, '해당 없음'].map(v => (
            <button
              key={v}
              type="button"
              style={{ ...styles.chip, ...(selectedJobs.includes(v) ? styles.chipActive : {}) }}
              onClick={() => toggleChip(v, selectedJobs, setSelectedJobs)}
            >
              {v}
            </button>
          ))}
        </div>

        {/* 관점 태그 — 기업 */}
        <div style={{ ...styles.fieldLabel, marginTop: 16 }}>
          기업 관점
          <span style={styles.fieldSub}> — 지망 기업을 선택하세요 (복수 선택 가능)</span>
        </div>
        <div style={styles.chipsRow}>
          {[...USER.companies, '해당 없음'].map(v => (
            <button
              key={v}
              type="button"
              style={{ ...styles.chip, ...(selectedCompanies.includes(v) ? styles.chipActive : {}) }}
              onClick={() => toggleChip(v, selectedCompanies, setSelectedCompanies)}
            >
              {v}
            </button>
          ))}
        </div>

        {/* 관점 태그 — 산업 (베타: 숨김) */}
{false && (
  <div>
    <div style={{ ...styles.fieldLabel, marginTop: 16 }}>
      산업 관점
      <span style={styles.fieldSub}> — 어떤 산업 시각으로 썼나요? (복수 선택 가능)</span>
    </div>
    <div style={styles.chipsRow}>
      {[...USER.industries, '해당 없음'].map(v => (
        <button
          key={v}
          type="button"
          style={{ ...styles.chip, ...(selectedIndustries.includes(v) ? styles.chipActive : {}) }}
          onClick={() => toggleChip(v, selectedIndustries, setSelectedIndustries)}
        >
          {v}
        </button>
      ))}
    </div>
  </div>
)}

        {/* 버튼 */}
        <div style={styles.actions}>
        {saveError && (
  <p style={{ fontSize: 12, color: '#e53e3e', margin: '0 0 8px' }}>{saveError}</p>
)}
<button
  type="button"
  style={{ ...styles.btnSave, ...(canSave && !saving ? styles.btnSaveActive : {}) }}
  disabled={!canSave || saving}
  onClick={handleSave}
>
  {saving ? '저장 중...' : '저장하기'}
</button>
        </div>
      </div>
    </div>
  )
}

// ── 스타일 ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    background: '#f7f7f8',
    minHeight: '100vh',
    maxWidth: 680,
    margin: '0 auto',
    paddingBottom: 40,
    WebkitFontSmoothing: 'antialiased',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #e4e4e4',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0a0a0a',
  },
  progressWrap: {
    padding: '14px 20px 0',
  },
  progressBar: {
    height: 4,
    background: '#e4e4e4',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#0066ff',
    borderRadius: 99,
    transition: 'width 0.3s ease',
  },
  progressMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 500,
  },
  badgeDefault: {
    fontSize: 11,
    fontWeight: 700,
    color: '#888',
    background: '#e4e4e4',
    borderRadius: 99,
    padding: '3px 10px',
  },
  badgeActive: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    background: '#0066ff',
    borderRadius: 99,
    padding: '3px 10px',
  },
  cardWrap: {
    position: 'relative',
    margin: '16px 20px 0',
    userSelect: 'none',
    cursor: 'grab',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '24px 24px 28px',
    minHeight: 200,
    border: '1px solid #e4e4e4',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    color: '#b05000',
    background: '#fff4e6',
    borderRadius: 6,
    padding: '3px 10px',
    marginBottom: 10,
    letterSpacing: '0.04em',
  },
  cardNum: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
    fontWeight: 500,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0a0a0a',
    marginBottom: 12,
    lineHeight: 1.3,
  },
  cardBody: {
    fontSize: 14,
    color: '#3b3b41',
    lineHeight: 1.7,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#fff',
    border: '1px solid #e4e4e4',
    borderRadius: 99,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
  },
  dot: {
    height: 6,
    borderRadius: 99,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s ease',
  },
  writeArea: {
    margin: '20px 20px 0',
    transition: 'opacity 0.3s ease',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#3b3b41',
    display: 'block',
    marginBottom: 8,
    marginTop: 18,
  },
  fieldSub: {
    fontWeight: 400,
    color: '#888',
  },
  chipsRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  keywordChip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 13px',
    borderRadius: 99,
    background: '#fff4e6',
    color: '#b05000',
    border: '1px solid #ffd9a8',
  },
  chip: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 13px',
    borderRadius: 99,
    border: '1px solid #e4e4e4',
    background: '#fff',
    color: '#3b3b41',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipActive: {
    background: '#0a0a0a',
    color: '#fff',
    borderColor: '#0a0a0a',
  },
  textareaWrap: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 14,
    lineHeight: 1.7,
    padding: '13px 13px 28px',
    border: '1px solid #e4e4e4',
    borderRadius: 12,
    color: '#0a0a0a',
    resize: 'none' as const,
    outline: 'none',
    background: '#fff',
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 13,
    fontSize: 11,
    color: '#888',
  },
  hintToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    marginTop: 10,
    marginBottom: 8,
    background: 'none',
    border: 'none',
    padding: 0,
  },
  hintBtn: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: '#b05000',
    background: '#fff4e6',
    borderRadius: 6,
    padding: '4px 10px',
  },
  hintLabel: {
    fontSize: 12,
    color: '#888',
  },
  hintBox: {
    padding: '13px 16px',
    background: '#fff8f0',
    borderRadius: 12,
    border: '1px solid #ffd9a8',
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 1.6,
    color: '#3b3b41',
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 24,
  },
  btnCancel: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    padding: '12px 18px',
    background: 'transparent',
    color: '#3b3b41',
    border: '1px solid #e4e4e4',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSave: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    flex: 1,
    padding: '12px 28px',
    background: '#e4e4e4',
    color: '#888',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'not-allowed',
    transition: 'all 0.15s',
  },
  btnSaveActive: {
    background: '#0066ff',
    color: '#fff',
    cursor: 'pointer',
  },
}
