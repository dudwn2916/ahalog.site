import { z } from 'zod'

export const authFormSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해 주세요.'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .max(72, '비밀번호는 72자 이하여야 합니다.'),
})

export type AuthFormValues = z.infer<typeof authFormSchema>

export function sanitizeNextPath(next: string | null | undefined, fallback = '/home') {
  if (!next || !next.startsWith('/')) {
    return fallback
  }

  return next
}

export function getOAuthRedirectTo(next = '/home') {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  return `${base}/api/auth/callback?next=${encodeURIComponent(next)}`
}
