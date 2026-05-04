import LandingNav from './LandingNav.jsx'
import Hero from './Hero.jsx'
import WhySection from './WhySection.jsx'
import PrismCard from './PrismCard.jsx'
import FeaturesSection from './FeaturesSection.jsx'
import CtaSection from './CtaSection.jsx'
import LandingFooter from './LandingFooter.jsx'

export default function LandingPage({ onOpenModal }) {
  return (
    <>
      <LandingNav onOpenModal={onOpenModal} />
      <Hero onOpenModal={onOpenModal} />
      <hr className="divider" />
      <WhySection onOpenModal={onOpenModal} />
      <hr className="divider" />
      <PrismCard onOpenModal={onOpenModal} />
      <hr className="divider" />
      <FeaturesSection onOpenModal={onOpenModal} />
      <hr className="divider" />
      <CtaSection onOpenModal={onOpenModal} />
      <LandingFooter />
    </>
  )
}