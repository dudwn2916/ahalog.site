'use client';

import { useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import PrismModal from '@/components/ui/PrismModal';

export default function ArchivePage() {
  const [showPrismModal, setShowPrismModal] = useState(false);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#ffffff', borderBottom: '0.5px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--ink)' }}>AHALOGUE</div>
        <button style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg2)' }}>
          🔔
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.02em' }}>프리즘 아카이브</h1>
      </div>
      <BottomNav onPrismClick={() => setShowPrismModal(true)} />
      {showPrismModal && <PrismModal onClose={() => setShowPrismModal(false)} />}
    </div>
  );
}