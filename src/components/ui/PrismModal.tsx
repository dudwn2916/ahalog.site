'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PrismModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  // 오늘 날짜 기준 콘텐츠 ID 미리 조회
  const [contentIds, setContentIds] = useState<Record<string, string>>({})
  const [routineTypes, setRoutineTypes] = useState<string[]>([])
  const [completedTypes, setCompletedTypes] = useState<string[]>([])

  useEffect(() => {
    async function loadContents() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().slice(0, 10)

      // 유저 진행도 + 오늘 기사 병렬 조회
      const [{ data: userData }, { data: cardContents }, { data: selfContents }, { data: articleContents }] =
        await Promise.all([
          supabase.from('users').select('card_progress, self_progress, routine').eq('id', user.id).single(),
          supabase.from('contents').select('id').eq('type', 'card').order('published_at', { ascending: true }),
          supabase.from('contents').select('id').eq('type', 'question').order('published_at', { ascending: true }),
          supabase.from('contents').select('id').eq('type', 'article').lte('published_at', today).order('published_at', { ascending: false }),
        ])

      if (!userData) return

      const cardProgress = userData.card_progress ?? 0
      const selfProgress = userData.self_progress ?? 0

      const map: Record<string, string> = {}

      // 카드뉴스 — 진행도 기반
      if (cardContents && cardContents.length > 0) {
        const idx = cardProgress % cardContents.length
        map['card'] = cardContents[idx].id
      }

      // 자기이해 질문 — 진행도 기반
      if (selfContents && selfContents.length > 0) {
        const idx = selfProgress % selfContents.length
        map['self'] = selfContents[idx].id
      }

      // 기사 — 오늘 기준 최신
      if (articleContents && articleContents.length > 0) {
        map['opinion'] = articleContents[0].id
      }

      setContentIds(map)

      // 오늘 요일 (0=일,1=월,...6=토)
      const todayDate = new Date()
      const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][todayDate.getDay()]

      // users 테이블에서 routine jsonb 조회
      const todayRoutine = userData.routine?.[dayKey]?.types ?? []
      setRoutineTypes(todayRoutine)

      // 오늘 완료한 prisms type 조회
      const todayStr = todayDate.toISOString().slice(0, 10)
      const { data: todayPrisms } = await supabase
        .from('prisms')
        .select('type')
        .eq('user_id', user.id)
        .gte('created_at', todayStr + 'T00:00:00')
        .lte('created_at', todayStr + 'T23:59:59')

      const completed = Array.from(new Set((todayPrisms ?? []).map((p: { type: string }) => p.type)))
      setCompletedTypes(completed)
    }
    loadContents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const options = [
    { type: 'card', icon: '✦', label: '인사이트 워밍업', desc: '오늘의 단어·개념을 내 것으로', bg: '#17171a' },
    { type: 'opinion',  icon: '📰', label: '세상 한 조각',    desc: '오늘의 이슈에 나의 생각 더하기', bg: '#0066ff' },
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
              onClick={() => {
                const contentId = contentIds[opt.type]
                const routineTypesQuery = routineTypes.join(',')
                const completedTypesQuery = completedTypes.join(',')
                const url = contentId
                  ? `/prism/write?type=${opt.type}&contentId=${contentId}&routineTypes=${routineTypesQuery}&completedTypes=${completedTypesQuery}`
                  : `/prism/write?type=${opt.type}&routineTypes=${routineTypesQuery}&completedTypes=${completedTypesQuery}`
                router.push(url)
                onClose()
              }}
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