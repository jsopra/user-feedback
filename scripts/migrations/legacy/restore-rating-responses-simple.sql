-- Script simples para restaurar respostas de rating baseado no timestamp
-- Survey ID: 618430ce-b1d4-4d00-8ed5-32825d30a0b3
-- Elemento Rating ID: e62ea449-9ddc-40ec-8a1a-0dd01a8f0735

-- Restaurar respostas de rating usando INSERT com SELECT
INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
SELECT 
    sr.id as response_id,
    'e62ea449-9ddc-40ec-8a1a-0dd01a8f0735'::uuid as element_id,
    -- Convertendo valores para JSONB
    CASE 
        WHEN sr.created_at = '2025-08-19 12:17:20+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:18:35+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:19:12+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:19:45+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:20:18+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:20:51+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:21:24+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:21:57+00' THEN '1'::jsonb
        WHEN sr.created_at = '2025-08-19 12:22:30+00' THEN '5'::jsonb
        WHEN sr.created_at = '2025-08-19 12:23:03+00' THEN '1'::jsonb
    END as answer,
    sr.created_at
FROM survey_responses sr
WHERE sr.survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3'
    AND sr.is_deleted = false
    AND sr.created_at IN (
        '2025-08-19 12:17:20+00',
        '2025-08-19 12:18:35+00',
        '2025-08-19 12:19:12+00',
        '2025-08-19 12:19:45+00',
        '2025-08-19 12:20:18+00',
        '2025-08-19 12:20:51+00',
        '2025-08-19 12:21:24+00',
        '2025-08-19 12:21:57+00',
        '2025-08-19 12:22:30+00',
        '2025-08-19 12:23:03+00'
    );

-- Verificar se as inserções funcionaram
SELECT COUNT(*) as total_restored FROM survey_element_responses 
WHERE element_id = 'e62ea449-9ddc-40ec-8a1a-0dd01a8f0735';
