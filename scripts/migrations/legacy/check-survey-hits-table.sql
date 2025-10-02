-- Verificar se a tabela survey_hits existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'survey_hits'
);

-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS survey_hits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  route TEXT,
  device VARCHAR(50),
  user_agent TEXT,
  custom_params JSONB DEFAULT '{}',
  trigger_mode VARCHAR(50) DEFAULT 'time',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_survey_hits_survey_id ON survey_hits(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_hits_created_at ON survey_hits(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_hits_device ON survey_hits(device);
