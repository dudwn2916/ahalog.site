import { useState } from 'react'
import LandingPage from './components/landing/LandingPage.jsx'
import AuthModal from './components/auth/AuthModal.jsx'
import UserSetup from './components/auth/UserSetup.jsx'
import AppShell from './components/app/AppShell.jsx'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [activePanel, setActivePanel] = useState('home')

  function openModal() {
    setModalOpen(true)
    setIsSignup(false)
  }

  function handleLogout() {
    signOut()
  }

  if (authLoading || profileLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '16px',
        color: '#888',
      }}>
        로딩 중...
      </div>
    )
  }

  // User logged in but no profile yet → show setup
  if (user && !profile) {
    return <UserSetup userId={user.id} />
  }

  // User logged in with profile → show app
  if (user && profile) {
    return (
      <AppShell
        user={user}
        profile={profile}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        onLogout={handleLogout}
      />
    )
  }

  // Not logged in → show landing + modal
  return (
    <>
      <LandingPage onOpenModal={openModal} />
      <AuthModal
        isOpen={modalOpen}
        isSignup={isSignup}
        setIsSignup={setIsSignup}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}