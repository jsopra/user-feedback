-- Criando tabela para tracking de exposures (visualizações de surveys)
CREATE TABLE IF NOT EXISTS survey_exposures (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    route VARCHAR(500),
    device VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_survey_exposures_survey_id (survey_id),
    INDEX idx_survey_exposures_session_id (session_id),
    INDEX idx_survey_exposures_created_at (created_at),
    
    -- Constraint para evitar duplicatas na mesma sessão
    UNIQUE(survey_id, session_id)
);

-- Comentários para documentação
COMMENT ON TABLE survey_exposures IS 'Registra quando surveys são visualizadas pelos usuários';
COMMENT ON COLUMN survey_exposures.session_id IS 'ID único da sessão do usuário (gerado no frontend)';
COMMENT ON COLUMN survey_exposures.route IS 'URL da página onde a survey foi exibida';
COMMENT ON COLUMN survey_exposures.device IS 'Tipo de dispositivo (mobile, desktop, tablet)';
