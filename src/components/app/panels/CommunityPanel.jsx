import { useState } from 'react'

const TABS = ['팔로잉', '인기', '추천']

const POSTS = [
  {
    id: 1,
    avatar: '박',
    avatarBg: 'var(--prism)',
    author: '박금융',
    badge: '👑',
    date: '2시간 전',
    title: '기준금리 동결, PB 입장에서 본 고객 상담 포인트',
    body: '오늘 금통위 결정을 보고 PB 직무 관점으로 정리해봤어요. 단기 정기예금 매력이 유지되는 시점이라 고객 이탈 방어 전략이 중요할 것 같습니다.',
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    avatar: '이',
    avatarBg: 'var(--green)',
    author: '이취준',
    badge: null,
    date: '5시간 전',
    title: 'NIM 하락세와 은행 수익성 — 리스크 직무 시각으로',
    body: '순이자마진이 줄어드는 환경에서 리스크 관리 부서는 어떤 역할을 할까요? 충당금 적립 기준과 포트폴리오 재편 관점에서 분석해봤습니다.',
    likes: 17,
    comments: 5,
  },
  {
    id: 3,
    avatar: '최',
    avatarBg: 'var(--orange)',
    author: '최합격',
    badge: null,
    date: '1일 전',
    title: '국민은행 디지털 혁신 방향과 IT 직무 지원 전략',
    body: '국민은행의 디지털 전환 로드맵을 분석하고, IT 직무 지원자가 어필할 수 있는 포인트를 정리했습니다. 마이데이터와 AI 활용 역량이 핵심이에요.',
    likes: 31,
    comments: 12,
  },
]

export default function CommunityPanel() {
  const [activeTab, setActiveTab] = useState('팔로잉')
  const [liked, setLiked] = useState(new Set())

  function toggleLike(id) {
    setLiked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'16px'}}>커뮤니티</h2>
        <div className="comm-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`comm-tab${activeTab === t ? ' active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {POSTS.map(post => (
        <div key={post.id} className="comm-card">
          <div className="comm-meta">
            <div className="comm-avatar" style={{background: post.avatarBg}}>
              {post.avatar}
            </div>
            <span className="comm-author">
              {post.author}
              {post.badge && <span className="badge-crown"> {post.badge}</span>}
            </span>
            <span className="comm-date">{post.date}</span>
          </div>
          <h4>{post.title}</h4>
          <p>{post.body}</p>
          <div className="comm-actions">
            <button
              className={`comm-act${liked.has(post.id) ? ' liked' : ''}`}
              onClick={() => toggleLike(post.id)}
            >
              {liked.has(post.id) ? '❤️' : '🤍'} {post.likes + (liked.has(post.id) ? 1 : 0)}
            </button>
            <button className="comm-act">
              💬 {post.comments}
            </button>
            <button className="comm-act">
              🔗 공유
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}