const NOTIFS = [
  {
    id: 1,
    read: false,
    title: '오늘의 금융 이슈가 도착했어요!',
    body: '한국은행 기준금리 결정 분석 콘텐츠를 확인해 보세요.',
    time: '방금 전',
  },
  {
    id: 2,
    read: false,
    title: '박금융님이 회원님의 프리즘에 좋아요를 눌렀어요.',
    body: '"기준금리 동결이 PB 업무에 미치는 영향" 게시물',
    time: '1시간 전',
  },
  {
    id: 3,
    read: false,
    title: '12일 연속 학습 중! 🔥',
    body: '오늘도 루틴을 완성하면 새 배지를 획득할 수 있어요.',
    time: '3시간 전',
  },
  {
    id: 4,
    read: true,
    title: '새 커뮤니티 게시물이 있어요.',
    body: '팔로우하는 최합격님이 새 글을 작성했습니다.',
    time: '어제',
  },
  {
    id: 5,
    read: true,
    title: '이번 주 학습 리포트',
    body: '이번 주 5일 학습, 프리즘 3개 작성 완료. 잘 하고 있어요!',
    time: '3일 전',
  },
]

export default function NotifPanel() {
  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <h2 style={{fontSize:'20px',fontWeight:700}}>알림</h2>
      </div>
      {NOTIFS.map(n => (
        <div key={n.id} className="notif-item">
          <div className={`notif-dot${n.read ? ' read' : ''}`} />
          <div className="notif-body">
            <h4>{n.title}</h4>
            <p>{n.body}</p>
          </div>
          <span className="notif-time">{n.time}</span>
        </div>
      ))}
    </div>
  )
}