-- Criar tabela de exposures para tracking de visualizações
CREATE TABLE IF NOT EXISTS survey_exposures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    route VARCHAR(500),
    device VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criando índices separadamente com sintaxe correta do PostgreSQL
CREATE INDEX IF NOT EXISTS idx_survey_exposures_survey_id ON survey_exposures (survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_session_id ON survey_exposures (session_id);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_created_at ON survey_exposures (created_at);

-- Comentário explicativo
COMMENT ON TABLE survey_exposures IS 'Registra quando surveys são visualizadas pelos usuários';
