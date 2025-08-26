-- Criar tabelas de surveys (versão simplificada)
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  design_settings JSONB DEFAULT '{}',
  target_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS survey_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_page_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  rule_type VARCHAR(20) NOT NULL,
  pattern TEXT NOT NULL,
  is_regex BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('surveys', 'survey_elements', 'survey_page_rules');
