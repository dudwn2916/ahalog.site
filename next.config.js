/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류 무시 (개발 중 임시 설정)
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig