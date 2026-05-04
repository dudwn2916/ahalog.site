export default function CtaSection({ onOpenModal }) {
  return (
    <section className="cta-section">
      <h2>오늘부터 매일 한 조각씩,<br />금융의 언어를 내 것으로</h2>
      <p>
        하루 10분의 루틴이 면접장에서의 자신감이 됩니다.<br />
        지금 바로 AHALOGUE와 함께 시작해 보세요.
      </p>
      <button className="cta-prism-btn" onClick={onOpenModal}>
        💎 지금 바로 프리즘 작성하러 가기
      </button>
      <p className="cta-note">무료로 시작하기 · 신용카드 불필요</p>
    </section>
  )
}