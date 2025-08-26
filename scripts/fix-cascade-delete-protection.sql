-- Remove CASCADE DELETE perigoso e adiciona soft delete
-- IMPORTANTE: Execute este script para proteger as responses

-- 1. Adicionar campos de soft delete
ALTER TABLE survey_elements 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE survey_responses 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Remover constraint CASCADE perigoso do element_id
ALTER TABLE survey_element_responses 
DROP CONSTRAINT IF EXISTS survey_element_responses_element_id_fkey;

-- 3. Recriar constraint SEM CASCADE (usa RESTRICT por padrão)
ALTER TABLE survey_element_responses 
ADD CONSTRAINT survey_element_responses_element_id_fkey 
FOREIGN KEY (element_id) REFERENCES survey_elements(id) ON DELETE RESTRICT;

-- 4. Manter CASCADE apenas para response_id (faz sentido)
ALTER TABLE survey_element_responses 
DROP CONSTRAINT IF EXISTS survey_element_responses_response_id_fkey;

ALTER TABLE survey_element_responses 
ADD CONSTRAINT survey_element_responses_response_id_fkey 
FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE;

-- 5. Criar índices para performance com soft delete
CREATE INDEX IF NOT EXISTS idx_survey_elements_active ON survey_elements(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_responses_deleted ON survey_responses(is_deleted);

-- Verificar estrutura final
SELECT 
    'survey_elements' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_elements' 
AND column_name IN ('is_active')
UNION ALL
SELECT 
    'survey_responses' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_responses' 
AND column_name IN ('is_deleted');
