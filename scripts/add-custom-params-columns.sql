-- Adicionar colunas para parâmetros customizados e modo de disparo
ALTER TABLE survey_exposures 
ADD COLUMN custom_params JSONB,
ADD COLUMN trigger_mode TEXT DEFAULT 'time';

ALTER TABLE survey_responses 
ADD COLUMN custom_params JSONB,
ADD COLUMN trigger_mode TEXT DEFAULT 'time';

-- Adicionar índices para performance
CREATE INDEX idx_survey_exposures_trigger_mode ON survey_exposures(trigger_mode);
CREATE INDEX idx_survey_responses_trigger_mode ON survey_responses(trigger_mode);

-- Comentários para documentação
COMMENT ON COLUMN survey_exposures.custom_params IS 'Parâmetros customizados passados pelo site externo (userId, pedidoId, etc)';
COMMENT ON COLUMN survey_exposures.trigger_mode IS 'Modo de disparo: time (delay) ou event (JavaScript)';
COMMENT ON COLUMN survey_responses.custom_params IS 'Parâmetros customizados passados pelo site externo (userId, pedidoId, etc)';
COMMENT ON COLUMN survey_responses.trigger_mode IS 'Modo de disparo: time (delay) ou event (JavaScript)';
