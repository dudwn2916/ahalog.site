'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { savePrism } from '@/lib/supabase/prisms'
import { useState } from 'react'

// ── 더미 질문 (Supabase 연동 전) ─────────────────────────────────
const PROMPT = {
  category: '직업관 탐색',
  main: '내가 은행원이 되고 싶은 진짜 이유는 무엇인가요?',
  sub: '단순히 안정만이 아니라, 이 일을 통해 무엇을 실현하고 싶은지 떠올려 보세요.',
}

/** 자소서 2개 + 면접 2개 — 태그 + 질문 본문 */
const ACCORDION_ITEMS = [
  { tag: '자소서', label: '지원 동기', text: '금융 디지털 전환 과정에서 고객 접점 역할을 구체적으로 수행하고 싶다는 확신이 들었던 경험이 있나요?' },
  { tag: '자소서', label: '입행 후 계획', text: '입행 후 첫 1년·3년 각각 어떤 역량을 쌓고 어떻게 검증하고 싶은지 연결해서 써볼 수 있어요.' },
  { tag: '면접', label: '역량 검증', text: '변화하는 금리·규제 환경 속에서 고객 신뢰를 어떻게 만들어 나가겠습니까?' },
  { tag: '면접', label: '가치관', text: '"안정적인 직업"을 넘어 이 직업에서 실현하고 싶은 개인적 가치는 무엇인가요?' },
] as const

interface Props {
  onClose: () => void
}

const MAX_CHARS = 500

export default function SelfPrism({ onClose }: Props) {
  // ── 상태 선언 ──────────────────────────────────────────────
  const [text, setText] = useState('')
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // contents 테이블에서 불러온 질문 데이터 (실패 시 PROMPT 더미 유지)
  const [prompt, setPrompt] = useState(PROMPT)

  // ── 라우터 / Supabase / URL 파라미터 ──────────────────────
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const contentId = searchParams.get('contentId')

  // ── contentId로 질문 불러오기 ──────────────────────────────
  useEffect(() => {
    if (!contentId) return

    async function loadContent() {
      const { data, error } = await supabase
        .from('contents')
        .select('title, body, keywords')
        .eq('id', contentId)
        .single()

      if (error || !data) return

      setPrompt({
        category: data.keywords?.[0] ?? PROMPT.category,
        main: data.title ?? PROMPT.main,
        sub: data.body ?? PROMPT.sub,
      })
    }
    loadContent()
  }, [contentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const charCount = text.length
  const canSave = charCount >= 1

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await savePrism({
        type: 'self',
        body: text,
        job_tags: [],
        company_tags: [],
        industry_tags: [],
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
      <div style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={onClose} aria-label="뒤로">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="#0a0a0a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span style={styles.headerTitle}>자기이해 프리즘</span>
        <div style={{ width: 28 }} />
      </div>

      <div style={styles.content}>
        {/* 카테고리 배지 (앰버) */}
        <div style={styles.categoryBadge}>{prompt.category}</div>

        {/* 메인 질문 17px */}
        <h1 style={styles.mainQuestion}>{prompt.main}</h1>

        {/* 보조 질문 13px 회색 */}
        <p style={styles.subQuestion}>{prompt.sub}</p>

        {/* 자유 작성란 + 글자 수 */}
        <label htmlFor="self-prism-body" style={styles.writelabel}>
          나의 생각
        </label>
        <div style={styles.textareaWrap}>
          <textarea
            id="self-prism-body"
            style={styles.textarea}
            rows={8}
            maxLength={MAX_CHARS}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="편하게, 솔직하게 적어 보세요. 짧아도 괜찮아요."
          />
          <span style={styles.charCount}>
            {charCount} / {MAX_CHARS}
          </span>
        </div>

        {/* 하단 아코디언 */}
        <div style={styles.accordionWrap}>
          <button
            type="button"
            style={styles.accordionHead}
            onClick={() => setAccordionOpen(o => !o)}
            aria-expanded={accordionOpen}
          >
            <span style={styles.accordionTitle}>자소서·면접에서 이렇게 연결해요</span>
            <span
              style={{
                ...styles.accordionChev,
                transform: accordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
              aria-hidden
            >
              ▼
            </span>
          </button>

          {accordionOpen && (
            <div style={styles.accordionBody}>
              {ACCORDION_ITEMS.map(item => (
                <div key={`${item.tag}-${item.label}`} style={styles.connectionCard}>
                  <div style={styles.connectionTags}>
                    <span
                      style={
                        item.tag === '자소서'
                          ? { ...styles.itemTag, ...styles.tagJasoseo }
                          : { ...styles.itemTag, ...styles.tagInterview }
                      }
                    >
                      {item.tag}
                    </span>
                    <span style={styles.itemLabel}>{item.label}</span>
                  </div>
                  <p style={styles.itemText}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.footer}>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    background: '#f7f7f8',
    minHeight: '100vh',
    maxWidth: 680,
    margin: '0 auto',
    WebkitFontSmoothing: 'antialiased',
    display: 'flex',
    flexDirection: 'column',
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
    flexShrink: 0,
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
  content: {
    flex: 1,
    padding: '20px 20px 8px',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#0052cc',
    background: '#e0eaff',
    borderRadius: 20,
    padding: '5px 12px',
    marginBottom: 14,
    letterSpacing: '0.02em',
  },
  mainQuestion: {
    fontSize: 17,
    fontWeight: 600,
    color: '#0a0a0a',
    lineHeight: 1.45,
    margin: '0 0 10px',
  },
  subQuestion: {
    fontSize: 13,
    color: '#888',
    lineHeight: 1.6,
    margin: '0 0 22px',
  },
  writelabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#3b3b41',
    marginBottom: 8,
  },
  textareaWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  textarea: {
    width: '100%',
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    fontSize: 14,
    lineHeight: 1.7,
    padding: '14px 14px 34px',
    border: '1px solid #e4e4e4',
    borderRadius: 12,
    color: '#0a0a0a',
    resize: 'none' as const,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  },
  charCount: {
    position: 'absolute',
    bottom: 11,
    right: 14,
    fontSize: 11,
    color: '#888',
  },
  accordionWrap: {
    background: '#fff',
    border: '1px solid #e4e4e4',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  accordionHead: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '15px 16px',
    background: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0a0a0a',
  },
  accordionChev: {
    fontSize: 10,
    color: '#888',
    transition: 'transform 0.2s ease',
    flexShrink: 0,
  },
  accordionBody: {
    borderTop: '1px solid #eee',
    padding: '14px 16px 18px',
    background: '#fafafa',
  },
  connectionCard: {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e8e8e8',
    padding: '12px 14px',
    marginBottom: 10,
  },
  connectionTags: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
    marginBottom: 8,
  },
  itemTag: {
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.04em',
  },
  tagJasoseo: {
    background: '#EEEDFE',
    color: '#534AB7',
  },
  tagInterview: {
    background: '#ffe0e6',
    color: '#c0003c',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#706f78',
  },
  itemText: {
    fontSize: 13,
    color: '#3b3b41',
    lineHeight: 1.55,
    margin: 0,
  },
  footer: {
    padding: '16px 20px 28px',
    background: '#f7f7f8',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: 8,
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