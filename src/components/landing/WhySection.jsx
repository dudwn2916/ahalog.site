export default function WhySection() {
  const steps = [
    {
      n: 1,
      title: '직무 맞춤 큐레이션',
      desc: 'PB, 여신, 리스크 등 내가 지원하는 직무에 딱 맞는 이슈와 용어를 매일 제공합니다.',
    },
    {
      n: 2,
      title: '프리즘 작성 루틴',
      desc: '뉴스 한 조각을 읽고 나만의 시각으로 해석하는 짧은 글쓰기 습관을 만들어 드립니다.',
    },
    {
      n: 3,
      title: '성장 추적 시각화',
      desc: '잔디 그래프와 연속 학습 스트릭으로 꾸준한 학습 습관을 눈으로 확인하세요.',
    },
    {
      n: 4,
      title: '커뮤니티 피드백',
      desc: '같은 목표를 가진 취준생들과 프리즘을 공유하고 인사이트를 나눠보세요.',
    },
  ]

  return (
    <section className="section" id="why">
      <span className="sec-label">WHY AHALOGUE</span>
      <h2>왜 AHALOGUE인가요?</h2>
      <p className="desc">
        단순 암기가 아닌, 실제 면접관이 납득하는 직무 언어를 매일 조금씩 쌓아갑니다.
      </p>
      <div className="steps">
        {steps.map(s => (
          <div key={s.n} className="step">
            <div className="step-n">{s.n}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}