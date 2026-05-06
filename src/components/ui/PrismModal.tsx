'use client';

import { useRouter } from 'next/navigation';

export default function PrismModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const options = [
    { type: 'warmup', icon: '✦', label: '인사이트 워밍업', desc: '오늘의 단어·개념을 내 것으로', bg: '#17171a' },
    { type: 'issue',  icon: '📰', label: '세상 한 조각',    desc: '오늘의 이슈에 나의 생각 더하기', bg: '#0066ff' },
    { type: 'self',   icon: '🪞', label: '자기이해 질문',   desc: '나를 만드는 질문에 답하기', bg: '#5040b0' },
  ];

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
        zIndex: 300, backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 20, padding: '28px 24px',
        width: 360, maxWidth: 'calc(100vw - 32px)',
        zIndex: 301, boxShadow: '0 20px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>프리즘 작성</div>
            <div style={{ fontSize: 12, color: 'var(--fg4)', marginTop: 2 }}>어떤 유형으로 기록할까요?</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)',
            border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => { router.push(`/prism?type=${opt.type}`); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: opt.bg,
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>{opt.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fg4)' }}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}