-- Verificar se há dados na tabela survey_element_responses
SELECT COUNT(*) as total_responses FROM survey_element_responses;

-- Verificar dados específicos da survey mencionada
SELECT 
    ser.response_id,
    ser.element_id,
    ser.answer,
    ser.created_at,
    sr.survey_id
FROM survey_element_responses ser
JOIN survey_responses sr ON ser.response_id = sr.id
WHERE sr.survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3'
LIMIT 10;

-- Verificar todas as surveys que têm element responses
SELECT 
    sr.survey_id,
    COUNT(ser.id) as response_count
FROM survey_element_responses ser
JOIN survey_responses sr ON ser.response_id = sr.id
GROUP BY sr.survey_id
ORDER BY response_count DESC;
