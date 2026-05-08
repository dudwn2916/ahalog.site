'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PrismModal from '@/components/ui/PrismModal'
import { CheckCircle2, Circle, ExternalLink, HelpCircle } from 'lucide-react'
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
  Search,
  Layers,
} from 'lucide-react'

// ─── 더미 데이터 ────────────────────────────────────────────────────────────

type ContentType = 'card' | 'article' | 'question'

interface Content {
  id: string
  type: ContentType
  title: string
  tags: string[]
  keywords?: string[]      // ← Supabase 컬럼명
  category?: string
  source?: string
  date: string | undefined
  published_at?: string    // ← Supabase 컬럼명
  hasPrism: boolean
  prismId?: string 
  excerpt: string
  body?: string            // ← Supabase 컬럼명
}

const DUMMY_CONTENTS: Content[] = [
  { id: 'c1', type: 'card',     title: '머니무브 시대, PB의 전략',              tags: ['머니무브','PB','자산관리'],      date: '2025-05-06', hasPrism: true,  excerpt: '고객 자금이 예금에서 투자상품으로 이동하는 현상을 분석하고 PB의 대응 전략을 정리합니다.' },
  { id: 'c2', type: 'card',     title: '2025 은행권 디지털 전환 키워드',        tags: ['디지털전환','AI','마이데이터'],   date: '2025-05-05', hasPrism: false, excerpt: 'AI 행원, 마이데이터, 오픈뱅킹 등 2025년 은행권 디지털 전환의 핵심 키워드를 정리합니다.' },
  { id: 'a1', type: 'article',  title: '토스뱅크 중금리 대출 잔액 5조 돌파',   tags: ['핀테크','중금리','여신'],         date: '2025-05-06', hasPrism: true,  excerpt: '토스뱅크가 중금리 대출 시장에서 빠른 성장세를 보이며 전통 은행의 여신 전략에 변화 압력을 가하고 있다.', source: '한국경제' },
  { id: 'a2', type: 'article',  title: '핀테크 vs 전통 은행, 공존의 가능성',   tags: ['핀테크','오픈뱅킹','경쟁전략'],  date: '2025-05-05', hasPrism: false, excerpt: '카카오뱅크·토스의 성장과 함께 전통 은행이 오픈뱅킹 전략으로 대응하며 공존 모델을 탐색한다.', source: '매일경제' },
  { id: 'q1', type: 'question', title: '내가 은행원이 되고 싶은 진짜 이유는?', tags: ['이유탐색'],                      date: '2025-05-06', hasPrism: true,  excerpt: '직업 선택의 가장 근본적인 이유를 탐색해 봅니다.' },
  { id: 'q2', type: 'question', title: '나는 어떤 고객에게 가장 도움이 되는 금융인인가요?', tags: ['강점'],            date: '2025-05-05', hasPrism: false, excerpt: '내가 가장 잘 도울 수 있는 고객의 모습을 구체적으로 그려봅니다.' },
]

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

const TYPE_META = {
  card:     { label: '카드뉴스', icon: Layers,     color: '#b05000', bg: '#fff4e6' },
  article:  { label: '기사',     icon: Newspaper,  color: '#1a7a48', bg: '#e6f7ee' },
  question: { label: '질문',     icon: HelpCircle, color: '#0052cc', bg: '#e0eaff' },
}

