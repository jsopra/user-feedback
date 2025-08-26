-- Criar tabela para trackear hits (soft gate aparições)
CREATE TABLE IF NOT EXISTS survey_hits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  route VARCHAR(500),
  device VARCHAR(50),
  user_agent TEXT,
  custom_params JSONB DEFAULT '{}',
  trigger_mode TEXT DEFAULT 'time',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_survey_hits_survey_id ON survey_hits(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_hits_created_at ON survey_hits(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_hits_device ON survey_hits(device);
