import AppNav from './AppNav.jsx'
import AppSidebar from './AppSidebar.jsx'
import HomePanel from './panels/HomePanel.jsx'
import AllPanel from './panels/AllPanel.jsx'
import PortfolioPanel from './panels/PortfolioPanel.jsx'
import ArchivePanel from './panels/ArchivePanel.jsx'
import CommunityPanel from './panels/CommunityPanel.jsx'
import TrackingPanel from './panels/TrackingPanel.jsx'
import EditorPanel from './panels/EditorPanel.jsx'
import NotifPanel from './panels/NotifPanel.jsx'
import MyPagePanel from './panels/MyPagePanel.jsx'

const PANELS = {
  home: HomePanel,
  all: AllPanel,
  portfolio: PortfolioPanel,
  archive: ArchivePanel,
  community: CommunityPanel,
  tracking: TrackingPanel,
  editor: EditorPanel,
  notif: NotifPanel,
  mypage: MyPagePanel,
}

export default function AppShell({ activePanel, setActivePanel, onLogout }) {
  const PanelComponent = PANELS[activePanel] || HomePanel

  return (
    <div id="app" style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <AppNav activePanel={activePanel} setActivePanel={setActivePanel} />
      <div className="app-body">
        <AppSidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        <main className="app-main">
          <PanelComponent setActivePanel={setActivePanel} onLogout={onLogout} />
        </main>
      </div>
    </div>
  )
}