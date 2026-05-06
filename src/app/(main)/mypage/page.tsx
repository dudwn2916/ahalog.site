'use client';

import { useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import PrismModal from '@/components/ui/PrismModal';

export default function MyPage() {
  const [showPrismModal, setShowPrismModal] = useState(false);

  return (
    <>
      {/* 페이지 콘텐츠 */}
      
      <BottomNav onPrismClick={() => setShowPrismModal(true)} />
      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
    </>
  );
}