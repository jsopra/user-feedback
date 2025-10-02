-- Adiciona coluna para marcar responses como teste
ALTER TABLE survey_responses 
ADD COLUMN is_test BOOLEAN DEFAULT FALSE;

-- Índice para performance em queries filtradas
CREATE INDEX idx_survey_responses_is_test ON survey_responses(survey_id, is_test);

-- Comentário para documentação
COMMENT ON COLUMN survey_responses.is_test IS 'Flag para marcar responses como teste/desenvolvimento, excluindo-as da análise principal';
