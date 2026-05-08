'use client'

import BottomNav from '@/components/ui/BottomNav'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const sections = [
  {
    title: '제1조 (목적)',
    content: `이 약관은 회사가 운영하는 AHALOGUE 서비스의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: '제2조 (정의)',
    content: `이 약관에서 사용하는 용어의 정의는 다음과 같습니다.

• '서비스'란 AHALOGUE 웹사이트 및 그와 관련된 모든 기능을 의미합니다.
• '이용자'란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.
• '회원'이란 서비스에 가입하여 이용자 아이디(ID)를 부여받은 자를 말합니다.
• '프리즘'이란 회원이 카드뉴스·기사·자기이해 질문에 대해 작성하는 자신만의 인사이트 기록을 말합니다.
• '콘텐츠'란 회사가 서비스 내에서 제공하는 카드뉴스, 큐레이션 기사, 자기이해 질문 등 모든 정보를 말합니다.`,
  },
  {
    title: '제3조 (약관의 게시 및 개정)',
    content: `• 회사는 이 약관의 내용을 서비스 초기 화면 또는 연결 화면을 통해 게시합니다.
• 회사는 관련 법령을 위반하지 않는 범위 내에서 이 약관을 개정할 수 있습니다.
• 약관을 개정할 경우 적용 일자 및 개정 사유를 명시하여 현행 약관과 함께 서비스 내 공지사항을 통해 그 적용 일자 7일 이전부터 공지합니다.
• 회원이 개정 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있습니다.`,
  },
  {
    title: '제4조 (서비스 이용 자격)',
    content: `• 서비스는 만 14세 이상인 자에 한하여 가입할 수 있습니다.
• 회사는 다음 각 호에 해당하는 경우 이용 신청을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.
  - 타인의 명의를 도용한 경우
  - 허위 정보를 기재한 경우
  - 이전에 약관 위반으로 이용이 제한된 경우`,
  },
  {
    title: '제5조 (서비스의 제공 및 변경)',
    content: `• 회사가 제공하는 서비스는 다음과 같습니다.
  - 산업 인사이트 훈련 (카드뉴스, 기사 큐레이션, 프리즘 작성)
  - 자기이해 기록 (AI 매일 질문, 프리즘 아카이브)
  - 성장 지표 및 배지 시스템
  - 기타 회사가 정하는 서비스
• 회사는 서비스의 내용·품질 향상을 위해 서비스를 변경할 수 있으며, 변경 내용과 적용 일자를 사전 공지합니다.
• 서비스는 연중무휴 24시간 제공을 원칙으로 하되, 시스템 점검·장애 등의 경우 일시 중단될 수 있습니다.`,
  },
  {
    title: '제6조 (회원 계정 및 비밀번호)',
    content: `• 회원은 이메일 또는 소셜 로그인(Google)을 통해 계정을 생성할 수 있습니다.
• 회원은 자신의 계정 보안을 위해 비밀번호를 관리할 책임이 있습니다.
• 회원은 계정을 타인에게 양도·대여할 수 없습니다.
• 계정 도용 또는 부정 사용을 인지한 경우 즉시 회사에 통보해야 합니다.`,
  },
  {
    title: '제7조 (이용자의 의무)',
    content: `회원은 다음 각 호에 해당하는 행위를 해서는 안 됩니다.

• 타인의 정보 도용 또는 허위 정보 등록
• 회사 서비스의 정상적인 운영을 방해하는 행위
• 서비스에서 얻은 정보를 회사의 사전 승낙 없이 복제·유포·출판하는 행위
• 타인의 명예를 훼손하거나 불이익을 주는 행위
• 저작권 등 지적재산권을 침해하는 행위
• 기타 관련 법령에 위반되는 행위`,
  },
  {
    title: '제8조 (콘텐츠 저작권)',
    content: `• 회사가 제공하는 카드뉴스, 큐레이션 기사 요약, 자기이해 질문 등 모든 콘텐츠의 저작권은 회사 또는 해당 저작권자에게 귀속됩니다.
• 회원이 작성한 프리즘(인사이트 기록)의 저작권은 해당 회원에게 귀속됩니다. 단, 회원은 회사에게 다음 목적으로 프리즘을 활용할 수 있는 비독점적·무상 라이선스를 부여합니다.
  ① 서비스 기능 제공 및 개선
  ② 익명화된 통계 분석
  ③ 서비스 내 AI 기능 제공을 위한 분석
  ④ 서비스 홍보 목적의 익명화된 사례 활용 (회원이 거부 의사를 표시한 경우 제외)
• 회원은 서비스 내 콘텐츠를 서비스 이용 목적 외로 사용·복제·배포할 수 없습니다.`,
  },
  {
    title: '제9조 (서비스 이용 제한)',
    content: `• 회사는 회원이 제7조를 위반한 경우 경고·일시 정지·영구 이용 정지 등의 조치를 취할 수 있습니다.
• 회원은 이의 신청을 할 수 있으며, 회사는 정당한 이의 신청에 대해 서비스 이용을 재개합니다.`,
  },
  {
    title: '제10조 (회원 탈퇴 및 계약 해지)',
    content: `• 회원은 언제든지 서비스 내 마이페이지에서 탈퇴를 신청할 수 있습니다.
• 탈퇴 즉시 회원의 모든 데이터는 삭제되며, 삭제된 데이터는 복구되지 않습니다.
• 단, 관련 법령에 의해 보존 의무가 있는 정보는 법령이 정한 기간 동안 보관됩니다.`,
  },
  {
    title: '제11조 (책임 제한)',
    content: `• 회사는 천재지변, 전쟁, 서비스 서버의 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.
• 회사는 회원이 서비스를 이용하여 취업에 성공할 것을 보장하지 않습니다. 서비스는 학습 도구로서 제공됩니다.
• 회사는 서비스 내 외부 링크(기사 원문 등)의 내용에 대해 책임을 지지 않습니다.`,
  },
  {
    title: '제12조 (분쟁 해결)',
    content: `• 이 약관은 대한민국 법률에 따라 해석되고 적용됩니다.
• 서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 성실히 협의하여 해결합니다.
• 협의가 이루어지지 않는 경우 관할 법원은 민사소송법에 따릅니다.`,
  },
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f8',
      fontFamily: "'Pretendard JP','Pretendard','Noto Sans KR',-apple-system,sans-serif",
    }}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 80px' }}>

        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,247,248,0.92)', backdropFilter: 'blur(12px)',
          padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
            <ChevronLeft size={22} color="#0a0a0a" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>이용약관</h1>
        </div>

        <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* 시행일 */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '16px 20px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>시행일: 2026년 5월 6일 · Beta v0.1</p>
          </div>

          {/* 섹션들 */}
          {sections.map(section => (
            <div key={section.title} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '20px',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', margin: '0 0 10px' }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                {section.content}
              </p>
            </div>
          ))}

          {/* 하단 */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4e4e4', padding: '16px 20px', marginTop: 8 }}>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.7 }}>
              AHALOGUE · Beta v0.1 · 시행일 2026년 5월 6일
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
