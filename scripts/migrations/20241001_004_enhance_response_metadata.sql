-- Ajustes nas respostas para suportar parâmetros customizados e device info
ALTER TABLE survey_responses
    ADD COLUMN IF NOT EXISTS custom_params JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS trigger_mode TEXT DEFAULT 'time',
    ADD COLUMN IF NOT EXISTS device TEXT,
    ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_survey_responses_trigger_mode ON survey_responses(trigger_mode);
CREATE INDEX IF NOT EXISTS idx_survey_responses_device ON survey_responses(survey_id, device);
CREATE INDEX IF NOT EXISTS idx_survey_responses_is_test ON survey_responses(survey_id, is_test);

COMMENT ON COLUMN survey_responses.custom_params IS 'Parâmetros customizados passados pelo site externo (userId, pedidoId, etc).';
COMMENT ON COLUMN survey_responses.trigger_mode IS 'Modo de disparo: time (delay) ou event (JavaScript).';
COMMENT ON COLUMN survey_responses.is_test IS 'Marca responses de teste/desenvolvimento para exclusão das análises oficiais.';

ALTER TABLE survey_exposures
    ADD COLUMN IF NOT EXISTS custom_params JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS trigger_mode TEXT DEFAULT 'time';

CREATE INDEX IF NOT EXISTS idx_survey_exposures_trigger_mode ON survey_exposures(trigger_mode);

UPDATE survey_responses
SET device = CASE
        WHEN user_agent ~* 'iPad|Android.*Tablet|Kindle|PlayBook|Silk' THEN 'tablet'
        WHEN user_agent ~* 'Mobile|Android|iPhone|iPod|BlackBerry|Opera Mini|IEMobile' THEN 'mobile'
        ELSE 'desktop'
    END
WHERE device IS NULL AND user_agent IS NOT NULL;
