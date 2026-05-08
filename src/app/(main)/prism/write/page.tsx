'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CardPrism from '../components/CardPrism'
import ArticlePrism from '../components/ArticlePrism'
import SelfPrism from '../components/SelfPrism'

function PrismWriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const rawContentId = searchParams.get('contentId') ?? undefined
  const routineTypesRaw = searchParams.get('routineTypes') ?? ''
  const completedTypesRaw = searchParams.get('completedTypes') ?? ''
  const routineTypes = routineTypesRaw ? routineTypesRaw.split(',') : []
  const completedTypes = completedTypesRaw ? completedTypesRaw.split(',') : []
  const [persistedContentId, setPersistedContentId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (rawContentId) {
      setPersistedContentId(rawContentId)
    }
  }, [rawContentId])

  const contentId = rawContentId ?? persistedContentId

  useEffect(() => {
    console.log('[PrismWrite] params', { type, rawContentId, persistedContentId, contentId })
  }, [type, rawContentId, persistedContentId, contentId])

  const handleClose = () => router.push('/library')
  const handleBack = () => router.back()

  if (type === 'card') return <CardPrism onClose={handleClose} onBack={handleBack} contentId={contentId} routineTypes={routineTypes} completedTypes={completedTypes} />
  if (type === 'opinion') return <ArticlePrism onClose={handleClose} onBack={handleBack} contentId={contentId} routineTypes={routineTypes} completedTypes={completedTypes} />
  if (type === 'self') return <SelfPrism onClose={handleClose} onBack={handleBack} contentId={contentId} routineTypes={routineTypes} completedTypes={completedTypes} />

  // type 없을 때 — 홈으로 리다이렉트
  if (typeof window !== 'undefined') router.replace('/home')
  return null
}

export default function PrismWritePage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
        fontSize: '14px',
        color: '#888',
        background: '#f7f7f8',
      }}>
        불러오는 중...
      </div>
    }>
      <PrismWriteContent />
    </Suspense>
  )
}
