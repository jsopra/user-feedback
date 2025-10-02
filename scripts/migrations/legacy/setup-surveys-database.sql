-- Criar tabela de surveys
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Design settings (JSON)
  design_settings JSONB NOT NULL DEFAULT '{}',
  
  -- Target settings (JSON)
  target_settings JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Criar tabela de elementos da survey
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

-- Criar tabela de respostas das surveys
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Para identificar sessão do usuário
  user_agent TEXT,
  ip_address INET,
  page_url TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de respostas individuais dos elementos
CREATE TABLE IF NOT EXISTS survey_element_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
  element_id UUID REFERENCES survey_elements(id) ON DELETE CASCADE,
  answer JSONB NOT NULL, -- Pode ser texto, número, array para múltipla escolha
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de regras de páginas
CREATE TABLE IF NOT EXISTS survey_page_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('include', 'exclude')),
  pattern TEXT NOT NULL,
  is_regex BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_surveys_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_survey_elements_survey_id ON survey_elements(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_elements_order ON survey_elements(survey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON survey_responses(completed);
CREATE INDEX IF NOT EXISTS idx_survey_page_rules_survey_id ON survey_page_rules(survey_id);

-- Triggers para updated_at
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir survey de exemplo
INSERT INTO surveys (title, description, design_settings, target_settings, is_active) VALUES
(
  'Survey de Satisfação',
  'Avalie nossa plataforma',
  '{"colorTheme": "default", "primaryColor": "#3b82f6", "backgroundColor": "#ffffff", "textColor": "#000000", "widgetPosition": "bottom-right"}',
  '{"delay": 0, "recurrence": "one_response", "recurrenceConfig": {}}',
  true
) ON CONFLICT DO NOTHING;
