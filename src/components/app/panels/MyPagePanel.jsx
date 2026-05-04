export default function MyPagePanel({ setActivePanel, onLogout }) {
  const menuItems = [
    {
      icon: '📊',
      label: '나의 성장 기록',
      action: () => setActivePanel('tracking'),
    },
    {
      icon: '🎯',
      label: '직무 · 기업 설정',
      action: () => {},
    },
    {
      icon: '🔔',
      label: '알림 설정',
      action: () => {},
    },
    {
      icon: '🚪',
      label: '로그아웃',
      action: onLogout,
      danger: true,
    },
  ]

  return (
    <div>
      <div className="mypage-hero">
        <div className="mypage-profile">
          <div className="mypage-avatar">김</div>
          <div className="mypage-info">
            <h3>김준비</h3>
            <p>국민은행 PB 목표 · 2026 하반기</p>
          </div>
        </div>
        <div className="mypage-stats">
          <div>
            <div className="mypage-stat-num">23</div>
            <div className="mypage-stat-lbl">프리즘</div>
          </div>
          <div>
            <div className="mypage-stat-num">12</div>
            <div className="mypage-stat-lbl">연속 학습</div>
          </div>
          <div>
            <div className="mypage-stat-num">3</div>
            <div className="mypage-stat-lbl">배지</div>
          </div>
        </div>
      </div>

      <div className="card">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 0',
              background: 'none',
              border: 'none',
              borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              color: item.danger ? 'var(--red)' : 'var(--ink2)',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            <span style={{fontSize:'20px'}}>{item.icon}</span>
            {item.label}
            {!item.danger && (
              <span style={{marginLeft:'auto',color:'var(--muted2)'}}>›</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}