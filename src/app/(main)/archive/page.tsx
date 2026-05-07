'use client'


import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PrismModal from '@/components/ui/PrismModal'
import BottomNav from '@/components/ui/BottomNav'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Archive,
  BookOpen,
  PenLine,
  User,
  TrendingUp,
  Bell,
  Newspaper,   // ← 추가
  Tag,
  Building2,
  Briefcase,
  Globe,
  Search,
  Clock,
  ThumbsUp,
  Layers,
} from 'lucide-react'

// ─── 더미 데이터 ────────────────────────────────────────────────────────────

type PrismType = 'card' | 'opinion' | 'self'

interface Prism {
  id: string
  type: PrismType
  title: string
  subtitle?: string
  tags: string[]
  category?: string          // self 전용
  viewpoint?: string         // card·opinion 전용
  job?: string
  company?: string
  industry?: string
  date: string
  likes: number
  readTime: number
  excerpt: string
}

const DUMMY_PRISMS: Prism[] = [
  {
    id: '1', type: 'card',
    title: '2024 은행권 디지털 전환 트렌드',
    subtitle: '블록체인·AI 도입 현황 카드뉴스',
    tags: ['디지털전환', 'AI', '블록체인'],
    viewpoint: '기술',
    job: 'IT', company: 'KB국민은행', industry: '은행',
    date: '2025-05-06', likes: 34, readTime: 3,
    excerpt: '은행권 디지털 전환의 핵심 트렌드를 카드뉴스 형식으로 정리했습니다. AI 행원 도입부터 마이데이터까지.',
  },
  {
    id: '2', type: 'opinion',
    title: '핀테크 vs 전통 은행, 공존의 가능성',
    tags: ['핀테크', '경쟁전략', '오픈뱅킹'],
    viewpoint: '전략',
    job: 'PB', company: '신한은행', industry: '핀테크',
    date: '2025-05-05', likes: 21, readTime: 5,
    excerpt: '카카오뱅크의 성장과 전통 은행의 대응 전략을 분석하며, 공존과 경쟁의 경계를 탐색합니다.',
  },
  {
    id: '3', type: 'self',
    title: '내가 금융을 선택한 이유',
    tags: ['직업관', '커리어'],
    category: '직업관',
    job: 'PB', company: 'KB국민은행', industry: '은행',
    date: '2025-05-04', likes: 12, readTime: 2,
    excerpt: '고객의 자산을 함께 지키는 파트너가 되고 싶다는 가치관에서 시작된 커리어 선택을 돌아봅니다.',
  },
  {
    id: '4', type: 'card',
    title: '금리 인상기 PB 전략 가이드',
    subtitle: '고객 포트폴리오 리밸런싱 핵심 포인트',
    tags: ['PB', '금리', '자산관리'],
    viewpoint: '실무',
    job: 'PB', company: 'KB국민은행', industry: '은행',
    date: '2025-05-03', likes: 47, readTime: 4,
    excerpt: '금리 상승 환경에서 PB가 고객에게 제안할 수 있는 리밸런싱 전략과 대화 스크립트를 정리했습니다.',
  },
  {
    id: '5', type: 'opinion',
    title: '리스크관리 조직의 역할 재정의',
    tags: ['리스크', '조직문화', 'ESG'],
    viewpoint: '경영',
    job: '리스크', company: '하나은행', industry: '은행',
    date: '2025-05-02', likes: 18, readTime: 6,
    excerpt: 'ESG 경영 시대에 리스크 관리 부서가 단순 규제 준수를 넘어 가치 창출 조직으로 진화해야 하는 이유.',
  },
  {
    id: '6', type: 'self',
    title: '좋은 금융인이 된다는 것',
    tags: ['가치관', '성장'],
    category: '가치관',
    job: '여신', company: '우리은행', industry: '은행',
    date: '2025-05-01', likes: 29, readTime: 3,
    excerpt: '단순히 상품을 파는 것이 아니라, 고객의 인생 설계에 함께하는 금융인의 역할에 대해 씁니다.',
  },
  {
    id: '7', type: 'card',
    title: '2025 인터넷전문은행 서비스 비교',
    subtitle: '카카오·토스·케이뱅크 기능 분석',
    tags: ['인터넷은행', '비교분석', 'UX'],
    viewpoint: '사용자',
    job: '디지털', company: '기업은행', industry: '핀테크',
    date: '2025-04-30', likes: 55, readTime: 3,
    excerpt: '세 인터넷전문은행의 주요 기능, UX, 금리 경쟁력을 항목별로 비교 분석했습니다.',
  },
  {
    id: '8', type: 'self',
    title: '면접에서 나는 무엇을 말했나',
    tags: ['자기분석', '면접'],
    category: '자기분석',
    job: 'IT', company: '농협', industry: '은행',
    date: '2025-04-29', likes: 9, readTime: 4,
    excerpt: '최종 합격 면접을 돌아보며, 내가 강조했던 가치와 그것이 지금도 유효한지 점검합니다.',
  },
]

