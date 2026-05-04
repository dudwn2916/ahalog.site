import { useState } from 'react'

export default function HomePanel({ setActivePanel }) {
  const [activeIssueTab, setActiveIssueTab] = useState('warmup')

  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <p style={{fontSize:'13px',color:'var(--muted)',marginBottom:'4px'}}>2026년 5월 4일 월요일</p>
        <h2 style={{fontSize:'22px',fontWeight:700,letterSpacing:'-.3px'}}>
          좋은 아침이에요, 김준비님 👋
        </h2>
        <p style={{fontSize:'14px',color:'var(--muted)',marginTop:'4px'}}>오늘도 한 조각씩 성장해 봐요.</p>
      </div>

      <div className="streak-row">
        <div className="routine-card">
          <div className="routine-header">
            <h3>오늘의 루틴</h3>
            <span style={{fontSize:'13px',color:'var(--muted)'}}>1/3 완료</span>
          </div>
          <div className="routine-steps">
            <div className="routine-step done">
              <span className="r-icon">📰</span>
              <span className="r-label">워밍업 읽기</span>
              <span className="routine-check">✓</span>
            </div>
            <div className="routine-step">
              <span className="r-icon">💎</span>
              <span className="r-label">프리즘 작성</span>
              <span className="routine-num">2</span>
            </div>
            <div className="routine-step">
              <span className="r-icon">🤔</span>
              <span className="r-label">자기이해 질문</span>
              <span className="routine-num">3</span>
            </div>
          </div>
        </div>
        <div className="streak-card">
          <h4>연속 학습</h4>
          <div className="streak-num">12</div>
          <div className="streak-lbl">일째 🔥</div>
          <p>최고 기록: 24일</p>
        </div>
      </div>

      <div style={{marginBottom:'28px'}}>
        <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'14px'}}>오늘의 아하!</h3>
        <div className="issue-tabs-nav">
          <button
            className={`issue-tab-btn${activeIssueTab === 'warmup' ? ' active' : ''}`}
            onClick={() => setActiveIssueTab('warmup')}
          >
            인사이트 워밍업
          </button>
          <button
            className={`issue-tab-btn${activeIssueTab === 'issue' ? ' active' : ''}`}
            onClick={() => setActiveIssueTab('issue')}
          >
            세상 한 조각
          </button>
          <button
            className={`issue-tab-btn${activeIssueTab === 'self' ? ' active' : ''}`}
            onClick={() => setActiveIssueTab('self')}
          >
            나를 만드는 질문
          </button>
        </div>

        {activeIssueTab === 'warmup' && (
          <div className="issue-content-card">
            <div className="ic-header dark">
              <span style={{fontSize:'12px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.6}}>TODAY'S WARMUP</span>
            </div>
            <div className="ic-body">
              <div className="term-word">NIM</div>
              <div className="term-eng">Net Interest Margin · 순이자마진</div>
              <p>
                은행이 대출 등 이자수익 자산에서 얻는 이자수익과 예금 등 이자비용 부채에 지급하는 이자비용의 차이를 이자수익 자산으로 나눈 비율입니다.
              </p>
              <div className="ic-example">
                <div className="ic-example-lbl">PB 관점 예시</div>
                <div className="ic-example-txt">
                  "NIM이 하락하면 은행의 수익성이 악화되어 예금 금리 인하 압력이 생깁니다. 고객 포트폴리오 재조정 시 이 점을 고려해야 합니다."
                </div>
              </div>
            </div>
            <div className="ic-footer">
              <button className="more-btn" onClick={() => setActivePanel('all')}>전체 보기 →</button>
            </div>
          </div>
        )}

        {activeIssueTab === 'issue' && (
          <div className="issue-content-card">
            <div className="ic-header blue">
              <span style={{fontSize:'12px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>TODAY'S ISSUE</span>
            </div>
            <div className="ic-body">
              <h3>한국은행, 기준금리 2.75% 동결 결정</h3>
              <p>
                한국은행 금융통화위원회는 2026년 5월 회의에서 기준금리를 현행 2.75%로 동결했습니다. 글로벌 불확실성과 국내 경기 회복세를 동시에 고려한 결정으로 풀이됩니다.
              </p>
              <div className="ic-example">
                <div className="ic-example-lbl">직무 연결 포인트</div>
                <div className="ic-example-txt">
                  금리 동결 시 여신 포트폴리오 구성 변화, PB 고객 자산 운용 전략에 미치는 영향을 생각해 보세요.
                </div>
              </div>
            </div>
            <div className="ic-footer">
              <button className="more-btn" onClick={() => setActivePanel('editor')}>프리즘 작성 →</button>
            </div>
          </div>
        )}

        {activeIssueTab === 'self' && (
          <div className="issue-content-card">
            <div className="ic-header purple">
              <span style={{fontSize:'12px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',opacity:.85}}>SELF QUESTION</span>
            </div>
            <div className="ic-body">
              <h3>나를 만드는 질문 #47</h3>
              <p>
                당신이 은행에서 꼭 이루고 싶은 한 가지는 무엇인가요? 그 목표를 위해 지금 어떤 준비를 하고 있나요?
              </p>
              <div className="ic-example">
                <div className="ic-example-lbl">작성 TIP</div>
                <div className="ic-example-txt">
                  구체적인 직무·고객·수치로 답하면 면접관의 눈에 확실히 들어옵니다. 3문장 이내로 핵심만 담아보세요.
                </div>
              </div>
            </div>
            <div className="ic-footer">
              <button className="more-btn" onClick={() => setActivePanel('editor')}>답변 작성 →</button>
            </div>
          </div>
        )}
      </div>

      <div className="card-grid card-grid-2">
        <div>
          <div className="sec-head">
            <h3>지난 콘텐츠</h3>
            <a onClick={() => setActivePanel('all')}>전체보기</a>
          </div>
          <div className="list-col">
            {[
              { date: '5.3', text: 'DSR 규제 강화와 가계대출 관리 방향', topic: '여신' },
              { date: '5.2', text: '토스뱅크 흑자 전환의 의미와 인터넷은행 경쟁', topic: '디지털' },
              { date: '5.1', text: 'EPS(주당순이익) 개념과 은행 밸류에이션', topic: '리스크' },
            ].map((item, i) => (
              <div key={i} className="prism-item">
                <div className="pi-meta">
                  <div className="pi-date">{item.date}</div>
                  <div className="pi-text">{item.text}</div>
                  <span className="pi-topic">{item.topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sec-head">
            <h3>최근 기록</h3>
            <a onClick={() => setActivePanel('archive')}>전체보기</a>
          </div>
          <div className="list-col">
            {[
              { date: '5.3', text: '금리 인상 사이클 종료와 PB 전략 변화', topic: 'PB' },
              { date: '5.1', text: '국민은행 디지털 혁신 방향에 대한 나의 시각', topic: 'IT' },
              { date: '4.29', text: '리스크 관리 직무에서 DSR의 역할', topic: '리스크' },
            ].map((item, i) => (
              <div key={i} className="prism-item">
                <div className="pi-meta">
                  <div className="pi-date">{item.date}</div>
                  <div className="pi-text">{item.text}</div>
                  <span className="pi-topic">{item.topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}