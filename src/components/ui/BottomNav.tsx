'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Archive, Plus, BookOpen, User } from 'lucide-react'

export default function BottomNav({ onPrismClick }: { onPrismClick?: () => void }) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const tabs = [
    { href: '/home', label: '홈', icon: Home },
    { href: '/archive', label: '아카이브', icon: Archive },
    { href: '/library', label: '라이브러리', icon: BookOpen },
    { href: '/mypage', label: '마이', icon: User },
  ]
  const leftTabs = tabs.slice(0, 2)
  const rightTabs = tabs.slice(2)

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '#ffffff',
          borderTop: '0.5px solid var(--border)',
          paddingTop: '10px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
        className="bottom-nav"
      >
        {leftTabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          return (
            <Link
  key={tab.href}
  href={tab.href}
  style={{ flex: 1, display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
>
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? 'var(--blue)' : 'var(--fg4)',
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.03em',
                }}
              >
                <Icon size={22} />
                {tab.label}
              </button>
            </Link>
          )
        })}

        <button
          onClick={onPrismClick}
          style={{
            flex: 1, display: 'flex', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            backgroundColor: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}>
            <Plus size={20} />
          </div>
        </button>

        {rightTabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          return (
            <Link
  key={tab.href}
  href={tab.href}
  style={{ flex: 1, display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
>
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? 'var(--blue)' : 'var(--fg4)',
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.03em',
                }}
              >
                <Icon size={22} />
                {tab.label}
              </button>
            </Link>
          )
        })}
      </nav>

      <style>{`
        .bottom-nav { display: none; }
      
        @media (max-width: 768px) {
          .bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}