export default function PortfolioPanel() {
  const cards = [
    {
      icon: '📝',
      title: '자기소개서',
      desc: '국민은행 PB 직무 지원 자소서. 4개 항목 중 3개 완성.',
      status: 'ps-prog',
      statusLabel: '진행 중',
      deadline: 'D-14',
    },
    {
      icon: '🔍',
      title: '직무 연구',
      desc: 'PB 직무 분석 및 경쟁사 비교. 신한, 하나, 국민 3행 분석 완료.',
      status: 'ps-done',
      statusLabel: '완료',
      deadline: '완료',
    },
    {
      icon: '💬',
      title: '면접 예상 질문',
      desc: '직무 역량 및 인성 면접 질문 30개 수집 및 답변 초안 작성 중.',
      status: 'ps-prog',
      statusLabel: '진행 중',
      deadline: 'D-21',
    },
    {
      icon: '📊',
      title: '금융 이슈 스크랩',
      desc: '2026년 상반기 주요 금융 이슈 아카이브. 프리즘 연계 예정.',
      status: 'ps-new',
      statusLabel: '새 항목',
      deadline: '상시',
    },
  ]

  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'6px'}}>포트폴리오</h2>
        <p style={{fontSize:'14px',color:'var(--muted)'}}>취업 준비 자료를 한 곳에서 관리하세요.</p>
      </div>
      <div className="port-grid">
        {cards.map((c, i) => (
          <div key={i} className="port-card">
            <div className="port-icon">{c.icon}</div>
            <h4>{c.title}</h4>
            <p>{c.desc}</p>
            <div className="port-footer">
              <span className={`port-status ${c.status}`}>{c.statusLabel}</span>
              <span className="port-deadline">{c.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}