'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { savePrism } from '@/lib/supabase/prisms'
import { useState } from 'react'

// ── 더미 데이터 (Supabase 연동 전) — CardPrism과 동일 프로필 ─────
const USER = {
  jobs: ['PB', '여신', '리스크', 'IT', '디지털'],
  companies: ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협'],
  industries: ['은행', '핀테크', '보험', '증권'],
  defaultJob: 'PB',
  defaultCompany: 'KB국민은행',
  defaultIndustry: '은행',
}

const CURATION_ARTICLE = {
  source: '한국경제',
  date: '2026.05.06',
  headline: '토스뱅크 중금리 대출 잔액 5조 돌파 — 시중은행 틈새 공략 가속',
  body: '인터넷은행 토스뱅크가 올해 1분기 중금리 대출 잔액 5조원을 넘어서며 시중은행이 상대적으로 취약한 중간 신용등급 구간을 빠르게 잠식하고 있다. 금융당국은 포용금융 확대 측면에서 긍정 평가하면서도 형평성 문제를 언급했다.',
}

const KEYWORDS = ['중금리 대출', '토스뱅크', '포용금융', '디지털은행', '형평성']

const OPINION_STRUCTURE = ['이 사건의 핵심은 무엇인가', '은행 산업에 어떤 영향을 미치나', '앞으로 어떤 방향이 필요한가']

const HINTS = [
  '규제·경쟁 구도를 직무 시각으로 짚어보면 어떤 신호인가요?',
  '영업 현장에서 고객에게 이 이슈를 어떻게 설명하면 좋을까요?',
  '자소서나 면접에서 이 뉴스를 어떤 스토리로 연결할 수 있나요?',
]

interface Props {
  onClose: () => void
  onBack: () => void
  contentId?: string
  routineTypes: string[]
  completedTypes: string[]
}

type SourceTab = 'curation' | 'url'

export default function ArticlePrism({ onClose, onBack, contentId, routineTypes, completedTypes }: Props) {
  const [sourceTab, setSourceTab] = useState<SourceTab>('curation')
  const [url, setUrl] = useState('')
  const [pasteBody, setPasteBody] = useState('')
  const [hintOpen, setHintOpen] = useState(false)
  const [hintIdx, setHintIdx] = useState(0)
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [selectedJobs, setSelectedJobs] = useState<string[]>([USER.defaultJob])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([USER.defaultCompany])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([USER.defaultIndustry])
const [customJob, setCustomJob] = useState('')
const [customCompany, setCustomCompany] = useState('')
const [showCustomJob, setShowCustomJob] = useState(false)
const [showCustomCompany, setShowCustomCompany] = useState(false)
  const router = useRouter()
  const supabase = createClient()
const [saving, setSaving] = useState(false)
const [saveError, setSaveError] = useState('')
const [, setUserJob] = useState(USER.defaultJob)
const [, setUserCompany] = useState(USER.defaultCompany)
const [, setUserIndustry] = useState(USER.defaultIndustry)
const [article, setArticle] = useState(CURATION_ARTICLE)
const [articleKeywords, setArticleKeywords] = useState(KEYWORDS)
const [savedId, setSavedId] = useState<string | null>(null)
const FIXED_JOBS = ['PB', '여신', '리스크', 'IT', '디지털']
const FIXED_COMPANIES = ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']

useEffect(() => {
  console.log('[ArticlePrism] received contentId:', contentId)
}, [contentId])

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
  
      if (data.job) {
        if (FIXED_JOBS.includes(data.job)) {
          setSelectedJobs([data.job])
        } else {
          setCustomJob(data.job)
          setShowCustomJob(true)
          setSelectedJobs([data.job])
        }
      }
      if (data.company) {
        if (FIXED_COMPANIES.includes(data.company)) {
          setSelectedCompanies([data.company])
        } else {
          setCustomCompany(data.company)
          setShowCustomCompany(true)
          setSelectedCompanies([data.company])
        }
      }
      if (data.industry) setSelectedIndustries([data.industry])
    }
    loadUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

