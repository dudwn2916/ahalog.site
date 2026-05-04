export default function Hero({ onOpenModal }) {
  function scrollToWhy() {
    document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="badge-dot" />
        금융권 취준생을 위한 학습 파트너
      </div>
      <h1>
        매일 한 조각씩,<br />
        <span className="muted">금융의 언어를</span> 내 것으로
      </h1>
      <p className="hero-sub">
        금융 이슈를 <span className="hero-sub-em">내 직무 언어</span>로 해석하고,
        나만의 <span className="hero-sub-em">프리즘</span>을 만들어 가는
        금융권 취준생의 학습 루틴 파트너
      </p>
      <div className="hero-actions">
        <button className="btn-primary" onClick={onOpenModal}>지금 시작하기 →</button>
        <button className="btn-ghost" onClick={scrollToWhy}>서비스 살펴보기</button>
      </div>
    </section>
  )
}