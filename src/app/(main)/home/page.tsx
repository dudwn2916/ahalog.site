'use client';

import BottomNav from '@/components/ui/BottomNav';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrismModal from '@/components/ui/PrismModal';

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────
type Tab = '인사이트 워밍업' | '세상 한 조각' | '나를 만드는 질문';
const TABS: Tab[] = ['인사이트 워밍업', '세상 한 조각', '나를 만드는 질문'];

// ────────────────────────────────────────────────
// 탭 → 프리즘 타입 매핑
// ────────────────────────────────────────────────
const TAB_TO_PRISM_TYPE: Record<Tab, string> = {
  '인사이트 워밍업': 'warmup',
  '세상 한 조각':   'issue',
  '나를 만드는 질문': 'self',
};

// ────────────────────────────────────────────────
// 사이드바 아이템
// ────────────────────────────────────────────────
function SidebarItem({
  icon, label, href, active = false,
}: { icon: string; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 10,
      background: active ? 'rgba(0,102,255,.08)' : 'transparent',
      color: active ? 'var(--blue)' : 'var(--fg3)',
      fontWeight: active ? 700 : 500,
      fontSize: 14,
      textDecoration: 'none',
      transition: 'background .15s, color .15s',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </Link>
  );
}

// ────────────────────────────────────────────────
// 태그
// ────────────────────────────────────────────────
const TAG_STYLE: Record<string, React.CSSProperties> = {
  워밍업:   { background: '#fff4e6', color: '#b05000' },
  이슈:     { background: '#e0eaff', color: '#0066ff' },
  산업:     { background: '#eeebff', color: '#5040b0' },
  자기이해: { background: '#e6f8f2', color: '#1a7a58' },
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
      <div style={{ background: '#17171a', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.9)', borderRadius: 100, padding: '3px 8px' }}>인사이트 워밍업</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>오늘의 단어</span>
      </div>
    ),
    '세상 한 조각': (
      <div style={{ background: '#0a3a6e', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.9)', borderRadius: 100, padding: '3px 8px' }}>세상 한 조각</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>오늘의 이슈</span>
      </div>
    ),
    '나를 만드는 질문': (
      <div style={{ background: 'linear-gradient(135deg,#2d1a4a,#1a2d4a)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.9)', borderRadius: 100, padding: '3px 8px' }}>나를 만드는 질문</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>자기이해</span>
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
  const router = useRouter();

  const dateStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const goPrism = (type: string) => router.push(`/prism?type=${type}`);
  const activeTabIndex = TABS.indexOf(activeTab);
  const goPrevTab = () => setActiveTab(TABS[(activeTabIndex - 1 + TABS.length) % TABS.length]);
  const goNextTab = () => setActiveTab(TABS[(activeTabIndex + 1) % TABS.length]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif" }}>

      {/* ── 사이드바 ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: '#fff',
        borderRight: '1px solid var(--border)', padding: '24px 12px',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 100,
      }} className="sidebar-desktop">
        <div style={{
          fontSize: 18, fontWeight: 800, padding: '4px 14px 24px',
          background: 'linear-gradient(90deg,#9b8de8,#74b8e8,#e888c8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AHALOGUE</div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarItem icon="🏠" label="홈"         href="/home"    active />
          <SidebarItem icon="📁" label="아카이브"   href="/archive" />
          <SidebarItem icon="📚" label="라이브러리" href="/library" />
          <SidebarItem icon="✦" label="프리즘 작성" href="/prism"   />
        </nav>

        <div style={{ height: 1, background: 'var(--border)', margin: '16px 14px' }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarItem icon="👤" label="마이페이지" href="/mypage" />
          <SidebarItem icon="📈" label="성장기록"   href="/growth" />
          <SidebarItem icon="🔔" label="알림"       href="/notifications" />
        </nav>
      </aside>

      {/* ── 메인 ── */}
      <main style={{
  marginLeft: 240, flex: 1, padding: '32px 24px 32px 24px', // 하단 padding 줄임 (80px → 32px)
  maxWidth: 'calc(240px + 900px)', boxSizing: 'border-box',
}} className="main-content">
        <div style={{ maxWidth: 900 }}>

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
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--fg3)' }}>3개 중 1개 완료</p>
                </div>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>1</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg4)' }}>/3</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {/* 워밍업 완료 */}
                <div onClick={() => goPrism('warmup')} style={{
                  flex: 1, background: 'linear-gradient(145deg,#f0f5ff,#e8eeff)',
                  border: '1px solid #c7d8ff', borderRadius: 12, padding: '14px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer', position: 'relative',
                }}>
                  <div style={{ fontSize: 18 }}>✦</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>워밍업</div>
                  <div style={{
                    position: 'absolute', top: 6, right: 6, width: 16, height: 16,
                    background: 'var(--blue)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#fff', fontWeight: 700,
                  }}>✓</div>
                </div>

                {/* 이슈 읽기 */}
                <div onClick={() => goPrism('issue')} style={{
                  flex: 1, background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 18 }}>📰</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg3)' }}>이슈 읽기</div>
                </div>

                {/* 자기이해 */}
                <div onClick={() => goPrism('self')} style={{
                  flex: 1, background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 18 }}>🪞</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg3)' }}>자기이해</div>
                </div>
              </div>
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
      onClick={goPrevTab}
      className="tab-slider-arrow"
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
      onClick={goNextTab}
      className="tab-slider-arrow"
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
                {[
                  { id: 'nim-2025-05-03',            date: '5월 3일', tag: '워밍업', title: '순이자마진 (NIM) — 은행 수익성 핵심 지표' },
                  { id: 'digital-finance-2025-05-02', date: '5월 2일', tag: '이슈',   title: '디지털 금융 가속화 — 비대면 채널 60% 돌파' },
                ].map((item) => (
                  <Link key={item.id} href={`/library/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--fg4)' }}>{item.date}</span>
                        <Tag label={item.tag} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.5 }}>{item.title}</div>
                    </div>
                  </Link>
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
                {[
                  { id: 'prism-2025-05-02-money', date: '5월 2일', tag: '산업',    title: '"고객이 이동하는 시점이 새로운 관계의 시작이다."', topic: '머니무브 가속화' },
                  { id: 'prism-2025-05-01-self',  date: '5월 1일', tag: '자기이해', title: '"고객 신뢰 구축이 내가 가장 잘할 수 있는 역량이다."', topic: '나를 만드는 질문' },
                ].map((item) => (
                  <Link key={item.id} href={`/archive/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--fg4)' }}>{item.date}</span>
                        <Tag label={item.tag} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.5 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg4)', marginTop: 4 }}>{item.topic}</div>
                    </div>
                  </Link>
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