// contentId 있으면 contents 테이블에서 기사 불러오기
useEffect(() => {
    if (!contentId) return
  
    async function loadContent() {
      const { data, error } = await supabase
        .from('contents')
        .select('title, body, keywords, source, published_at')
        .eq('id', contentId)
        .single()
  
      if (error || !data) return
  
      // 불러온 기사로 교체
      setArticle({
        source: data.source ?? CURATION_ARTICLE.source,
        date: data.published_at ?? CURATION_ARTICLE.date,
        headline: data.title ?? CURATION_ARTICLE.headline,
        body: data.body ?? CURATION_ARTICLE.body,
      })
  
      if (data.keywords?.length > 0) setArticleKeywords(data.keywords)
    }
    loadContent()
  }, [contentId]) // eslint-disable-line react-hooks/exhaustive-deps


  /** 큐레이션은 기사 고정 제공, URL 탭은 URL 또는 붙여넣기 본문으로 준비 완료 처리 */
  const articleReady =
    sourceTab === 'curation' || url.trim().length > 0 || pasteBody.trim().length > 0

  const charCount = text.length

  const toggleChip = (val: string, list: string[], setList: (v: string[]) => void) => {
    if (val === '해당 없음') {
      setList(['해당 없음'])
      return
    }
    const next = list.includes('해당 없음')
      ? [val]
      : list.includes(val)
        ? list.filter(v => v !== val)
        : [...list, val]
    setList(next.length === 0 ? ['해당 없음'] : next)
  }

  const canSave = articleReady && charCount >= 10

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    console.log('[ArticlePrism] contentId at save:', contentId)
    try {
      const id = await savePrism({
        type: 'opinion',
        title: title.trim() || undefined,
        body: text,
        job_tags: selectedJobs.filter(v => v !== '해당 없음'),
        company_tags: selectedCompanies.filter(v => v !== '해당 없음'),
        industry_tags: selectedIndustries.filter(v => v !== '해당 없음'),
        article_url: sourceTab === 'url' ? url : undefined,
        article_body: sourceTab === 'url' ? pasteBody : undefined,
        content_id: contentId,
      })
      setSavedId(id)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function getNextContentId(type: string): Promise<string | undefined> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return undefined

    const today = new Date().toISOString().slice(0, 10)

    if (type === 'card') {
      const { data: userData } = await supabase.from('users').select('card_progress').eq('id', user.id).single()
      const { data: contents } = await supabase.from('contents').select('id').eq('type', 'card').order('published_at', { ascending: true })
      if (!userData || !contents || contents.length === 0) return undefined
      return contents[(userData.card_progress ?? 0) % contents.length]?.id
    }
    if (type === 'self') {
      const { data: userData } = await supabase.from('users').select('self_progress').eq('id', user.id).single()
      const { data: contents } = await supabase.from('contents').select('id').eq('type', 'question').order('published_at', { ascending: true })
      if (!userData || !contents || contents.length === 0) return undefined
      return contents[(userData.self_progress ?? 0) % contents.length]?.id
    }
    if (type === 'opinion') {
      const { data: contents } = await supabase.from('contents').select('id').eq('type', 'article').lte('published_at', today).order('published_at', { ascending: false })
      return contents?.[0]?.id
    }
    return undefined
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={styles.headerTitle}>세상 한 조각</span>
        <div style={{ width: 28 }} />
      </div>

      {/* 소스 탭 + 기사 영역 (카드 슬라이더 대체) */}
      <div style={styles.articleSection}>
        <div style={styles.tabRow}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(sourceTab === 'curation' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setSourceTab('curation')}
          >
            큐레이션 기사
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(sourceTab === 'url' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setSourceTab('url')}
          >
            URL / 직접 입력
          </button>
          {savedId && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }}>
    <div style={{
      background: '#fff', borderRadius: 20, padding: '28px 24px',
      width: '100%', maxWidth: 320, textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 6 }}>저장 완료!</div>
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
        어떻게 할까요?
      </p>
      {(() => {
        const thisType = 'opinion'
        const allCompleted = [...completedTypes, thisType]
        const ORDER = ['card', 'opinion', 'self']
        const remaining = routineTypes
          .filter(t => !allCompleted.includes(t))
          .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
        const typeLabels: Record<string, string> = {
          card: '인사이트 워밍업',
          opinion: '세상 한 조각',
          self: '나를 만드는 질문',
        }
        return (
          <>
            {routineTypes.length > 0 && remaining.length === 0 && (
              <p style={{ fontSize: 13, color: '#1a7a48', fontWeight: 700, marginBottom: 12 }}>
                🎉 오늘의 루틴을 모두 완료했어요!
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {routineTypes.length > 0 && remaining.map((nextType) => (
                <button
                  key={nextType}
                  type="button"
                  onClick={async () => {
                    const nextContentId = await getNextContentId(nextType)
                    onClose()
                    const url = nextContentId
                      ? `/prism/write?type=${nextType}&contentId=${nextContentId}&routineTypes=${routineTypes.join(',')}&completedTypes=${allCompleted.join(',')}`
                      : `/prism/write?type=${nextType}&routineTypes=${routineTypes.join(',')}&completedTypes=${allCompleted.join(',')}`
                    router.push(url)
                  }}
                  style={{
                    padding: '13px', borderRadius: 12, border: 'none',
                    background: '#2563EB', color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  다음 루틴 : {typeLabels[nextType]}→
                </button>
              ))}
              <button
                type="button"
                onClick={() => router.push(`/archive/${savedId}`)}
                style={{
                  padding: '13px', borderRadius: 12, border: 'none',
                  background: '#dbeafe', color: '#1e40af',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                내 프리즘 보러 가기
              </button>
              <button
                type="button"
                onClick={() => { onClose(); router.push('/library') }}
                style={{
                  padding: '13px', borderRadius: 12,
                  border: '1px solid #e4e4e4', background: '#fff',
                  color: '#3b3b41', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                다른 콘텐츠 탐색하기
              </button>
            </div>
          </>
        )
      })()}
    </div>
  </div>
)}
        </div>

        {sourceTab === 'curation' && (
          <div style={styles.card}>
            <div style={styles.metaRow}>
            <span style={styles.sourcePill}>{article.source}</span>
            <span style={styles.dateMuted}>{article.date}</span>
            </div>
            <h3 style={styles.articleHeadline}>
            {`"`}{article.headline}{`"`}
            </h3>
            <p style={styles.articleBody}>{article.body}</p>
            <div style={styles.structureBox}>
              <div style={styles.structureLabel}>
                권장 오피니언 구조
                <span style={styles.structureBadge}>참고용</span>
              </div>
              <div style={styles.structureList}>
                {OPINION_STRUCTURE.map((line, i) => (
                  <div key={line} style={styles.structureItem}>
                    <span style={styles.structureNum}>{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {sourceTab === 'url' && (
          <div style={styles.card}>
            <div style={styles.urlLabelRow}>
              <span style={styles.urlFieldLabel}>뉴스 URL 입력</span>
              <span style={styles.plusIcon} aria-hidden>⊕</span>
            </div>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://n.news.naver.com/..."
              style={styles.urlInput}
            />
            <p style={styles.helpText}>URL을 입력하면 기사 본문이 자동으로 불러와집니다.</p>
            <p style={styles.helpTextMuted}>
              힌트 카드는 큐레이션 기사에서만 제공돼요. URL 기사는 오피니언 구조를 참고해 자유롭게 작성해주세요.
            </p>
            <div style={styles.pasteLabel}>기사 본문 직접 붙여넣기</div>
            <textarea
              style={styles.pasteTextarea}
              rows={6}
              value={pasteBody}
              onChange={e => setPasteBody(e.target.value)}
              placeholder="기사 본문을 여기에 붙여넣을 수 있어요."
            />
          </div>
        )}
      </div>

      <div style={styles.writeArea}>
        <div style={styles.fieldLabel}>키워드</div>
        <div style={styles.chipsRow}>
        {articleKeywords.map(kw => (
            <span key={kw} style={styles.keywordChip}>
              {kw}
            </span>
          ))}
        </div>

        <div style={styles.fieldLabel}>제목</div>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="한 줄로 요약해 주세요"
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 12,
            border: '1px solid #e4e4e4', fontSize: 14, color: '#0a0a0a',
            outline: 'none', marginBottom: 4, boxSizing: 'border-box',
            fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
          }}
        />

        <div style={styles.fieldLabel}>
          나의 프리즘
          <span style={styles.fieldSub}> — 내 직무의 시각으로 재해석하세요</span>
        </div>
        <div style={styles.textareaWrap}>
          <textarea
            style={styles.textarea}
            rows={5}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder='"고객이 이동하는 시점이 새로운 관계의 시작이다..."'
          />
          <span style={styles.charCount}>
            {charCount}자
          </span>
        </div>

        {sourceTab === 'curation' ? (
          <>
            <button
              type="button"
              style={styles.hintToggle}
              onClick={() => {
                setHintOpen(o => !o)
                setHintIdx(i => (i + 1) % HINTS.length)
              }}
            >
              <span style={styles.hintBtn}>HINT</span>
              <span style={styles.hintLabel}>{hintOpen ? '힌트 닫기' : '눌러서 힌트 보기'}</span>
            </button>
            {hintOpen && <div style={styles.hintBox}>{HINTS[hintIdx]}</div>}
          </>
        ) : (
          <div style={styles.urlHintNotice}>
            URL/직접 입력 모드에서는 HINT 카드 대신 위 오피니언 구조를 참고해 작성해 주세요.
          </div>
        )}

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
          <button
            type="button"
            style={{ ...styles.chip, ...(showCustomJob ? styles.chipActive : {}) }}
            onClick={() => {
              if (showCustomJob) {
                setShowCustomJob(false)
                setSelectedJobs(prev => prev.filter(v => v !== customJob))
                setCustomJob('')
              } else {
                setShowCustomJob(true)
              }
            }}
          >
            기타(직접 입력)
          </button>
        </div>
        {showCustomJob && (
          <input
            type="text"
            value={customJob}
            onChange={e => {
              const val = e.target.value
              setCustomJob(val)
              setSelectedJobs(prev => {
                const withoutOldCustom = prev.filter(v => FIXED_JOBS.includes(v) || v === '해당 없음')
                return val.trim() ? [...withoutOldCustom, val] : withoutOldCustom
              })
            }}
            placeholder="직접 입력"
            style={{
              marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 10,
              border: '1px solid #e4e4e4', fontSize: 13, outline: 'none',
              fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
              boxSizing: 'border-box',
            }}
          />
        )}

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
          <button
            type="button"
            style={{ ...styles.chip, ...(showCustomCompany ? styles.chipActive : {}) }}
            onClick={() => {
              if (showCustomCompany) {
                setShowCustomCompany(false)
                setSelectedCompanies(prev => prev.filter(v => v !== customCompany))
                setCustomCompany('')
              } else {
                setShowCustomCompany(true)
              }
            }}
          >
            기타(직접 입력)
          </button>
        </div>
        {showCustomCompany && (
          <input
            type="text"
            value={customCompany}
            onChange={e => {
              const val = e.target.value
              setCustomCompany(val)
              setSelectedCompanies(prev => {
                const withoutOldCustom = prev.filter(v => FIXED_COMPANIES.includes(v) || v === '해당 없음')
                return val.trim() ? [...withoutOldCustom, val] : withoutOldCustom
              })
            }}
            placeholder="직접 입력"
            style={{
              marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 10,
              border: '1px solid #e4e4e4', fontSize: 13, outline: 'none',
              fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
              boxSizing: 'border-box',
            }}
          />
        )}

        {/* 산업 관점 (베타: 숨김) */}
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
{charCount < 10 && charCount > 0 && (
  <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>
    최소 10자 이상 작성해 주세요 ({charCount}/10)
  </p>
)}
        </div>
      </div>
    </div>
  )
}

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
  articleSection: {
    margin: '16px 20px 0',
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    flex: 1,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e4e4e4',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    color: '#3b3b41',
    cursor: 'pointer',
  },
  tabBtnActive: {
    background: '#0a0a0a',
    color: '#fff',
    borderColor: '#0a0a0a',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px 20px 24px',
    border: '1px solid #e4e4e4',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sourcePill: {
    fontSize: 11,
    fontWeight: 600,
    color: '#3b3b41',
    background: '#f0f0f2',
    padding: '3px 10px',
    borderRadius: 6,
  },
  dateMuted: {
    fontSize: 11,
    color: '#888',
    fontWeight: 500,
  },
  articleHeadline: {
    fontSize: 16,
    fontWeight: 800,
    color: '#0a0a0a',
    lineHeight: 1.45,
    marginBottom: 12,
    marginTop: 0,
  },
  articleBody: {
    fontSize: 14,
    color: '#3b3b41',
    lineHeight: 1.7,
    margin: 0,
  },
  structureBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid #e4e4e4',
  },
  structureLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#3b3b41',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  structureBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0F6E56',
    background: '#E1F5EE',
    padding: '2px 8px',
    borderRadius: 10,
  },
  structureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  structureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: '#3b3b41',
    lineHeight: 1.5,
  },
  structureNum: {
    flexShrink: 0,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#e6f7ee',
    color: '#1a7a48',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  urlFieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0a0a0a',
  },
  plusIcon: {
    fontSize: 20,
    color: '#0a0a0a',  // ← 검은색
    lineHeight: 1,
  },
  urlInput: {
    width: '100%',
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 14,
    padding: '12px 14px',
    border: '1px solid #e4e4e4',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#3b3b41',
    lineHeight: 1.55,
    margin: '0 0 8px',
  },
  helpTextMuted: {
    fontSize: 12,
    color: '#888',
    lineHeight: 1.55,
    margin: '0 0 16px',
  },
  pasteLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#3b3b41',
    marginBottom: 8,
  },
  pasteTextarea: {
    width: '100%',
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 14,
    lineHeight: 1.65,
    padding: '12px 14px',
    border: '1px solid #e4e4e4',
    borderRadius: 12,
    resize: 'none' as const,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0a0a0a',
    background: '#fafafa',
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
    background: '#e6f7ee',
    color: '#1a7a48',
    border: '1px solid #b6e8cc',
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
    color: '#1a7a48',
    background: '#e6f7ee',
    borderRadius: 6,
    padding: '4px 10px',
  },
  hintLabel: {
    fontSize: 12,
    color: '#888',
  },
  hintBox: {
    padding: '13px 16px',
    background: '#f0faf4',
    borderRadius: 12,
    border: '1px solid #b6e8cc',
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 1.6,
    color: '#3b3b41',
  },
  urlHintNotice: {
    marginTop: 10,
    marginBottom: 8,
    padding: '12px 14px',
    background: '#f7f7f8',
    borderRadius: 12,
    border: '1px solid #e4e4e4',
    fontSize: 12,
    lineHeight: 1.55,
    color: '#706f78',
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