const JOBS      = ['전체', 'PB', '여신', '리스크', 'IT', '디지털']
const COMPANIES = ['전체', 'KB국민은행', '신한은행', '하나은행', '우리은행', '기업은행', '농협']
// const INDUSTRIES = ['전체', '은행', '핀테크', '보험', '증권'] // 베타: 은행권 중심, 숨김
const CATEGORIES= ['전체', '직업관', '가치관', '자기분석', '성장']

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

const TYPE_META = {
  card:    { label: '카드뉴스', icon: Layers,    color: '#b05000', bg: '#fff4e6' },
  opinion: { label: '기사',     icon: Newspaper, color: '#1a7a48', bg: '#e6f7ee' },
  self:    { label: '자기이해', icon: User,      color: '#0052cc', bg: '#e0eaff' },
}

function PrismCard({ prism, onClick }: { prism: Prism; onClick: () => void }) {
  const meta = TYPE_META[prism.type]
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e4e4e4', padding: '18px',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        transition: 'box-shadow 0.18s, transform 0.18s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* 상단: 타입 배지 + 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: meta.bg, color: meta.color,
          fontSize: '11px', fontWeight: 600, padding: '3px 8px',
          borderRadius: '20px',
        }}>
          <Icon size={11} />
          {meta.label}
        </span>
        <span style={{ fontSize: '11px', color: '#888' }}>{prism.date}</span>
      </div>

      {/* 제목 */}
      <div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0a0a0a', lineHeight: 1.4, margin: 0 }}>
          {prism.title}
        </p>
        {prism.subtitle && (
          <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{prism.subtitle}</p>
        )}
      </div>

      {/* 발췌 */}
      <p style={{
        fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {prism.excerpt}
      </p>

      {/* 태그 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {prism.tags.map(t => (
          <span key={t} style={{
            fontSize: '11px', color: '#3b3b41', background: '#f7f7f8',
            border: '1px solid #e4e4e4', borderRadius: '4px', padding: '2px 7px',
          }}>
            #{t}
          </span>
        ))}
      </div>

      {/* 하단: 직무·회사 + 통계 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {prism.job && (
            <span style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Briefcase size={10} />{prism.job}
            </span>
          )}
          {prism.company && (
            <span style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Building2 size={10} />{prism.company}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ThumbsUp size={10} />{prism.likes}
          </span>
          <span style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} />{prism.readTime}분
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── 탭/필터 선택 버튼 ────────────────────────────────────────────────────────

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: active ? 700 : 400,
        border: active ? '1.5px solid #0066ff' : '1.5px solid #e4e4e4',
        background: active ? '#eef3ff' : '#fff',
        color: active ? '#0066ff' : '#555',
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function ArchivePage() {
  const router = useRouter()

  const supabase = createClient()

// ── Supabase 데이터 ──────────────────────────────────────────────────────────
// 실데이터 없으면 더미 폴백
const [prisms, setPrisms] = useState<Prism[]>(DUMMY_PRISMS)
const [loading, setLoading] = useState(false)

useEffect(() => {
  async function load() {
    setLoading(true)

    // 로그인 유저 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // 비로그인 시 더미 유지
      setLoading(false)
      return
    }

    // prisms 테이블 조회 + contents 조인 (content_id → contents.id)
    const { data, error } = await supabase
      .from('prisms')
      .select(`
        id,
        type,
        body,
        job_tags,
        company_tags,
        created_at,
        contents (
          id,
          title,
          keywords
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) {
      // 에러 시 더미 유지
      setLoading(false)
      return
    }

    // Supabase 데이터 → Prism 인터페이스로 변환
    const mapped: Prism[] = data.map((p: {
      id: string
      type: string
      body: string
      job_tags: string[]
      company_tags: string[]
      created_at: string
      contents: { id: string; title: string; keywords: string[] } | null
    }) => ({
      id: p.id,
      type: p.type === 'opinion' ? 'opinion' : p.type === 'self' ? 'self' : 'card',
      title: p.contents?.title ?? '제목 없음',
      tags: p.contents?.keywords ?? [],
      category: p.type === 'self' ? (p.job_tags?.[0] ?? '') : undefined,
      job: p.job_tags?.[0],
      company: p.company_tags?.[0],
      date: p.created_at?.slice(0, 10),
      likes: 0,
      readTime: Math.ceil((p.body?.length ?? 0) / 200) || 1,
      excerpt: p.body ?? '',
    }))

    // 실데이터 있으면 교체, 없으면 더미 유지
    setPrisms(mapped.length > 0 ? mapped : DUMMY_PRISMS)
    setLoading(false)
  }

  load()
}, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 타입 필터
  const [activeType, setActiveType] = useState<'all' | PrismType>('all')

  // 세부 필터 (카드·기사용) — 베타: 산업 숨김
  const [filterMode, setFilterMode] = useState<'job' | 'company'>('job')
  const [selectedJob, setSelectedJob]           = useState('전체')
  const [selectedCompany, setSelectedCompany]   = useState('전체')

  // 자기이해 카테고리 필터
  const [selectedCategory, setSelectedCategory] = useState('전체')

  // 검색
  const [searchQuery, setSearchQuery] = useState('')

  const [showPrismModal, setShowPrismModal] = useState(false)

  // ── 필터 로직 ──────────────────────────────────────────────────────────────
  const filtered = prisms.filter(p => {
    // 타입
    if (activeType !== 'all' && p.type !== activeType) return false

    // 자기이해 카테고리
    if ((activeType === 'self' || p.type === 'self') && activeType === 'self') {
      if (selectedCategory !== '전체' && p.category !== selectedCategory) return false
    }

    // 카드·기사 세부 필터
    if (activeType === 'card' || activeType === 'opinion') {
      if (filterMode === 'job'     && selectedJob     !== '전체' && p.job     !== selectedJob)     return false
      if (filterMode === 'company' && selectedCompany !== '전체' && p.company !== selectedCompany) return false
    }

    // '전체' 탭에서도 세부 필터 적용
    if (activeType === 'all') {
      if (p.type !== 'self') {
        if (filterMode === 'job'     && selectedJob     !== '전체' && p.job     !== selectedJob)     return false
        if (filterMode === 'company' && selectedCompany !== '전체' && p.company !== selectedCompany) return false
      }
    }

    // 검색
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.excerpt.toLowerCase().includes(q) &&
        !p.tags.some(t => t.toLowerCase().includes(q))
      ) return false
    }

    return true
  })

  const showSelfFilter   = activeType === 'self'
  const showDetailFilter = activeType !== 'self'

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── PC 사이드바 ── */}
<aside
  className="archive-sidebar"
  style={{
    width: 240, flexShrink: 0, background: '#fff',
    borderRight: '1px solid #e4e4e4', padding: '24px 0',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, height: '100vh',
    overflowY: 'auto', zIndex: 100,
  }}
>
  {/* 로고 */}
  <div style={{
    fontSize: 18, fontWeight: 800, padding: '4px 20px 28px',
    background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  }}>
    AHALOGUE
  </div>

  {/* 섹션: 메인 */}
  <div style={{ marginBottom: 8 }}>
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#aaa',
      letterSpacing: '0.06em', padding: '6px 20px 4px',
      textTransform: 'uppercase',
    }}>
      메인
    </div>

    <Link href="/home" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14, cursor: 'pointer',
      }}>
        <Home size={18} strokeWidth={1.8} />홈
      </div>
    </Link>

    <Link href="/archive" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: '#EEF2FF', color: '#4F46E5',           // ← 아카이브 활성
        fontWeight: 600, fontSize: 14, cursor: 'pointer',
      }}>
        <Archive size={18} strokeWidth={2.2} />아카이브
      </div>
    </Link>

    <Link href="/library" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14, cursor: 'pointer',
      }}>
        <BookOpen size={18} strokeWidth={1.8} />라이브러리
      </div>
    </Link>

    {/* 프리즘 작성 — 홈처럼 버튼으로 모달 오픈 */}
    <button
      type="button"
      onClick={() => setShowPrismModal(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14,
        border: 'none', cursor: 'pointer',
        width: 'calc(100% - 16px)', textAlign: 'left',
      }}
    >
      <PenLine size={18} strokeWidth={1.8} />프리즘 작성
    </button>
  </div>

  {/* 섹션: 계정 */}
  <div>
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#aaa',
      letterSpacing: '0.06em', padding: '6px 20px 4px',
      textTransform: 'uppercase',
    }}>
      계정
    </div>

    <Link href="/mypage" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14, cursor: 'pointer',
      }}>
        <User size={18} strokeWidth={1.8} />마이페이지
      </div>
    </Link>

    <Link href="/growth" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14, cursor: 'pointer',
      }}>
        <TrendingUp size={18} strokeWidth={1.8} />성장기록
      </div>
    </Link>

    <Link href="/notifications" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: 'transparent', color: '#3b3b41',
        fontWeight: 500, fontSize: 14, cursor: 'pointer',
      }}>
        <Bell size={18} strokeWidth={1.8} />알림
      </div>
    </Link>
  </div>
