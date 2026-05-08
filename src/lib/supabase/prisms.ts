import { createClient } from '@/lib/supabase/client'

interface SavePrismParams {
  type: 'card' | 'opinion' | 'self'
  content_id?: string
  title?: string
  body: string
  job_tags: string[]
  company_tags: string[]
  industry_tags?: string[]
  article_url?: string
  article_body?: string
}

export async function savePrism(params: SavePrismParams) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('로그인이 필요합니다.')

  console.log('[savePrism] params:', params)
  const { data, error } = await supabase
    .from('prisms')
    .insert({
    user_id: user.id,
    type: params.type,
    content_id: params.content_id ?? null,
    title: params.title ?? null,
    body: params.body,
      job_tags: params.job_tags,
      company_tags: params.company_tags,
      industry_tags: params.industry_tags ?? [],
      article_url: params.article_url ?? null,
      article_body: params.article_body ?? null,
    })
    .select()
    .single()

    if (error) throw error

    // 카드뉴스·자기이해 저장 시 진행도 +1
    if (params.type === 'card' || params.type === 'self') {
      const progressCol = params.type === 'card' ? 'card_progress' : 'self_progress'
      const { data: userData } = await supabase
      .from('users')
      .select(progressCol)
      .eq('id', user.id)
      .single()

    if (userData) {
      const current = (userData as Record<string, number>)[progressCol] ?? 0
        await supabase
          .from('users')
          .update({ [progressCol]: current + 1 })
          .eq('id', user.id)
      }
    }
  
    return data.id as string
}