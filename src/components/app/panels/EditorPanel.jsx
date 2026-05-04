import { useState } from 'react'
import Chip from '../../shared/Chip.jsx'
import { JOBS, BANKS } from '../../../data/constants.js'

export default function EditorPanel({ setActivePanel }) {
  const [content, setContent] = useState('')
  const [selectedJob, setSelectedJob] = useState('PB')
  const [selectedBank, setSelectedBank] = useState('국민은행')
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="editor-wrap">
      <div style={{marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'6px'}}>프리즘 작성</h2>
        <p style={{fontSize:'14px',color:'var(--muted)'}}>오늘의 뉴스를 내 직무 시각으로 해석해 보세요.</p>
      </div>

      <div className="news-snip">
        <div className="ns-label">오늘의 뉴스</div>
        <div className="ns-title">한국은행, 기준금리 2.75% 동결 결정</div>
        <div className="ns-meta">2026.05.04 · 한국경제</div>
      </div>

      <div className="editor-field">
        <label>직무 선택</label>
        <div className="chips-row">
          {JOBS.map(j => (
            <Chip key={j} label={j} selected={selectedJob === j} onClick={() => setSelectedJob(j)} />
          ))}
        </div>
      </div>

      <div className="editor-field">
        <label>관심 은행 선택</label>
        <div className="chips-row">
          {BANKS.map(b => (
            <Chip key={b} label={b} selected={selectedBank === b} onClick={() => setSelectedBank(b)} />
          ))}
        </div>
      </div>

      <div className="editor-field">
        <label>
          나의 프리즘
          <span className="sub">— {selectedJob} 직무 · {selectedBank} 관점</span>
        </label>
        <textarea
          rows={6}
          placeholder={`${selectedBank} ${selectedJob} 직무 관점에서 이 뉴스를 어떻게 해석하시나요? 면접에서 쓸 수 있는 나만의 언어로 작성해 보세요.`}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>

      <div className="hint-toggle">
        <button className="hint-btn" onClick={() => setShowHint(h => !h)}>
          {showHint ? '✕ 힌트 닫기' : '💡 작성 힌트 보기'}
        </button>
      </div>
      <div className={`hint-box${showHint ? ' open' : ''}`}>
        <div className="hint-box-inner">
          <p><strong>프리즘 작성 가이드</strong></p>
          <ul>
            <li>이 뉴스가 {selectedJob} 업무에 어떤 영향을 주나요?</li>
            <li>{selectedBank}의 관련 전략이나 대응 방향은?</li>
            <li>고객(또는 리스크/시스템) 관점에서의 시사점은?</li>
            <li>나라면 어떤 행동을 취할 것인지 한 문장으로 결론 내리기</li>
          </ul>
        </div>
      </div>

      <div className="editor-acts" style={{marginTop:'20px'}}>
        <button className="btn-save" onClick={() => setActivePanel('home')}>저장하기</button>
        <button className="btn-cancel" onClick={() => setActivePanel('home')}>취소</button>
      </div>
    </div>
  )
}