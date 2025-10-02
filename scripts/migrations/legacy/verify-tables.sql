-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('surveys', 'survey_elements', 'survey_page_rules', 'survey_responses', 'survey_element_responses');

-- Verificar estrutura da tabela surveys
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'surveys'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela survey_elements
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'survey_elements'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela survey_page_rules
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'survey_page_rules'
ORDER BY ordinal_position;
