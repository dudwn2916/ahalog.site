import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function AuthModal({ isOpen, isSignup, setIsSignup, onClose }) {
  const { signUp, signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignup) {
        if (password !== pwConfirm) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`auth-modal${isOpen ? ' is-open' : ''}`}>
      <div className="auth-modal-backdrop" onClick={onClose} />
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        <h3>{isSignup ? '회원가입' : '로그인'}</h3>
        <p className="auth-modal-desc">
          {isSignup
            ? 'AHALOGUE와 함께 금융 취업 루틴을 시작해 보세요.'
            : '계속하려면 로그인해 주세요.'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>이메일</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className={isSignup ? 'signup-only visible' : 'signup-only'}>
            <div className="auth-field">
              <label>비밀번호 확인</label>
              <input
                type="password"
                placeholder="••••••••"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
              />
            </div>
          </div>
          {!isSignup && (
            <div className="auth-remember">
              <input
                type="checkbox"
                id="auto-login"
                checked={autoLogin}
                onChange={e => setAutoLogin(e.target.checked)}
              />
              <label htmlFor="auto-login">자동 로그인</label>
            </div>
          )}
          {error && <div style={{ color: '#ff4242', fontSize: '12px', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '처리 중...' : isSignup ? '가입하기' : '로그인'}
          </button>
        </form>
        <div className="auth-toggle-row">
          {isSignup ? '이미 계정이 있으신가요? ' : '아직 계정이 없으신가요? '}
          <button className="auth-toggle-btn" onClick={() => {
            setIsSignup(!isSignup)
            setError(null)
          }}>
            {isSignup ? '로그인' : '가입하기'}
          </button>
        </div>
        <div className="auth-oauth">
          <p className="auth-oauth-label">또는</p>
          <button className="oauth-btn" onClick={handleGoogleSignIn} disabled={loading} type="button">
            <svg width="18" height="18" viewBox="0 0 18 18" style={{marginRight:8,flexShrink:0}}>
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>
      </div>
    </div>
  )
}