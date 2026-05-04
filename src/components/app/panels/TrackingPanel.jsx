import GrassGrid from '../../shared/GrassGrid.jsx'

const BADGES = [
  { emoji: '🔥', name: '첫 불꽃', cond: '첫 프리즘 작성', earned: true },
  { emoji: '📅', name: '일주일 연속', cond: '7일 연속 학습', earned: true },
  { emoji: '💎', name: '프리즘 10개', cond: '프리즘 10개 작성', earned: true },
  { emoji: '🏆', name: '한 달 연속', cond: '30일 연속 학습', earned: false },
  { emoji: '🌟', name: '커뮤니티 스타', cond: '좋아요 50개 받기', earned: false },
  { emoji: '🎯', name: '취업 완료', cond: '최종 합격 인증', earned: false },
]

export default function TrackingPanel() {
  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'6px'}}>성장 추적</h2>
        <p style={{fontSize:'14px',color:'var(--muted)'}}>꾸준함이 합격을 만듭니다.</p>
      </div>

      <div className="stat-cards-row">
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-text">
            <h4>12</h4>
            <p>연속 학습일</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💎</span>
          <div className="stat-text">
            <h4>23</h4>
            <p>총 프리즘 수</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-text">
            <h4>47</h4>
            <p>학습 콘텐츠</p>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:'24px'}}>
        <div className="sec-head">
          <h3>학습 잔디</h3>
          <span style={{fontSize:'13px',color:'var(--muted)'}}>최근 26주</span>
        </div>
        <GrassGrid />
        <div style={{display:'flex',gap:'8px',alignItems:'center',fontSize:'12px',color:'var(--muted2)',marginTop:'8px'}}>
          <span>적음</span>
          <div className="grass-cell" />
          <div className="grass-cell l1" />
          <div className="grass-cell l2" />
          <div className="grass-cell l3" />
          <div className="grass-cell l4" />
          <span>많음</span>
        </div>
      </div>

      <div className="card">
        <div className="sec-head" style={{marginBottom:'16px'}}>
          <h3>획득 배지</h3>
          <span style={{fontSize:'13px',color:'var(--muted)'}}>3 / 6</span>
        </div>
        <div className="badge-grid">
          {BADGES.map((b, i) => (
            <div key={i} className={`badge-item${b.earned ? ' earned' : ' locked'}`}>
              <div className="badge-emoji">{b.earned ? b.emoji : '🔒'}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-cond">{b.cond}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}