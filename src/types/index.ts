export type UserProfile = {
  id: string
  nickname: string
  job_field: string
  target_company: string
  industry: string
  target_date: string
  created_at: string
}

export type PrismType = 'cardnews' | 'article' | 'self'
export type PerspectiveType = 'job' | 'company' | 'industry' | 'none'

export type Prism = {
  id: string
  user_id: string
  type: PrismType
  content_id: string
  content_title: string
  perspective: PerspectiveType
  body: string
  created_at: string
}

export type CardNews = {
  id: string
  title: string
  keywords: string[]
  cards: { order: number; image_url: string; caption?: string }[]
  published_at: string
  category: string
}

export type Article = {
  id: string
  source: string
  title: string
  summary: string
  url: string
  published_at: string
  category: string
}

export type Question = {
  id: string
  category:
    | 'values'
    | 'career'
    | 'strength'
    | 'experience'
    | 'reason'
    | 'growth'
    | 'relationship'
    | 'future'
  main_question: string
  sub_question: string
  resume_examples: string[]
  interview_examples: string[]
}
