-- Adicionar coluna device na tabela survey_responses
ALTER TABLE survey_responses ADD COLUMN device TEXT;

-- Atualizar registros existentes com base no user_agent
UPDATE survey_responses 
SET device = CASE 
  WHEN user_agent ~* 'iPad|Android.*Tablet|Kindle|PlayBook|Silk' THEN 'tablet'
  WHEN user_agent ~* 'Mobile|Android|iPhone|iPod|BlackBerry|Opera Mini|IEMobile' THEN 'mobile'
  ELSE 'desktop'
END
WHERE device IS NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_device ON survey_responses(survey_id, device);
