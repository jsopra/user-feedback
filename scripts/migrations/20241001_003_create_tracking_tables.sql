-- Tabelas de tracking de exposures e hits
CREATE TABLE IF NOT EXISTS survey_exposures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    route VARCHAR(500),
    device VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    custom_params JSONB DEFAULT '{}'::jsonb,
    trigger_mode TEXT DEFAULT 'time',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (survey_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_exposures_survey_id ON survey_exposures(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_session_id ON survey_exposures(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_created_at ON survey_exposures(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_device ON survey_exposures(device);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_trigger_mode ON survey_exposures(trigger_mode);

COMMENT ON COLUMN survey_exposures.custom_params IS 'Parâmetros customizados passados pelo site externo (userId, pedidoId, etc).';
COMMENT ON COLUMN survey_exposures.trigger_mode IS 'Modo de disparo: time (delay) ou event (JavaScript).';

CREATE TABLE IF NOT EXISTS survey_hits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    route VARCHAR(500),
    device VARCHAR(50),
    user_agent TEXT,
    custom_params JSONB DEFAULT '{}'::jsonb,
    trigger_mode TEXT DEFAULT 'time',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_hits_survey_id ON survey_hits(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_hits_created_at ON survey_hits(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_hits_device ON survey_hits(device);