</aside>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="archive-main">

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '20px 20px 0',
        }}>
          {/* 제목 */}
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a0a0a', margin: 0, letterSpacing: '-0.5px' }}>
              아카이브
            </h1>
            <p style={{ fontSize: '13px', color: '#888', margin: '2px 0 0' }}>
              {filtered.length}개의 프리즘
            </p>
          </div>

          {/* 검색 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff', border: '1px solid #e4e4e4', borderRadius: '12px',
            padding: '10px 14px', marginBottom: '14px',
          }}>
            <Search size={15} color="#888" />
            <input
              placeholder="제목, 태그, 내용 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', color: '#0a0a0a', flex: 1,
              }}
            />
          </div>

          {/* 타입 탭 */}
          <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px',
            scrollbarWidth: 'none',
          }}>
            {([
              { key: 'all',     label: '전체',    icon: Globe },
              { key: 'card',    label: '카드뉴스', icon: Layers },
              { key: 'opinion', label: '기사',     icon: Newspaper },
              { key: 'self',    label: '자기이해', icon: User },
            ] as const).map(tab => {
              const Icon = tab.icon
              const isActive = activeType === tab.key
              return (
                <button
                  key={tab.key} type="button"
                  onClick={() => setActiveType(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', borderRadius: '20px', border: 'none',
                    background: isActive ? '#0066ff' : '#fff',
                    color: isActive ? '#fff' : '#555',
                    fontSize: '13px', fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(0,102,255,0.25)' : '0 0 0 1px #e4e4e4',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* 세부 필터 — 카드/기사/전체 */}
          {showDetailFilter && (
            <div style={{ paddingBottom: '12px' }}>
              {/* 필터 모드 선택 — 직무·기업만 (베타: 산업 숨김) */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {([
                  { key: 'job',     label: '직무', icon: Briefcase },
                  { key: 'company', label: '기업', icon: Building2 },
                ] as const).map(m => {
                  const Icon = m.icon
                  const isActive = filterMode === m.key
                  return (
                    <button
                      key={m.key} type="button"
                      onClick={() => setFilterMode(m.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 12px', borderRadius: '6px', border: 'none',
                        background: isActive ? '#0a0a0a' : '#fff',
                        color: isActive ? '#fff' : '#555',
                        fontSize: '12px', fontWeight: isActive ? 700 : 400,
                        cursor: 'pointer',
                        boxShadow: isActive ? 'none' : '0 0 0 1px #e4e4e4',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={11} />
                      {m.label}
                    </button>
                  )
                })}
              </div>

              {/* 필터 칩 목록 */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
                {filterMode === 'job'     && JOBS.map(j =>
                  <FilterChip key={j} label={j} active={selectedJob === j}
                    onClick={() => setSelectedJob(j)} />)}
                {filterMode === 'company' && COMPANIES.map(c =>
                  <FilterChip key={c} label={c} active={selectedCompany === c}
                    onClick={() => setSelectedCompany(c)} />)}
              </div>
            </div>
          )}

          {/* 세부 필터 — 자기이해 카테고리 */}
          {showSelfFilter && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '14px', scrollbarWidth: 'none' }}>
              {CATEGORIES.map(cat => (
                <FilterChip key={cat} label={cat} active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)} />
              ))}
            </div>
          )}
        </div>

        {/* ── 카드 목록 ── */}
<div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

{/* 로딩 중 */}
{loading ? (
  <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: '14px' }}>
    불러오는 중...
  </div>

) : filtered.length === 0 ? (
  /* 빈 상태 */
  <div style={{
    textAlign: 'center', padding: '60px 20px', color: '#888',
    background: '#fff', borderRadius: '14px', border: '1px solid #e4e4e4',
  }}>
    <Tag size={32} color="#e4e4e4" style={{ marginBottom: '12px' }} />
    <p style={{ fontSize: '14px', margin: 0 }}>조건에 맞는 프리즘이 없습니다.</p>
    <p style={{ fontSize: '12px', marginTop: '4px', color: '#aaa' }}>필터를 변경해 보세요.</p>
  </div>

) : (
  /* 카드 목록 */
  filtered.map(prism => (
    <PrismCard
      key={prism.id}
      prism={prism}
      onClick={() => router.push(`/archive/${prism.id}`)}
    />
  ))
)}

</div>
      </main>

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}

      {/* ── 모바일 BottomNav (홈과 동일 구조) ── */}
      <BottomNav />

      {/* ── 반응형 CSS ── */}
      <style>{`
        @media (min-width: 768px) {
          .archive-sidebar { display: flex !important; }
          .archive-main    { margin-left: 240px !important; }
        }
        @media (max-width: 767px) {
          .archive-sidebar { display: none !important; }
          .archive-main    { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
