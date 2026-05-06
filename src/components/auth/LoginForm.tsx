'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CSSProperties } from 'react'

import { createClient } from '@/lib/supabase/client'
import { authFormSchema, type AuthFormValues, getOAuthRedirectTo } from '@/lib/auth'

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '14px',
  color: 'var(--ink)',
  outline: 'none',
  background: '#fff',
}

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
}

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setMessage(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/home')
        router.refresh()
        return
      }

      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      router.push('/onboarding')
      router.refresh()
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.'
      setMessage(nextMessage)
    } finally {
      setSubmitting(false)
    }
  })

  const onGoogleLogin = async () => {
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectTo('/home'),
      },
    })

    if (error) {
      setMessage(error.message)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        padding: '20px',
        borderRadius: '16px',
        border: '0.5px solid var(--border)',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p
          style={{
            marginTop: '8px',
            marginBottom: 0,
            color: 'var(--fg3)',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          이메일과 비밀번호 또는 Google 계정으로 시작할 수 있어요.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '12px' }}>
        <input type="email" placeholder="이메일" {...register('email')} style={inputStyle} />
        {errors.email && (
          <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.email.message}</span>
        )}

        <input
          type="password"
          placeholder="비밀번호 (최소 6자)"
          {...register('password')}
          style={inputStyle}
        />
        {errors.password && (
          <span style={{ color: 'var(--danger)', fontSize: '12px' }}>
            {errors.password.message}
          </span>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...buttonStyle,
            marginTop: '4px',
            backgroundColor: 'var(--blue)',
            color: '#fff',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? '처리 중...' : mode === 'login' ? '이메일로 로그인' : '이메일로 회원가입'}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoogleLogin}
        style={{
          ...buttonStyle,
          marginTop: '10px',
          backgroundColor: '#fff',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 800 }}>G</span>
        Google로 계속하기
      </button>

      {message && (
        <p
          style={{
            marginTop: '10px',
            marginBottom: 0,
            fontSize: '13px',
            color: 'var(--danger)',
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
        style={{
          marginTop: '14px',
          border: 'none',
          background: 'transparent',
          color: 'var(--blue)',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {mode === 'login'
          ? '계정이 없나요? 회원가입하기'
          : '이미 계정이 있나요? 로그인하기'}
      </button>
    </div>
  )
}