function ContentCard({ item, onClick }: { item: Content; onClick: () => void }) {
  const meta = TYPE_META[item.type]
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
      {/* 상단: 타입 배지 + 날짜 + 완료 여부 */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>{item.date}</span>
          {item.hasPrism
            ? <CheckCircle2 size={14} color="#4F46E5" />
            : <Circle size={14} color="#ddd" />
          }
        </div>
      </div>

      {/* 제목 */}
      <p style={{ fontSize: '15px', fontWeight: 700, color: '#0a0a0a', lineHeight: 1.4, margin: 0 }}>
        {item.title}
      </p>

      {/* 발췌 */}
      <p style={{
        fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {item.excerpt}
      </p>

      {/* 태그 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {item.tags.map(t => (
          <span key={t} style={{
            fontSize: '11px', color: '#3b3b41', background: '#f7f7f8',
            border: '1px solid #e4e4e4', borderRadius: '4px', padding: '2px 7px',
          }}>
            #{t}
          </span>
        ))}
      </div>

      {/* article 전용: 출처 + 외부링크 버튼 */}
      {item.type === 'article' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>{item.source}</span>
          <span
            onClick={e => { e.stopPropagation(); window.open('#', '_blank') }}
            style={{
              fontSize: '11px', color: '#0066ff', display: 'flex', alignItems: 'center',
              gap: '3px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <ExternalLink size={11} /> 전체 기사 보기
          </span>
        </div>
      )}
    </button>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter()

  const supabase = createClient()

   // 탭 (전체 없음, card로 시작)
   const [activeTab, setActiveTab] = useState<ContentType>('card')

   // 검색
   const [searchQuery, setSearchQuery] = useState('')
   const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
 
   const [showPrismModal, setShowPrismModal] = useState(false)

// ── Supabase 데이터 ──────────────────────────────────────────────────────────
// 실데이터 없으면 더미 폴백
const [contents, setContents] = useState<Content[]>(DUMMY_CONTENTS)
const [loading, setLoading] = useState(false)

useEffect(() => {
  async function load() {
    setLoading(true)
    try {
      // 로그인 유저 확인 (비로그인이어도 콘텐츠는 보여줌)
      const { data: { user } } = await supabase.auth.getUser()

      // contents 테이블 조회 — 현재 탭 타입 기준
      // library의 'article' 탭 = contents 테이블의 type 'article'
      const { data: rawContents, error } = await supabase
        .from('contents')
        .select('*')
        .eq('type', activeTab)
        .order('published_at', { ascending: false })

      if (error || !rawContents || rawContents.length === 0) {
        // 실데이터 없으면 더미 폴백
        setContents(DUMMY_CONTENTS)
        setLoading(false)
        return
      }

      // 내가 완료한 prisms 조회 (content_id 기준)
      // library 탭 → prisms 타입 매핑: card→card, article→opinion, question→self
      let prismMap = new Map<string, string>() // contentId → prismId
if (user) {
        const prismType =
          activeTab === 'card'     ? 'card' :
          activeTab === 'article'  ? 'opinion' :
                                     'self'

        const { data: myPrisms } = await supabase
          .from('prisms')
          .select('id, content_id')   // id 추가
          .eq('user_id', user.id)
          .eq('type', prismType)
          .not('content_id', 'is', null) // content_id 없는 직접 작성 제외

          prismMap = new Map(
            (myPrisms ?? [])
              .filter((p: { id: string; content_id: string }) => p.content_id)
              .map((p: { id: string; content_id: string }) => [p.content_id, p.id])
          )
        }

      // Supabase 데이터 → Content 인터페이스로 변환
      const merged: Content[] = rawContents.map((c: Content) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        tags: c.keywords ?? [],
        source: c.source,
        date: c.published_at ?? '',
        hasPrism: prismMap.has(c.id),
        prismId: prismMap.get(c.id),   // ← 이 줄만 추가, prismSet → prismMap 변경
        excerpt: c.body ?? '',
      }))

      setContents(merged)
    } catch {
      // 예외 발생 시 더미 폴백
      setContents(DUMMY_CONTENTS)
    } finally {
      setLoading(false)
    }
  }

  load()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab])



  // ── 필터 로직 ──────────────────────────────────────────────────────────────
  // 탭 변경 시 필터 초기화
  function handleTabChange(tab: ContentType) {
    setActiveTab(tab)
    setSearchQuery('')
  }

  // ── 필터 로직 ──
  const filtered = contents.filter(item => {
    if (item.type !== activeTab) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.excerpt.toLowerCase().includes(q) &&
        !item.tags.some(t => t.toLowerCase().includes(q))
      ) return false
    }
    return true
  })

  const sortedFiltered = [...filtered].sort((a, b) =>
    sortOrder === 'desc'
      ? (b.date ?? '').localeCompare(a.date ?? '')
      : (a.date ?? '').localeCompare(b.date ?? '')
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>

      {/* ── PC 사이드바 ── */}
<aside
  className="library-sidebar"
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
    background: 'transparent', color: '#3b3b41',  // ← 비활성
    fontWeight: 500, fontSize: 14, cursor: 'pointer',
  }}>
    <Archive size={18} strokeWidth={1.8} />아카이브  {/* ← strokeWidth 1.8 */}
  </div>
</Link>

    <Link href="/library" style={{ textDecoration: 'none' }}>
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
    background: '#EEF2FF', color: '#4F46E5',  // ← 활성
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  }}>
    <BookOpen size={18} strokeWidth={2.2} />라이브러리  {/* ← strokeWidth 2.2 */}
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
      <main style={{ marginLeft: 0, padding: '0 0 80px' }} className="library-main">

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '20px 20px 0',
        }}>
          {/* 제목 */}
          <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a0a0a', margin: 0, letterSpacing: '-0.5px' }}>
  콘텐츠 라이브러리
</h1>
<p style={{ fontSize: '13px', color: '#888', margin: '2px 0 0' }}>
  {filtered.length}개의 콘텐츠
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
              { key: 'card',     label: '카드뉴스', icon: Layers },
              { key: 'article',  label: '기사',     icon: Newspaper },
              { key: 'question', label: '질문',     icon: HelpCircle },
            ] as const).map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key} type="button"
                  onClick={() => handleTabChange(tab.key)}
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

          <div style={{ display: 'flex', gap: 4, paddingBottom: 12, alignItems: 'center' }}>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {([
                { key: 'desc', label: '최신순' },
                { key: 'asc', label: '오래된순' },
              ] as const).map(s => (
                <button key={s.key} type="button" onClick={() => setSortOrder(s.key)} style={{
                  padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: sortOrder === s.key ? '#0a0a0a' : '#fff',
                  color: sortOrder === s.key ? '#fff' : '#555',
                  fontSize: 12, fontWeight: sortOrder === s.key ? 700 : 400,
                  boxShadow: '0 0 0 1px #e4e4e4',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

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
      <BookOpen size={32} color="#e4e4e4" style={{ marginBottom: '12px' }} />
      <p style={{ fontSize: '14px', margin: 0 }}>콘텐츠가 없습니다.</p>
      <p style={{ fontSize: '12px', marginTop: '4px', color: '#aaa' }}>필터를 변경해 보세요.</p>
    </div>

  ) : (
    /* 카드 목록 */
    sortedFiltered.map(item => (
      <ContentCard
        key={item.id}
        item={item}
        onClick={() => {
          const typeMap = { card: 'card', article: 'opinion', question: 'self' }
          if (item.hasPrism && item.prismId) {
            router.push(`/archive/${item.prismId}`)
          } else {
            router.push(`/prism/write?type=${typeMap[item.type]}&contentId=${item.id}`)
          }
        }}
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
    .library-sidebar { display: flex !important; }
    .library-main    { margin-left: 240px !important; }
  }
  @media (max-width: 767px) {
    .library-sidebar { display: none !important; }
    .library-main    { margin-left: 0 !important; }
  }
`}</style>
</div>
)
}
