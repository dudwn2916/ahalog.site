-- 기존 테이블 삭제 (처음 설정할 때만)
DROP TABLE IF EXISTS public.prisms CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- profiles 테이블 생성 (사용자 프로필)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  jobs TEXT[] DEFAULT ARRAY[]::TEXT[],
  banks TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_season TEXT,
  notif_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- prisms 테이블 생성 (사용자가 작성한 프리즘)
CREATE TABLE public.prisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  job TEXT,
  bank TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화 (보안)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prisms ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (자신의 데이터만 볼 수 있게)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "prisms_select" ON public.prisms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "prisms_insert" ON public.prisms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성 (검색 속도 향상)
CREATE INDEX idx_prisms_user_id ON public.prisms(user_id);
CREATE INDEX idx_prisms_created_at ON public.prisms(created_at DESC);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();