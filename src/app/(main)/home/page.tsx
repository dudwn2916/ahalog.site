'use client';

import BottomNav from '@/components/ui/BottomNav';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrismModal from '@/components/ui/PrismModal';
import { createClient } from '@/lib/supabase/client';

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────
type Tab = '인사이트 워밍업' | '세상 한 조각' | '나를 만드는 질문';
const TABS: Tab[] = ['인사이트 워밍업', '세상 한 조각', '나를 만드는 질문'];

// ────────────────────────────────────────────────
// 탭 → 프리즘 타입 매핑
// ────────────────────────────────────────────────
const TAB_TO_PRISM_TYPE: Record<Tab, string> = {
  '인사이트 워밍업': 'card',
  '세상 한 조각':    'opinion',
  '나를 만드는 질문': 'self',
};

// ────────────────────────────────────────────────
// 사이드바 아이템
// ────────────────────────────────────────────────
import { Home, Archive, BookOpen, PenLine, User, TrendingUp, Bell } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  archive: Archive,
  library: BookOpen,
  pen: PenLine,
  user: User,
  trending: TrendingUp,
  bell: Bell,
}

const sidebarStyles = {
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: '#aaa',
    letterSpacing: '0.06em', padding: '6px 20px 4px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
}

function SidebarItem({ icon, label, href, active = false }: {
  icon: string; label: string; href: string; active?: boolean
}) {
  const Icon = ICON_MAP[icon]
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
        background: active ? '#EEF2FF' : 'transparent',
        color: active ? '#4F46E5' : '#3b3b41',
        fontWeight: active ? 600 : 500,
        fontSize: 14, cursor: 'pointer',
      }}>
        {Icon && <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />}
        {label}
      </div>
    </Link>
  )
}

function SidebarItemButton({ icon, label, onClick }: {
  icon: string; label: string; onClick: () => void
}) {
  const Icon = ICON_MAP[icon]
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 20px', margin: '1px 8px', borderRadius: 10,
      background: 'transparent', color: '#3b3b41',
      fontWeight: 500, fontSize: 14,
      border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)',
      textAlign: 'left',
    }}>
      {Icon && <Icon size={18} strokeWidth={1.8} />}
      {label}
    </button>
  )
}


// ────────────────────────────────────────────────
// 태그
// ────────────────────────────────────────────────
const TAG_STYLE: Record<string, React.CSSProperties> = {
  // 지난 콘텐츠용
  워밍업:   { background: '#fff4e6', color: '#b05000' },   // 노랑/주황
  이슈:     { background: '#e6f7ee', color: '#1a7a48' },   // 연두/초록
  자기이해: { background: '#e0eaff', color: '#0052cc' },   // 연파랑/파랑
  // 최근 기록용
  카드뉴스: { background: '#fff4e6', color: '#b05000' },   // 노랑/주황
  기사:     { background: '#e6f7ee', color: '#1a7a48' },   // 연두/초록
  // 자기이해 위에서 공유
};

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '2px 8px',
      ...(TAG_STYLE[label] ?? { background: 'var(--surface)', color: 'var(--fg3)' }),
    }}>{label}</span>
  );
}


