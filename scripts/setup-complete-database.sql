-- =====================================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS
-- EXECUTAR UMA VEZ APENAS
-- =====================================================

-- Verificar se a função update_updated_at_column existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (já existe)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de feedbacks (já existe)
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões (já existe)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE SURVEYS
-- =====================================================

-- Tabela principal de surveys
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  design_settings JSONB NOT NULL DEFAULT '{}',
  target_settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Elementos das surveys
CREATE TABLE IF NOT EXISTS survey_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'textarea', 'multiple_choice', 'rating')),
  question TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regras de páginas para exibição das surveys
CREATE TABLE IF NOT EXISTS survey_page_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('include', 'exclude')),
  pattern TEXT NOT NULL,
  is_regex BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respostas das surveys
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  page_url TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respostas individuais dos elementos
CREATE TABLE IF NOT EXISTS survey_element_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
  element_id UUID REFERENCES survey_elements(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_by ON feedbacks(created_by);

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at);

-- Índices para survey_elements
CREATE INDEX IF NOT EXISTS idx_survey_elements_survey_id ON survey_elements(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_elements_order ON survey_elements(survey_id, order_index);

-- Índices para survey_page_rules
CREATE INDEX IF NOT EXISTS idx_survey_page_rules_survey_id ON survey_page_rules(survey_id);

-- Índices para survey_responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON survey_responses(completed);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session ON survey_responses(session_id);

-- Índices para survey_element_responses
CREATE INDEX IF NOT EXISTS idx_survey_element_responses_response_id ON survey_element_responses(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_element_responses_element_id ON survey_element_responses(element_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para feedbacks
DROP TRIGGER IF EXISTS update_feedbacks_updated_at ON feedbacks;
CREATE TRIGGER update_feedbacks_updated_at BEFORE UPDATE ON feedbacks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para surveys
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS (APENAS SE NÃO EXISTIREM)
-- =====================================================

-- Usuário admin padrão
INSERT INTO users (email, name, password_hash, role) 
VALUES (
  'admin@example.com', 
  'Administrador do Sistema', 
  '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Feedbacks de exemplo
INSERT INTO feedbacks (title, content, rating, customer_name, customer_email, status) VALUES
('Excelente atendimento!', 'Fui muito bem atendido pela equipe. Parabéns!', 5, 'João Silva', 'joao@email.com', 'reviewed'),
('Poderia melhorar a velocidade', 'O sistema está um pouco lento, mas funciona bem.', 3, 'Maria Santos', 'maria@email.com', 'pending'),
('Muito satisfeito com o produto', 'Produto de qualidade e entrega rápida.', 5, 'Pedro Costa', 'pedro@email.com', 'resolved')
ON CONFLICT DO NOTHING;

-- Survey de exemplo
INSERT INTO surveys (title, description, design_settings, target_settings, is_active) VALUES
(
  'Survey de Satisfação - Exemplo',
  'Avalie nossa plataforma e nos ajude a melhorar',
  '{"colorTheme": "default", "primaryColor": "#3b82f6", "backgroundColor": "#ffffff", "textColor": "#000000", "widgetPosition": "bottom-right"}',
  '{"delay": 0, "recurrence": "one_response", "recurrenceConfig": {}}',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar todas as tabelas criadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros em cada tabela
SELECT 
  'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 
  'feedbacks' as tabela, COUNT(*) as registros FROM feedbacks
UNION ALL
SELECT 
  'user_sessions' as tabela, COUNT(*) as registros FROM user_sessions
UNION ALL
SELECT 
  'surveys' as tabela, COUNT(*) as registros FROM surveys
UNION ALL
SELECT 
  'survey_elements' as tabela, COUNT(*) as registros FROM survey_elements
UNION ALL
SELECT 
  'survey_page_rules' as tabela, COUNT(*) as registros FROM survey_page_rules
UNION ALL
SELECT 
  'survey_responses' as tabela, COUNT(*) as registros FROM survey_responses
UNION ALL
SELECT 
  'survey_element_responses' as tabela, COUNT(*) as registros FROM survey_element_responses;

-- Verificar constraints e relacionamentos
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
