import { NAV_TABS } from '../../data/constants.js'

const NAV_PANEL_IDS = ['home', 'all', 'portfolio', 'archive', 'community']

export default function AppNav({ activePanel, setActivePanel }) {
  const activeTabId = NAV_PANEL_IDS.includes(activePanel) ? activePanel : null

  return (
    <nav className="app-nav">
      <button className="app-nav-logo" onClick={() => setActivePanel('home')}>
        <img src="../../assets/mark_logo.png" alt="AHALOGUE" style={{width:22,height:22,objectFit:'contain'}} />
        AHALOGUE
      </button>
      <div className="app-nav-tabs">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            className={`app-nav-tab${activeTabId === tab.id ? ' active' : ''}`}
            onClick={() => setActivePanel(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="app-nav-right">
        <button className="app-icon-btn" onClick={() => setActivePanel('notif')} title="알림">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button className="app-avatar" onClick={() => setActivePanel('mypage')}>김</button>
      </div>
    </nav>
  )
}