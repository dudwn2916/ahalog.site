'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/ui/BottomNav'
import PrismModal from '@/components/ui/PrismModal'
import {
    Home, Archive, BookOpen, PenLine, User, TrendingUp, Bell,
    ChevronLeft, ExternalLink, Briefcase, Building2, Pencil, Trash2,
    Layers, Newspaper, Globe,
  } from 'lucide-react'

// ── 타입 ──────────────────────────────────────────────
interface PrismDetail {
  id: string
  type: 'card' | 'opinion' | 'self'
  title: string | null
  body: string
  job_tags: string[]
  company_tags: string[]
  industry_tags: string[]
  article_url: string | null
  article_body: string | null
  content_id: string | null
  created_at: string
}

interface ContentDetail {
    id: string
    type: string
    title: string
    body: string | null
    keywords: string[]
    source: string | null
    published_at: string | null
    card_images: string[] | null
  }

const JOBS      = ['PB', '여신', '리스크', 'IT', '디지털']
const COMPANIES = ['KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']
const INDUSTRIES = ['은행', '핀테크', '보험', '증권']

const ACCORDION_ITEMS = [
    { tag: '자소서', label: '지원 동기',    text: '금융 디지털 전환 과정에서 고객 접점 역할을 구체적으로 수행하고 싶다는 확신이 들었던 경험이 있나요?' },
    { tag: '자소서', label: '입행 후 계획', text: '입행 후 첫 1년·3년 각각 어떤 역량을 쌓고 어떻게 검증하고 싶은지 연결해서 써볼 수 있어요.' },
    { tag: '면접',   label: '역량 검증',   text: '변화하는 금리·규제 환경 속에서 고객 신뢰를 어떻게 만들어 나가겠습니까?' },
    { tag: '면접',   label: '가치관',      text: '"안정적인 직업"을 넘어 이 직업에서 실현하고 싶은 개인적 가치는 무엇인가요?' },
  ] as const
  
  function SelfAccordion() {
    const [open, setOpen] = useState(false)
    return (
      <div style={{
        background: '#fff', border: '1px solid #e4e4e4',
        borderRadius: 14, overflow: 'hidden', marginBottom: 16,
      }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12,
            padding: '15px 18px', background: '#fff', border: 'none',
            cursor: 'pointer', textAlign: 'left',
            fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>
            자소서·면접에서 이렇게 연결해요
          </span>
          <span style={{
            fontSize: 10, color: '#888',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease', flexShrink: 0,
          }}>▼</span>
        </button>
        {open && (
          <div style={{ borderTop: '1px solid #eee', padding: '14px 16px 18px', background: '#fafafa' }}>
            {ACCORDION_ITEMS.map(item => (
              <div key={`${item.tag}-${item.label}`} style={{
                background: '#fff', borderRadius: 10, border: '1px solid #e8e8e8',
                padding: '12px 14px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                    background: item.tag === '자소서' ? '#EEEDFE' : '#ffe0e6',
                    color: item.tag === '자소서' ? '#534AB7' : '#c0003c',
                  }}>{item.tag}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#706f78' }}>{item.label}</span>
                </div>
                <p style={{ fontSize: 13, color: '#3b3b41', lineHeight: 1.55, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const TYPE_META = {
  card:    { label: '카드뉴스',     color: '#b05000', bg: '#fff4e6', icon: Layers },
  opinion: { label: '기사 오피니언', color: '#1a7a48', bg: '#e6f7ee', icon: Newspaper },
  self:    { label: '자기이해',     color: '#0052cc', bg: '#e0eaff', icon: User },
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export default function ArchiveDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [prism, setPrism] = useState<PrismDetail | null>(null)
  const [content, setContent] = useState<ContentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrismModal, setShowPrismModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 수정 모드
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // 관점 태그 수정용
  const [editJobTags, setEditJobTags] = useState<string[]>([])
  const [editCompanyTags, setEditCompanyTags] = useState<string[]>([])
  const [editIndustryTags, setEditIndustryTags] = useState<string[]>([])

  // 콘텐츠 본문 펼치기
  const [contentExpanded, setContentExpanded] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: prismData, error } = await supabase
      .from('prisms')
      .select('id, type, title, body, job_tags, company_tags, industry_tags, article_url, article_body, content_id, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !prismData) { router.replace('/archive'); return }
    setPrism(prismData as PrismDetail)
    setEditBody(prismData.body ?? '')
    setEditTitle(prismData.title ?? '')
    setEditJobTags(prismData.job_tags ?? [])
    setEditCompanyTags(prismData.company_tags ?? [])
    setEditIndustryTags(prismData.industry_tags ?? [])

    if (prismData.content_id) {
        const { data: contentData } = await supabase
        .from('contents')
        .select('id, type, title, body, keywords, source, published_at, card_images')
        .eq('id', prismData.content_id)
        .single()
      if (contentData) setContent(contentData as ContentDetail)
    }

    setLoading(false)
  }, [supabase, router, id])

  useEffect(() => { loadData() }, [loadData])

  async function handleSave() {
    if (!prism) return
    setSaving(true)
    setSaveMessage('')
    const { error } = await supabase
      .from('prisms')
      .update({
        title: editTitle.trim() || null,
        body: editBody.trim(),
        job_tags: editJobTags,
        company_tags: editCompanyTags,
        industry_tags: editIndustryTags,
      })
      .eq('id', prism.id)
    if (error) {
      setSaveMessage('저장 중 오류가 발생했습니다.')
    } else {
      setPrism(prev => prev ? {
        ...prev,
        title: editTitle.trim() || null,
        body: editBody.trim(),
        job_tags: editJobTags,
        company_tags: editCompanyTags,
        industry_tags: editIndustryTags,
      } : prev)
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!prism) return
    setDeleting(true)
    await supabase.from('prisms').delete().eq('id', prism.id)
    router.replace('/archive')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f7f7f8' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e4e4e4', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!prism) return null

  const meta = TYPE_META[prism.type]
  const Icon = meta.icon
  const dateStr = new Date(prism.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── 사이드바 ── */}
      <aside className="detail-sidebar" style={{
        width: 240, background: '#fff', borderRight: '1px solid #e4e4e4',
        padding: '24px 0', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 100,
      }}>
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

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>메인</div>
          {[
            { href: '/home',    icon: Home,     label: '홈' },
            { href: '/archive', icon: Archive,  label: '아카이브' },
            { href: '/library', icon: BookOpen, label: '라이브러리' },
          ].map(({ href, icon: NavIcon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
                background: href === '/archive' ? '#EEF2FF' : 'transparent',
                color: href === '/archive' ? '#4F46E5' : '#3b3b41',
                fontWeight: href === '/archive' ? 600 : 500, fontSize: 14,
              }}>
                <NavIcon size={18} strokeWidth={href === '/archive' ? 2.2 : 1.8} />{label}
              </div>
            </Link>
          ))}
          <button type="button" onClick={() => setShowPrismModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px',
            borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14,
            border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)', textAlign: 'left',
          }}>
            <PenLine size={18} strokeWidth={1.8} />프리즘 작성
          </button>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', padding: '6px 20px 4px', textTransform: 'uppercase' }}>계정</div>
          {[
            { href: '/mypage',        icon: User,       label: '마이페이지' },
            { href: '/growth',        icon: TrendingUp, label: '성장기록' },
            { href: '/notifications', icon: Bell,       label: '알림' },
          ].map(({ href, icon: NavIcon, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', margin: '1px 8px', borderRadius: 10, background: 'transparent', color: '#3b3b41', fontWeight: 500, fontSize: 14 }}>
                <NavIcon size={18} strokeWidth={1.8} />{label}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── 메인 ── */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="detail-main">

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button type="button" onClick={() => router.back()} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#555', fontSize: 14, fontWeight: 500, padding: 0,
          }}>
            <ChevronLeft size={18} />뒤로
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => {
                if (editing) {
                  // 취소 시 원래값으로 복원
                  setEditBody(prism.body ?? '')
                  setEditTitle(prism.title ?? '')
                  setEditJobTags(prism.job_tags ?? [])
                  setEditCompanyTags(prism.company_tags ?? [])
                  setEditIndustryTags(prism.industry_tags ?? [])
                  setSaveMessage('')
                }
                setEditing(e => !e)
              }} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: editing ? '#EEF2FF' : '#fff', color: editing ? '#4F46E5' : '#555',
              fontSize: 13, fontWeight: 600, boxShadow: '0 0 0 1px #e4e4e4',
            }}>
              <Pencil size={13} />{editing ? '취소' : '수정'}
            </button>
            <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#fff', color: '#e53e3e', fontSize: 13, fontWeight: 600,
              boxShadow: '0 0 0 1px #e4e4e4',
            }}>
              <Trash2 size={13} />삭제
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0', maxWidth: 720, margin: '0 auto' }}>

          {/* 타입 배지 + 날짜 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: meta.bg, color: meta.color,
              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            }}>
              <Icon size={12} />{meta.label}
            </span>
            <span style={{ fontSize: 12, color: '#aaa' }}>{dateStr}</span>
          </div>

          {prism.title && (
            <h2 style={{
              fontSize: 20, fontWeight: 800, color: '#0a0a0a',
              lineHeight: 1.4, margin: '0 0 16px',
            }}>
              {prism.title}
            </h2>
          )}

          {/* 연결된 콘텐츠 */}
          {content && (
            <div style={{
              background: '#fff', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '16px 18px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                연결된 콘텐츠
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.4, marginBottom: 8 }}>
                {content.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {content.source && (
                    <span style={{ fontSize: 11, color: '#888', background: '#f4f4f6', borderRadius: 6, padding: '2px 8px' }}>
                      {content.source}
                    </span>
                  )}
                  {content.published_at && (
                    <span style={{ fontSize: 11, color: '#bbb' }}>{content.published_at}</span>
                  )}
                </div>
                {prism.article_url && (
                  <a href={prism.article_url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: '#0066ff', fontWeight: 600, textDecoration: 'none',
                  }}>
                    <ExternalLink size={12} />원문 보기
                  </a>
                )}
              </div>
              {content.keywords?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                  {content.keywords.map(kw => (
                    <span key={kw} style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px',
                      borderRadius: 20, background: meta.bg, color: meta.color,
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* 본문 펼치기 버튼 — content.body 있을 때만 */}
              {content.body && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setContentExpanded(e => !e)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 12, color: '#0066ff', fontWeight: 600,
                    }}
                  >
                    {contentExpanded ? '전문 접기 ▲' : '전문 보기 ▼'}
                  </button>
                  {contentExpanded && (
                    <div style={{ marginTop: 10, paddingTop: 12, borderTop: '1px solid #f0f0f2' }}>
                      <p style={{ fontSize: 13, color: '#3b3b41', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {content.body}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 카드뉴스 이미지 */}
              {prism.type === 'card' && content.card_images && content.card_images.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setContentExpanded(e => !e)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 12, color: '#0066ff', fontWeight: 600,
                    }}
                  >
                    {contentExpanded ? '카드 접기 ▲' : `카드 전체 보기 (${content.card_images.length}장) ▼`}
                  </button>
                  {contentExpanded && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {content.card_images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`카드 ${i + 1}`}
                          style={{ width: '100%', borderRadius: 10, border: '1px solid #e4e4e4' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {/* URL만 있는 경우 */}
          {!content && prism.article_url && (
            <div style={{
              background: '#fff', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '14px 18px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: '#888' }}>참고 기사</span>
              <a href={prism.article_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#0066ff', fontWeight: 600, textDecoration: 'none',
              }}>
                <ExternalLink size={12} />원문 보기
              </a>
            </div>
          )}

          {/* 나의 프리즘 본문 */}
          <div style={{
            background: '#fff', border: '1px solid #e4e4e4',
            borderRadius: 14, padding: '20px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              나의 프리즘
            </div>

            {editing ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="제목 (선택)"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid #4F46E5', fontSize: 15, fontWeight: 700,
                    color: '#0a0a0a', outline: 'none', marginBottom: 10,
                    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1.5px solid #4F46E5', fontSize: 14, lineHeight: 1.8,
                    color: '#0a0a0a', resize: 'none', outline: 'none',
                    fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                {saveMessage && (
                  <p style={{ fontSize: 12, color: '#e53e3e', margin: '8px 0 0' }}>{saveMessage}</p>
                )}
              </>
            ) : (
              <>
                {prism.title && (
                  <p style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0a', margin: '0 0 10px', lineHeight: 1.4 }}>
                    {prism.title}
                  </p>
                )}
                <p style={{ fontSize: 15, color: '#0a0a0a', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {prism.body}
                </p>
              </>
            )}
          </div>

          {/* 관점 태그 — 자기이해 제외 */}
          {prism.type !== 'self' && (
          <div style={{
            background: '#fff', border: `1px solid ${editing ? '#c7d2fe' : '#e4e4e4'}`,
            borderRadius: 14, padding: '18px 20px', marginBottom: 16,
            transition: 'border-color .15s',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              관점 태그
            </div>

            {/* 직무 관점 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Briefcase size={11} color="#5040b0" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#5040b0' }}>직무 관점</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {editing
                  ? JOBS.map(tag => (
                      <button key={tag} type="button"
                        onClick={() => setEditJobTags(prev =>
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        )}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          border: 'none', cursor: 'pointer',
                          background: editJobTags.includes(tag) ? '#5040b0' : '#eeebff',
                          color: editJobTags.includes(tag) ? '#fff' : '#5040b0',
                          transition: 'all .15s',
                        }}
                      >{tag}</button>
                    ))
                  : prism.job_tags?.length > 0
                    ? prism.job_tags.map(tag => (
                        <span key={tag} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          background: '#eeebff', color: '#5040b0',
                        }}>{tag}</span>
                      ))
                    : <span style={{ fontSize: 12, color: '#ccc' }}>없음</span>
                }
              </div>
            </div>

            {/* 기업 관점 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Building2 size={11} color="#0052cc" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0052cc' }}>기업 관점</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {editing
                  ? COMPANIES.map(tag => (
                      <button key={tag} type="button"
                        onClick={() => setEditCompanyTags(prev =>
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        )}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          border: 'none', cursor: 'pointer',
                          background: editCompanyTags.includes(tag) ? '#0052cc' : '#e0eaff',
                          color: editCompanyTags.includes(tag) ? '#fff' : '#0052cc',
                          transition: 'all .15s',
                        }}
                      >{tag}</button>
                    ))
                  : prism.company_tags?.length > 0
                    ? prism.company_tags.map(tag => (
                        <span key={tag} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          background: '#e0eaff', color: '#0052cc',
                        }}>{tag}</span>
                      ))
                    : <span style={{ fontSize: 12, color: '#ccc' }}>없음</span>
                }
              </div>
            </div>

            {/* 산업 관점 — 베타 숨김, 데이터 있을 때만 표시 */}
            {(prism.industry_tags?.length > 0 || editing) && false && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <Globe size={11} color="#0066ff" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0066ff' }}>산업 관점</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {editing
                    ? INDUSTRIES.map(tag => (
                        <button key={tag} type="button"
                          onClick={() => setEditIndustryTags(prev =>
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          )}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                            border: 'none', cursor: 'pointer',
                            background: editIndustryTags.includes(tag) ? '#0066ff' : '#e0eaff',
                            color: editIndustryTags.includes(tag) ? '#fff' : '#0066ff',
                            transition: 'all .15s',
                          }}
                        >{tag}</button>
                      ))
                    : prism?.industry_tags?.map(tag => (
                        <span key={tag} style={{
                          fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
                          background: '#e0eaff', color: '#0066ff',
                        }}>{tag}</span>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
          )}

          {/* 자기이해 — 자소서·면접 연결 아코디언 */}
          {prism.type === 'self' && (
            <SelfAccordion />
          )}

          {/* 수정 모드 저장 버튼 */}
          {editing && (
  <div style={{ marginBottom: 16 }}>
    {saveMessage && (
      <p style={{ fontSize: 12, color: '#e53e3e', margin: '0 0 8px' }}>{saveMessage}</p>
    )}
    <button
      type="button"
      onClick={handleSave}
      disabled={saving || editBody.trim().length === 0}
      style={{
        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
        background: saving || editBody.trim().length === 0 ? '#e4e4e4' : '#0066ff',
        color: saving || editBody.trim().length === 0 ? '#aaa' : '#fff',
        fontSize: 14, fontWeight: 700,
        cursor: saving || editBody.trim().length === 0 ? 'not-allowed' : 'pointer',
      }}
    >
      {saving ? '저장 중...' : '저장하기'}
    </button>
  </div>
)}

{/* 붙여넣은 기사 본문 */}
          {prism.article_body && (
            <div style={{
              background: '#fafafa', border: '1px solid #e4e4e4',
              borderRadius: 14, padding: '18px 20px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                참고 기사 본문
              </div>
              <p style={{
                fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap',
                display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {prism.article_body}
              </p>
            </div>
          )}

        </div>
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>프리즘 삭제</div>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
              이 프리즘을 삭제할까요?<br />삭제 후 복구할 수 없어요.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e4e4e4',
                background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#3b3b41',
              }}>취소</button>
              <button type="button" onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: deleting ? '#e4e4e4' : '#e53e3e',
                color: deleting ? '#aaa' : '#fff',
                fontSize: 14, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
              }}>
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
      <BottomNav />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .detail-sidebar { display: flex !important; }
          .detail-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .detail-sidebar { display: none !important; }
          .detail-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}