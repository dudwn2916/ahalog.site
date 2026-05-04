export default function LandingNav({ onOpenModal }) {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="nav">
      <a className="logo-mark" href="#">
        <img className="logo-img" src="../../assets/mark_logo.png" alt="AHALOGUE" />
        <span className="logo-text">AHALOGUE</span>
      </a>
      <div className="nav-right">
        <button className="nav-link" onClick={() => scrollTo('why')}>서비스 소개</button>
        <button className="nav-link" onClick={() => scrollTo('features')}>기능</button>
        <button className="nav-login" onClick={onOpenModal}>로그인 / 가입</button>
      </div>
    </nav>
  )
}