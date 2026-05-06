'use client';

export const dynamic = 'force-dynamic';
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <LoginForm />
    </div>
  )
}