import { useState } from 'react'
import Chip from '../../shared/Chip.jsx'

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'warmup', label: '워밍업' },
  { id: 'issue', label: '이슈' },
  { id: 'question', label: '자기이해' },
]

export default function AllPanel({ setActivePanel }) {
  const [filter, setFilter] = useState('all')

  const show = type => filter === 'all' || filter === type

  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>전체보기</h2>
        <div className="chips-row">
          {FILTERS.map(f => (
            <Chip key={f.id} label={f.label} selected={filter === f.id} onClick={() => setFilter(f.id)} />
          ))}
        </div>
      </div>

      {show('warmup') && (
        <div style={{marginBottom:'32px'}}>
          <div className="sec-head">
            <h3>📰 인사이트 워밍업</h3>
          </div>
          <div className="card-grid card-grid-2">
            <div className="issue-content-card">
              <div className="ic-header dark">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.6}}>2026.05.04 · EPS</span>
              </div>
              <div className="ic-body">
                <div className="term-word">EPS</div>
                <div className="term-eng">Earnings Per Share · 주당순이익</div>
                <p>기업의 당기순이익을 발행 주식 수로 나눈 값으로, 주주 1주당 얼마의 이익이 귀속되는지를 나타냅니다.</p>
              </div>
            </div>
            <div className="issue-content-card">
              <div className="ic-header dark">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.6}}>2026.05.03 · NIM</span>
              </div>
              <div className="ic-body">
                <div className="term-word">NIM</div>
                <div className="term-eng">Net Interest Margin · 순이자마진</div>
                <p>은행의 이자수익과 이자비용의 차이를 이자수익 자산으로 나눈 수익성 지표입니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {show('issue') && (
        <div style={{marginBottom:'32px'}}>
          <div className="sec-head">
            <h3>🌍 세상 한 조각</h3>
          </div>
          <div className="card-grid card-grid-2">
            <div className="issue-content-card">
              <div className="ic-header blue">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>2026.05.04 · 거시경제</span>
              </div>
              <div className="ic-body">
                <h3>한국은행 기준금리 2.75% 동결</h3>
                <p>금통위, 글로벌 불확실성과 국내 경기를 동시에 고려해 동결 결정. 하반기 인하 가능성 열어 둬.</p>
              </div>
            </div>
            <div className="issue-content-card">
              <div className="ic-header blue">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>2026.05.03 · 디지털금융</span>
              </div>
              <div className="ic-body">
                <h3>머니무브 가속화, 은행권 수신 경쟁 치열</h3>
                <p>고금리 특판 상품 출시 경쟁 심화. 카카오뱅크, 토스뱅크 수신 잔액 사상 최대 기록.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {show('question') && (
        <div style={{marginBottom:'32px'}}>
          <div className="sec-head">
            <h3>🤔 나를 만드는 질문</h3>
          </div>
          <div className="card-grid card-grid-2">
            <div className="issue-content-card">
              <div className="ic-header purple">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>자기이해 #47</span>
              </div>
              <div className="ic-body">
                <h3>당신이 은행에서 꼭 이루고 싶은 것은?</h3>
                <p>목표를 위해 지금 어떤 준비를 하고 있나요? 구체적인 직무·고객·수치로 답해보세요.</p>
              </div>
            </div>
            <div className="issue-content-card">
              <div className="ic-header purple">
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>자기이해 #46</span>
              </div>
              <div className="ic-body">
                <h3>나만의 강점을 직무에 연결한다면?</h3>
                <p>지원 직무에서 나의 강점이 어떻게 발휘될 수 있는지 구체적인 사례와 함께 작성해 보세요.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}