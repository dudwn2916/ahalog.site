'use client'

import BottomNav from '@/components/ui/BottomNav'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const sections = [
  {
    title: '제1조 (수집하는 개인정보 항목 및 수집 방법)',
    content: `■ 수집 항목

① 회원가입 시 (이메일)
• 필수: 이메일 주소, 닉네임

② 회원가입 시 (Google 소셜 로그인)
• 필수: 이메일 주소, 닉네임 (Google 계정에서 제공)

③ 온보딩 시
• 필수: 관심 직무·기업·산업, 취업 목표 시기
• 선택: 알림 설정 (시간·항목)

④ 서비스 이용 시 자동 생성
• 프리즘 작성 기록, 서비스 이용 일시, 접속 로그

■ 수집 방법
• 서비스 가입 및 이용 과정에서 이용자가 직접 입력
• 소셜 로그인 시 해당 플랫폼으로부터 제공`,
  },
  {
    title: '제2조 (개인정보의 수집 및 이용 목적)',
    content: `회사는 수집한 개인정보를 다음 목적으로 이용합니다.

• 서비스 제공: 회원 식별, 콘텐츠 제공, 프리즘 저장·관리, 맞춤 질문 배분
• 서비스 개선: 이용 통계 분석, 오류 개선, 신규 기능 개발
• 고객 지원: 문의 응대, 공지사항 전달
• 알림 발송: 회원이 설정한 알림 시간에 맞춘 콘텐츠 알림`,
  },
  {
    title: '제3조 (개인정보의 보유 및 이용 기간)',
    content: `• 회사는 회원이 서비스를 이용하는 동안 개인정보를 보유하며, 탈퇴 시 즉시 파기합니다.
• 단, 관련 법령에 의해 보존 의무가 있는 정보는 아래와 같이 보관합니다.

계약·청약철회 등 기록 → 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)
접속 로그 → 3개월 (통신비밀보호법)`,
  },
  {
    title: '제4조 (개인정보의 제3자 제공)',
    content: `• 회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
• 단, 다음 경우에는 예외로 합니다.
  - 이용자가 사전에 동의한 경우
  - 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`,
  },
  {
    title: '제5조 (개인정보 처리 위탁)',
    content: `회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.

• Supabase (미국) — 데이터베이스 저장 및 인증 처리 · 회원 탈퇴 시까지
• Vercel (미국) — 서비스 호스팅 및 배포 · 서비스 이용 기간
• Google LLC (미국) — 소셜 로그인 인증 · Google 정책에 따름

※ Supabase, Vercel, Google은 미국 소재 업체로, 국외 이전에 해당합니다. 각 업체는 개인정보 보호 관련 국제 기준을 준수합니다.`,
  },
  {
    title: '제6조 (이용자의 권리)',
    content: `이용자는 회사에 대해 언제든지 다음 각 호의 권리를 행사할 수 있습니다.

• 개인정보 열람 요구
• 오류 등이 있을 경우 정정 요구
• 삭제 요구
• 처리 정지 요구

권리 행사는 서비스 내 마이페이지 또는 개인정보 보호책임자에게 이메일로 요청할 수 있으며, 회사는 지체 없이 조치합니다.`,
  },
  {
    title: '제7조 (개인정보의 파기)',
    content: `• 회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.
• 전자적 파일 형태로 저장된 개인정보는 복구 및 재생이 불가능한 방법으로 삭제합니다.`,
  },
  {
    title: '제8조 (개인정보 보호를 위한 기술적·관리적 조치)',
    content: `• 비밀번호 암호화: 회원 비밀번호는 단방향 암호화 저장
• 접근 제한: 개인정보를 처리하는 데이터베이스에 대한 접근 권한 최소화
• 보안 전송: HTTPS를 통한 암호화 전송
• 최소 수집: 서비스 제공에 필요한 최소한의 개인정보만 수집`,
  },
  {
    title: '제9조 (개인정보 보호책임자)',
    content: `회사는 개인정보 처리에 관한 업무를 총괄하고 이용자의 개인정보 관련 민원을 처리하기 위해 개인정보 보호책임자를 지정합니다.

개인정보 관련 문의는 서비스 내 문의 채널로 접수하며, 신속하게 답변드리겠습니다.`,
  },
  {
    title: '제10조 (개인정보처리방침의 변경)',
    content: `• 이 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가·삭제 및 정정이 있는 경우에는 변경 사항의 시행 7일 전부터 공지사항을 통해 고지합니다.`,
  },
]

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>개인정보처리방침</h1>
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
