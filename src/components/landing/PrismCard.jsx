export default function PrismCard() {
  return (
    <div className="prism-wrap">
      <div className="prism-card">
        <div className="prism-head">
          <div className="prism-icon">💎</div>
          <div className="prism-meta">
            <span style={{fontSize:'12px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'rgba(255,255,255,.45)'}}>PRISM</span>
            <span style={{fontSize:'16px', fontWeight:700, color:'#fff'}}>프리즘이란?</span>
          </div>
        </div>
        <h2>뉴스를 내 직무 시각으로 굴절시키는 것</h2>
        <p>같은 뉴스라도 직무마다 다르게 해석됩니다. 나만의 프리즘을 통해 금융 이슈를 직무 언어로 변환해 보세요.</p>
        <div className="prism-eg">
          <div className="eg-event">
            <div className="eg-label">PB 직무 관점</div>
            <div className="eg-row">
              <span className="eg-role">PB</span>
              <span className="eg-text">
                금리 인상으로 <b>예금 상품 매력도 상승</b>. 고액 자산가 고객에게 단기 정기예금 포트폴리오 재편 제안 기회로 활용.
              </span>
            </div>
          </div>
          <div className="eg-event">
            <div className="eg-label">리스크 직무 관점</div>
            <div className="eg-row">
              <span className="eg-role">리스크</span>
              <span className="eg-text">
                금리 상승은 <b>신용 리스크 증가</b> 신호. 변동금리 대출 차주의 DSR 재산정 및 충당금 적립 기준 강화 검토 필요.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}