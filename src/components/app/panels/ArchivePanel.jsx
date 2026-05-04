import { useState } from 'react'
import Chip from '../../shared/Chip.jsx'
import Dropdown from '../../shared/Dropdown.jsx'
import { JOBS, BANKS } from '../../../data/constants.js'

const ARC_FILTERS = ['전체', '카드뉴스', '기사', '자기이해']

export default function ArchivePanel({ setActivePanel }) {
  const [arcFilter, setArcFilter] = useState('전체')
  const [jobFilter, setJobFilter] = useState('전체')
  const [bankFilter, setBankFilter] = useState('전체')

  const arcCards = [
    {
      tag: '프리즘',
      tagColor: 'var(--blue)',
      tagBg: 'var(--blue-light)',
      date: '2026.05.03',
      title: '기준금리 동결이 PB 업무에 미치는 영향',
      desc: '금리 동결 결정이 고액 자산가 포트폴리오 재편에 어떤 기회를 만드는지 분석했습니다.',
    },
    {
      tag: '자기이해',
      tagColor: 'var(--prism)',
      tagBg: 'var(--prism-light)',
      date: '2026.05.01',
      title: '내가 PB를 선택한 이유와 10년 후 모습',
      desc: '자기이해 질문 #45에 대한 답변. 고객 신뢰 구축과 장기 자산 성장을 돕는 금융 파트너.',
    },
    {
      tag: '이슈',
      tagColor: 'var(--green)',
      tagBg: 'var(--green-light)',
      date: '2026.04.29',
      title: '머니무브 심화가 은행 수신 전략에 주는 시사점',
      desc: '카카오뱅크 수신 잔액 증가와 시중은행의 대응 전략을 리스크 관점에서 정리.',
    },
    {
      tag: '워밍업',
      tagColor: 'var(--orange)',
      tagBg: 'var(--orange-light)',
      date: '2026.04.27',
      title: 'DSR 개념 정리 및 여신 직무 연결',
      desc: '총부채원리금상환비율의 개념과 규제 강화가 여신 심사 업무에 미치는 실질적 영향.',
    },
  ]

  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>기록 아카이브</h2>
        <div className="filter-area">
          <div className="chips-row" style={{marginBottom:0}}>
            {ARC_FILTERS.map(f => (
              <Chip key={f} label={f} selected={arcFilter === f} onClick={() => setArcFilter(f)} />
            ))}
          </div>
          <Dropdown
            label="직무"
            options={['전체', ...JOBS]}
            value={jobFilter}
            onChange={setJobFilter}
          />
          <Dropdown
            label="은행"
            options={['전체', ...BANKS]}
            value={bankFilter}
            onChange={setBankFilter}
          />
        </div>
      </div>
      <div className="card-grid card-grid-2">
        {arcCards.map((c, i) => (
          <div key={i} className="arc-card">
            <div className="arc-meta">
              <span
                className="tag"
                style={{background: c.tagBg, color: c.tagColor}}
              >
                {c.tag}
              </span>
              <span className="arc-date">{c.date}</span>
            </div>
            <h4>{c.title}</h4>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}