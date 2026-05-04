export default function FeaturesSection() {
  const features = [
    {
      tagClass: 'tag-i',
      tagLabel: '📰 INSIGHT',
      title: '오늘의 금융 이슈',
      desc: '매일 엄선된 금융 뉴스와 직무별 핵심 용어를 워밍업 형식으로 제공합니다. 바쁜 아침 5분으로 충분합니다.',
    },
    {
      tagClass: 'tag-s',
      tagLabel: '💎 SELF',
      title: '나를 만드는 질문',
      desc: '면접에서 자주 나오는 자기이해 질문에 매일 조금씩 답하며 나만의 스토리를 완성해 나갑니다.',
    },
    {
      tagClass: 'tag-b',
      tagLabel: '📊 BUILD',
      title: '포트폴리오 관리',
      desc: '자소서, 직무 연구, 면접 준비 등 취업 포트폴리오를 한 곳에서 체계적으로 관리합니다.',
    },
    {
      tagClass: 'tag-w',
      tagLabel: '🌱 WRITE',
      title: '프리즘 작성',
      desc: '오늘의 뉴스를 내 직무 관점으로 해석한 짧은 글을 매일 작성하며 직무 언어를 내 것으로 만듭니다.',
    },
  ]

  return (
    <section className="section" id="features">
      <span className="sec-label">FEATURES</span>
      <h2>핵심 기능</h2>
      <p className="desc">
        금융권 취업 준비의 모든 단계를 하나의 루틴으로 연결합니다.
      </p>
      <div className="feat-grid">
        {features.map((f, i) => (
          <div key={i} className="feat-cell">
            <div className={`feat-tag ${f.tagClass}`}>{f.tagLabel}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}