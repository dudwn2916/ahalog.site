import { useState } from 'react'
import { JOBS, BANKS, SEASONS } from '../../data/constants.js'
import { useProfile } from '../../hooks/useProfile'

export default function UserSetup({ userId }) {
  const { updateProfile } = useProfile(userId)
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [selectedJobs, setSelectedJobs] = useState(new Set())
  const [selectedBanks, setSelectedBanks] = useState(new Set())
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function toggleJob(j) {
    setSelectedJobs(prev => {
      const next = new Set(prev)
      next.has(j) ? next.delete(j) : next.add(j)
      return next
    })
  }

  function toggleBank(b) {
    setSelectedBanks(prev => {
      const next = new Set(prev)
      next.has(b) ? next.delete(b) : next.add(b)
      return next
    })
  }

  function nextStep() {
    setStep(s => s + 1)
  }

  function prevStep() {
    setStep(s => s - 1)
  }

  async function handleComplete() {
    setLoading(true)
    setError(null)
    try {
      await updateProfile({
        nickname,
        jobs: Array.from(selectedJobs),
        banks: Array.from(selectedBanks),
        target_season: selectedSeason,
        notif_enabled: notifEnabled,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-setup-overlay">
      <div className="us-wrap">
        <div className="us-progress" style={step === 5 ? { display: 'none' } : {}}>
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className={`us-prog-dot${n < step ? ' done' : n === step ? ' active' : ''}`}
            />
          ))}
        </div>

        {/* Step 1: Nickname */}
        <div className={`us-step${step === 1 ? ' active' : ''}`}>
          <div className="us-eyebrow">STEP 1</div>
          <h2 className="us-title">만나서 반가워요!<br />닉네임을 설정해 주세요.</h2>
          <p className="us-desc">커뮤니티와 프로필에 표시될 이름을 입력해 주세요.</p>
          <div className="us-field">
            <label>닉네임</label>
            <input
              type="text"
              placeholder="예: 금융왕최준"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>
          <div className="us-bottom-row">
            <span />
            <button className="us-primary-btn" onClick={nextStep}>다음 →</button>
          </div>
        </div>

        {/* Step 2: Jobs & Banks */}
        <div className={`us-step${step === 2 ? ' active' : ''}`}>
          <div className="us-eyebrow">STEP 2</div>
          <h2 className="us-title">관심 직무와 기업을<br />선택해 주세요.</h2>
          <p className="us-desc">맞춤형 콘텐츠를 제공해 드립니다. 복수 선택 가능합니다.</p>
          <div className="us-chips-group">
            <h4>관심 직무</h4>
            <div className="us-chips">
              {JOBS.map(j => (
                <button
                  key={j}
                  className={`us-chip${selectedJobs.has(j) ? ' selected' : ''}`}
                  onClick={() => toggleJob(j)}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div className="us-chips-group">
            <h4>관심 은행</h4>
            <div className="us-chips">
              {BANKS.map(b => (
                <button
                  key={b}
                  className={`us-chip${selectedBanks.has(b) ? ' selected' : ''}`}
                  onClick={() => toggleBank(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="us-bottom-row">
            <button className="us-back-btn" onClick={prevStep}>← 이전</button>
            <button className="us-primary-btn" onClick={nextStep}>다음 →</button>
          </div>
        </div>

        {/* Step 3: Target season */}
        <div className={`us-step${step === 3 ? ' active' : ''}`}>
          <div className="us-eyebrow">STEP 3</div>
          <h2 className="us-title">목표 채용 시즌을<br />선택해 주세요.</h2>
          <p className="us-desc">준비 일정에 맞는 콘텐츠와 포트폴리오 관리를 도와드립니다.</p>
          <div className="us-season-grid">
            {SEASONS.map(s => {
              const key = `${s.year}-${s.label}`
              return (
                <div
                  key={key}
                  className={`us-season-card${selectedSeason === key ? ' selected' : ''}`}
                  onClick={() => setSelectedSeason(key)}
                >
                  <div className="sc-year">{s.year || ' '}</div>
                  <div className="sc-label">{s.label}</div>
                </div>
              )
            })}
          </div>
          <div className="us-bottom-row">
            <button className="us-back-btn" onClick={prevStep}>← 이전</button>
            <button className="us-primary-btn" onClick={nextStep}>다음 →</button>
          </div>
        </div>

        {/* Step 4: Notifications */}
        <div className={`us-step${step === 4 ? ' active' : ''}`}>
          <div className="us-eyebrow">STEP 4</div>
          <h2 className="us-title">매일 알림을 받아<br />루틴을 유지하세요.</h2>
          <p className="us-desc">매일 아침 오늘의 금융 이슈와 학습 알림을 보내드립니다.</p>
          <div className="us-notif-box">
            <div className="us-notif-icon">🔔</div>
            <h4>학습 알림 설정</h4>
            <p>
              매일 오전 8시, 오늘의 금융 이슈와<br />
              프리즘 작성 알림을 보내드립니다.
            </p>
            <button
              className={`us-notif-btn${notifEnabled ? ' enabled' : ''}`}
              onClick={() => setNotifEnabled(true)}
            >
              {notifEnabled ? '✓ 알림이 설정되었습니다' : '🔔 알림 켜기'}
            </button>
          </div>
          <button className="us-skip-link" onClick={nextStep}>나중에 설정하기</button>
          <div className="us-bottom-row">
            <button className="us-back-btn" onClick={prevStep}>← 이전</button>
            <button className="us-primary-btn" onClick={nextStep}>완료 →</button>
          </div>
        </div>

        {/* Step 5: Done */}
        <div className={`us-step${step === 5 ? ' active' : ''}`}>
          {error && <div style={{ color: '#ff4242', fontSize: '12px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          <div className="us-done-box">
            <div className="us-done-icon">🎉</div>
            <h2 className="us-done-title">준비 완료!</h2>
            <p className="us-done-desc">
              {nickname || '취준생'}님, AHALOGUE에 오신 것을 환영합니다.<br />
              오늘부터 매일 한 조각씩, 금융의 언어를 내 것으로 만들어 가세요.
            </p>
            <button className="us-next-btn" onClick={handleComplete} disabled={loading}>
              {loading ? '저장 중...' : '첫 번째 프리즘 작성하러 가기 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}