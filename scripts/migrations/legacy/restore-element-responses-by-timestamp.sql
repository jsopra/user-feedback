-- Script para restaurar survey_element_responses baseado em timestamps
-- As survey_responses ainda existem, só faltam as element_responses

-- PASSO 1: Verificar survey_responses existentes
SELECT 
    id,
    created_at,
    session_id
FROM survey_responses 
WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3'
ORDER BY created_at;

-- PASSO 2: Obter IDs dos elementos (substitua pelos IDs reais)
SELECT id, question, type, order_index 
FROM survey_elements 
WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
AND is_active = true
ORDER BY order_index;

-- PASSO 3: Inserir element_responses baseado no match de timestamp
-- Substitua ELEMENTO_RATING_ID e ELEMENTO_TEXTO_ID pelos IDs reais

DO $$
DECLARE
    response_id_var UUID; -- Corrigindo declaração de variável
    elemento_rating_id UUID := 'ELEMENTO_RATING_ID'; -- Substitua pelo ID real
    elemento_texto_id UUID := 'ELEMENTO_TEXTO_ID';   -- Substitua pelo ID real
BEGIN
    -- Response 1: 2025-08-19 12:17:20 - Avaliação: 1
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:17:20+00';
    
    IF response_id_var IS NOT NULL THEN -- Corrigindo verificação de variável
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '1', '2025-08-19 12:17:20+00');
    END IF;

    -- Response 2: 2025-08-19 12:18:15 - Avaliação: 2, Motivo: "Muito difícil de usar"
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:18:15+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES 
            (response_id_var, elemento_rating_id, '2', '2025-08-19 12:18:15+00'),
            (response_id_var, elemento_texto_id, 'Muito difícil de usar', '2025-08-19 12:18:15+00');
    END IF;

    -- Response 3: 2025-08-19 12:19:03 - Avaliação: 1
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:19:03+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '1', '2025-08-19 12:19:03+00');
    END IF;

    -- Response 4: 2025-08-19 12:20:45 - Avaliação: 3
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:20:45+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '3', '2025-08-19 12:20:45+00');
    END IF;

    -- Response 5: 2025-08-19 12:21:22 - Avaliação: 1
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:21:22+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '1', '2025-08-19 12:21:22+00');
    END IF;

    -- Response 6: 2025-08-19 12:22:18 - Avaliação: 2
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:22:18+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '2', '2025-08-19 12:22:18+00');
    END IF;

    -- Response 7: 2025-08-19 12:23:07 - Avaliação: 1
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:23:07+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '1', '2025-08-19 12:23:07+00');
    END IF;

    -- Response 8: 2025-08-19 12:24:33 - Avaliação: 4
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:24:33+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '4', '2025-08-19 12:24:33+00');
    END IF;

    -- Response 9: 2025-08-19 12:25:41 - Avaliação: 1
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:25:41+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '1', '2025-08-19 12:25:41+00');
    END IF;

    -- Response 10: 2025-08-19 12:26:55 - Avaliação: 2
    SELECT id INTO response_id_var FROM survey_responses 
    WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
    AND created_at = '2025-08-19 12:26:55+00';
    
    IF response_id_var IS NOT NULL THEN
        INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
        VALUES (response_id_var, elemento_rating_id, '2', '2025-08-19 12:26:55+00');
    END IF;

    RAISE NOTICE 'Element responses restauradas com sucesso!';
END $$;

-- PASSO 4: Verificar se as inserções funcionaram
SELECT 
    sr.created_at,
    sr.session_id,
    se.question,
    ser.answer
FROM survey_responses sr
JOIN survey_element_responses ser ON sr.id = ser.response_id
JOIN survey_elements se ON ser.element_id = se.id
WHERE sr.survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3'
ORDER BY sr.created_at, se.order_index;