// ────────────────────────────────────────────────
// 탭 콘텐츠
// ────────────────────────────────────────────────
function TabContent({ tab, onPrism }: { tab: Tab; onPrism: (type: string) => void }) {
  const prismType = TAB_TO_PRISM_TYPE[tab];

  const HEADERS: Record<Tab, React.ReactNode> = {
    '인사이트 워밍업': (
      <div style={{ background: 'linear-gradient(135deg,#ffe8cc,#ffd4a0)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: '#5a3000', borderRadius: 100, padding: '3px 8px' }}>인사이트 워밍업</span>
        <span style={{ fontSize: 11, color: '#5a3000' }}>오늘의 상식</span>
      </div>
    ),
    '세상 한 조각': (
      <div style={{ background: 'linear-gradient(135deg,#c8f0d8,#a8e4be)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: '#0f4a28', borderRadius: 100, padding: '3px 8px' }}>세상 한 조각</span>
        <span style={{ fontSize: 11, color: '#0f4a28' }}>오늘의 이슈</span>
      </div>
    ),
    '나를 만드는 질문': (
      <div style={{ background: 'linear-gradient(135deg,#c8deff,#a8c8f8)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: '#003580', borderRadius: 100, padding: '3px 8px' }}>나를 만드는 질문</span>
        <span style={{ fontSize: 11, color: '#003580' }}>자기 이해</span>
      </div>
    ),
  };

  const BODIES: Record<Tab, React.ReactNode> = {
    '인사이트 워밍업': (
      <>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>주당순이익</div>
        <div style={{ fontSize: 12, color: 'var(--fg4)', marginBottom: 10 }}>EPS · Earnings Per Share</div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, marginBottom: 14 }}>
          기업이 일정 기간 벌어들인 순이익을 발행 주식 수로 나눈 값.
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg4)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>예시</div>
          <div style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.6 }}>A은행의 1분기 순이익 1조 원 ÷ 발행주식 5억 주 = EPS 2,000원.</div>
        </div>
      </>
    ),
    '세상 한 조각': (
      <>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>디지털 금융 가속화</div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, marginBottom: 16 }}>
          비대면 채널 거래 비중이 60%를 돌파했습니다. 주요 시중은행들은 앱 중심 서비스 재편에 속도를 내고 있습니다.
        </p>
      </>
    ),
    '나를 만드는 질문': (
      <>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.4 }}>
          고객과 신뢰를 쌓을 때 나는 어떤 강점을 활용하는가?
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, marginBottom: 16 }}>
          나의 고유한 강점을 발견하고, 그것이 어떻게 발휘되는지 기록해보세요.
        </p>
      </>
    ),
  };

  return (
    <>
      {HEADERS[tab]}
      <div style={{ padding: 18 }}>
        {BODIES[tab]}
        <button
          onClick={() => onPrism(prismType)}
          style={{
            background: 'var(--ink)', color: '#fff', border: 'none',
            borderRadius: 100, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >프리즘 작성 →</button>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('인사이트 워밍업');
  const [showPrismModal, setShowPrismModal] = useState(false);
  const [todayRoutine, setTodayRoutine] = useState<string[]>([])
  const [completedTypes, setCompletedTypes] = useState<string[]>([])
  const [pastContents, setPastContents] = useState<{
    id: string; date: string; tag: string; title: string; hasPrism: boolean; prismId?: string
  }[]>([])
  const [recentPrisms, setRecentPrisms] = useState<{
    id: string; date: string; tag: string; title: string; topic: string
  }[]>([])

  const router = useRouter();
  const supabase = createClient()
  const [contentIds, setContentIds] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadContentIds() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date().toISOString().slice(0, 10)
      const [{ data: userData }, { data: cardContents }, { data: selfContents }, { data: articleContents }] =
        await Promise.all([
          supabase.from('users').select('card_progress, self_progress').eq('id', user.id).single(),
          supabase.from('contents').select('id').eq('type', 'card').order('published_at', { ascending: true }),
          supabase.from('contents').select('id').eq('type', 'question').order('published_at', { ascending: true }),
          supabase.from('contents').select('id').eq('type', 'article').lte('published_at', today).order('published_at', { ascending: false }),
        ])
      if (!userData) return
      const map: Record<string, string> = {}
      if (cardContents?.length) map['card'] = cardContents[(userData.card_progress ?? 0) % cardContents.length].id
      if (selfContents?.length) map['self'] = selfContents[(userData.self_progress ?? 0) % selfContents.length].id
      if (articleContents?.length) map['opinion'] = articleContents[0].id
      setContentIds(map)

      // 오늘 요일 (mon~sun)
      const dayKeys = ['sun','mon','tue','wed','thu','fri','sat']
      const todayKey = dayKeys[new Date().getDay()]

      // 유저 루틴 설정 불러오기
      const { data: routineData } = await supabase
        .from('users')
        .select('routine')
        .eq('id', user.id)
        .single()

      const routine = routineData?.routine
      const todayConfig = routine?.[todayKey]
      if (todayConfig?.enabled && todayConfig?.types?.length > 0) {
        setTodayRoutine(todayConfig.types)
      } else {
        setTodayRoutine([])
      }

      // 오늘 작성한 프리즘 타입 목록
      const todayStart = new Date().toISOString().slice(0, 10)
      const { data: todayPrisms } = await supabase
        .from('prisms')
        .select('type')
        .eq('user_id', user.id)
        .gte('created_at', todayStart)

      setCompletedTypes((todayPrisms ?? []).map((p: { type: string }) => p.type))
    }
    loadContentIds()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: contents } = await supabase
        .from('contents')
        .select('id, title, type, published_at')
        .order('published_at', { ascending: false })

      const { data: prisms } = await supabase
        .from('prisms')
        .select('content_id, id')
        .eq('user_id', user.id)
        .not('content_id', 'is', null)

      const writtenMap = new Map((prisms ?? []).map((p: { content_id: string; id: string }) => [p.content_id, p.id]))
      const tagMap: Record<string, string> = { card: '워밍업', article: '이슈', question: '자기이해' }

      setPastContents(
        (contents ?? []).slice(0, 2).map(c => ({
          id: c.id,
          date: c.published_at ? `${c.published_at.slice(5, 10).replace('-', '월 ')}일` : '',
          tag: tagMap[c.type] ?? '워밍업',
          title: c.title ?? '',
          hasPrism: writtenMap.has(c.id),
          prismId: writtenMap.get(c.id),
        }))
      )

      const { data: recentData } = await supabase
        .from('prisms')
        .select('id, type, body, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2)

      const recentTagMap: Record<string, string> = { card: '카드뉴스', opinion: '기사', self: '자기이해' }
      setRecentPrisms(
        (recentData ?? []).map((p: { id: string; type: string; body: string | null; created_at: string }) => ({
          id: p.id,
          date: p.created_at ? `${p.created_at.slice(5, 10).replace('-', '월 ')}일` : '',
          tag: recentTagMap[p.type] ?? '자기이해',
          title: (p.body ?? '').slice(0, 30) || '기록',
          topic: p.body ?? '',
        }))
      )
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dateStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const goPrism = (type: string) => {
    const contentId = contentIds[type]
    const routineTypesQuery = todayRoutine.join(',')
    const completedTypesQuery = completedTypes.join(',')
    const base = contentId
      ? `/prism/write?type=${type}&contentId=${contentId}`
      : `/prism/write?type=${type}`
    router.push(`${base}&routineTypes=${routineTypesQuery}&completedTypes=${completedTypesQuery}`)
  };
  const ROUTINE_ITEMS = [
    { type: 'card',    icon: '✦',  label: '워밍업' },
    { type: 'opinion', icon: '📰', label: '이슈 읽기' },
    { type: 'self',    icon: '🪞', label: '자기이해' },
  ]
  const activeTabIndex = TABS.indexOf(activeTab);
  const goPrevTab = () => setActiveTab(TABS[(activeTabIndex - 1 + TABS.length) % TABS.length]);
  const goNextTab = () => setActiveTab(TABS[(activeTabIndex + 1) % TABS.length]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif" }}>

      {/* ── 사이드바 ── */}
<aside style={{
  width: 240, flexShrink: 0, background: '#fff',
  borderRight: '1px solid var(--border)', padding: '24px 0',
  display: 'flex', flexDirection: 'column',
  position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 100,
}} className="sidebar-desktop">

  <div style={{
    fontSize: 18, fontWeight: 800, padding: '4px 20px 28px',
    background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  }}>AHALOGUE</div>

  <div style={{ marginBottom: 8 }}>
    <div style={sidebarStyles.sectionLabel}>메인</div>
    <SidebarItem icon="home"    label="홈"           href="/home"    active />
    <SidebarItem icon="archive" label="아카이브"     href="/archive" />
    <SidebarItem icon="library" label="라이브러리"   href="/library" />
    <SidebarItemButton icon="pen" label="프리즘 작성" onClick={() => setShowPrismModal(true)} />
  </div>

  <div>
    <div style={sidebarStyles.sectionLabel}>계정</div>
    <SidebarItem icon="user"     label="마이페이지" href="/mypage"        />
    <SidebarItem icon="trending" label="성장기록"   href="/growth"        />
    <SidebarItem icon="bell"     label="알림"       href="/notifications" />
  </div>

</aside>

      {/* ── 메인 ── (남은 폭 전체 사용 후 내부 900px만 중앙 정렬) ── */}
      <main style={{
        marginLeft: 240,
        flex: 1,
        minWidth: 0,
        boxSizing: 'border-box',
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'center',
      }} className="main-content">
        <div style={{ width: '100%', maxWidth: 900 }}>

          {/* 날짜 + 제목 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg4)', marginBottom: 4 }}>
              {dateStr}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
              오늘의{' '}
              <span style={{ background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                프리즘
              </span>을 기록할 시간입니다
            </div>
          </div>

          {/* 루틴 + 스트릭 2열 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="streak-row">

            {/* 루틴 카드 */}
            <div style={{ background: 'linear-gradient(145deg,#fdfcff,#f8f5ff)', border: '1px solid #ebe6fa', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>오늘의 루틴</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fg3)' }}>
                    {todayRoutine.length > 0
                      ? `${todayRoutine.length}개 중 ${completedTypes.filter(t => todayRoutine.includes(t)).length}개 완료`
                      : '오늘 루틴 없음'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>
                    {completedTypes.filter(t => todayRoutine.includes(t)).length}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg4)' }}>
                    /{todayRoutine.length}
                  </span>
                </div>
              </div>

              {todayRoutine.length === 0 ? (
                <div style={{
                  padding: '16px 0', textAlign: 'center',
                  fontSize: 13, color: 'var(--fg4)', lineHeight: 1.6,
                }}>
                  오늘은 루틴이 없는 날이에요 😊<br/>
                  <span style={{ fontSize: 11 }}>루틴 설정에서 변경할 수 있어요</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROUTINE_ITEMS.map(item => {
                    const isInRoutine = todayRoutine.includes(item.type)
                    const isDone = completedTypes.includes(item.type)
                    return (
                      <div
                        key={item.type}
                        onClick={() => isInRoutine && goPrism(item.type)}
                        style={{
                          flex: 1,
                          background: isDone
                            ? 'linear-gradient(145deg,#f0f5ff,#e8eeff)'
                            : isInRoutine ? '#fff' : '#f7f7f8',
                          border: isDone
                            ? '1px solid #c7d8ff'
                            : isInRoutine ? '1px solid var(--border)' : '1px solid #ececec',
                          borderRadius: 12, padding: '14px 10px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          cursor: isInRoutine ? 'pointer' : 'default',
                          position: 'relative',
                          opacity: isInRoutine ? 1 : 0.4,
                        }}
                      >
                        <div style={{ fontSize: 18 }}>{item.icon}</div>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: isInRoutine ? 'var(--ink)' : 'var(--fg4)',
                        }}>{item.label}</div>
                        {isDone && (
                          <div style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 16, height: 16, background: 'var(--blue)',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, color: '#fff', fontWeight: 700,
                          }}>✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 스트릭 → 성장기록 */}
            <Link href="/growth" style={{
              background: 'linear-gradient(145deg,#fdfcff,#f8f5ff)',
              border: '1px solid #ebe6fa', borderRadius: 14, padding: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', textDecoration: 'none',
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>연속 기록 중</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--fg3)' }}>어제도 훌륭했어요!</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 36, fontWeight: 800, lineHeight: 1,
                  background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>7</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg4)' }}>일 연속</div>
              </div>
            </Link>
          </div>

          {/* 오늘의 아하! 슬라이더 */}
<div style={{ marginBottom: 24 }}>
  <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>오늘의 아하! 💡</h3>

  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
    {TABS.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => setActiveTab(tab)}
        style={{
          border: `1px solid ${activeTab === tab ? '#17171a' : 'var(--border)'}`,
          background: activeTab === tab ? '#17171a' : '#fff',
          color: activeTab === tab ? '#fff' : 'var(--ink)',
          borderRadius: 100,
          padding: '7px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {tab}
      </button>
    ))}
  </div>

  <div style={{ position: 'relative' }}>
  <button
  type="button"
  onClick={goPrevTab}
  style={{
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'rgba(255,255,255,.94)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink)',
        fontSize: 20,
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,.08)',
      }}
      aria-label="이전 슬라이드"
    >
      ‹
    </button>

    <div
      style={{
        margin: '0 48px',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <TabContent tab={activeTab} onPrism={goPrism} />
    </div>

    <button
  type="button"
  onClick={goNextTab}
  style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'rgba(255,255,255,.94)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink)',
        fontSize: 20,
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,.08)',
      }}
      aria-label="다음 슬라이드"
    >
      ›
    </button>
  </div>
</div>


          {/* 지난 콘텐츠 + 최근 기록 2열 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="card-grid-2">

            {/* 지난 콘텐츠 → 전체보기 /library */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>지난 콘텐츠</h3>
                <Link href="/library" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>전체 보기</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pastContents.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.hasPrism && item.prismId) {
                        router.push(`/archive/${item.prismId}`)
                      } else {
                        const typeMap: Record<string, string> = { 워밍업: 'card', 이슈: 'opinion', 자기이해: 'self' }
                        router.push(`/prism/write?type=${typeMap[item.tag] ?? 'card'}&contentId=${item.id}`)
                      }
                    }}
                    style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--fg4)' }}>{item.date}</span>
                      <Tag label={item.tag} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.5 }}>{item.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 기록 → 전체보기 /archive */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>최근 기록</h3>
                <Link href="/archive" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>전체 보기</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentPrisms.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/archive/${item.id}`)}
                    style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--fg4)' }}>{item.date}</span>
                      <Tag label={item.tag} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.5 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg4)', marginTop: 4 }}>{item.topic}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav onPrismClick={() => setShowPrismModal(true)} />

      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .tab-slider-arrow { display: none !important; }
          .sidebar-desktop { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 20px 16px 80px !important; }
          .streak-row { grid-template-columns: 1fr !important; }
          .card-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}