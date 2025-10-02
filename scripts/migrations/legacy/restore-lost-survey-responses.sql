-- Script para restaurar as respostas perdidas da survey 618430ce-b1d4-4d00-8ed5-32825d30a0b3
-- Baseado no log fornecido pelo usuário

-- Primeiro, vamos verificar os IDs dos elementos da survey
-- (execute esta parte primeiro para confirmar os IDs)
-- Corrigindo nome da coluna de 'title' para 'question'
SELECT id, question, type, order_index 
FROM survey_elements 
WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' 
AND is_active = true
ORDER BY order_index;

-- Assumindo que temos 2 elementos:
-- elemento_rating_id = ID do elemento de avaliação (rating)
-- elemento_texto_id = ID do elemento de motivo (texto)

-- IMPORTANTE: Substitua os UUIDs abaixo pelos IDs reais dos elementos
-- que serão retornados pela query acima

DO $$
DECLARE
    elemento_rating_id UUID := 'SUBSTITUA_PELO_ID_REAL_DO_RATING';
    elemento_texto_id UUID := 'SUBSTITUA_PELO_ID_REAL_DO_TEXTO';
    response_id UUID;
BEGIN

-- Corrigindo inserções para não incluir respostas NULL, apenas inserir quando há resposta válida
-- Resposta 1: 19/08/2025, 12:17:20 - Avaliação: 1, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1724068640000_1', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-19 12:17:20', false);

-- Inserir apenas a resposta de rating (motivo está vazio)
INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '1', '2025-08-19 12:17:20');

-- Resposta 2: 19/08/2025, 10:17:34 - Avaliação: 3, Motivo: "acredito que quando filtrássemos a loja a meta também já fosse..."
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1724061454000_2', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-19 10:17:34', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES 
    (response_id, elemento_rating_id, '3', '2025-08-19 10:17:34'),
    (response_id, elemento_texto_id, 'acredito que quando filtrássemos a loja a meta também já fosse...', '2025-08-19 10:17:34');

-- Resposta 3: 16/08/2025, 20:18:46 - Avaliação: 5, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723838326000_3', 'Unknown Browser', 'Unknown', 'https://panels.webdecisor...', '2025-08-16 20:18:46', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '5', '2025-08-16 20:18:46');

-- Resposta 4: 14/08/2025, 20:52:14 - Avaliação: 1, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723668734000_4', 'Mobile Browser', 'Mobile', 'https://panels.webdecisor...', '2025-08-14 20:52:14', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '1', '2025-08-14 20:52:14');

-- Resposta 5: 14/08/2025, 17:54:50 - Avaliação: 5, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723658090000_5', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-14 17:54:50', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '5', '2025-08-14 17:54:50');

-- Resposta 6: 14/08/2025, 10:15:22 - Avaliação: 1, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723630522000_6', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-14 10:15:22', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '1', '2025-08-14 10:15:22');

-- Resposta 7: 13/08/2025, 18:28:02 - Avaliação: 3, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723573682000_7', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-13 18:28:02', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '3', '2025-08-13 18:28:02');

-- Resposta 8: 13/08/2025, 15:31:47 - Avaliação: 3, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723563107000_8', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-13 15:31:47', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '3', '2025-08-13 15:31:47');

-- Resposta 9: 13/08/2025, 14:41:19 - Avaliação: 2, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723560079000_9', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-13 14:41:19', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '2', '2025-08-13 14:41:19');

-- Resposta 10: 13/08/2025, 13:47:01 - Avaliação: 3, Motivo: -
response_id := gen_random_uuid();
INSERT INTO survey_responses (id, survey_id, session_id, user_agent, device, page_url, created_at, is_deleted)
VALUES (response_id, '618430ce-b1d4-4d00-8ed5-32825d30a0b3', 'embed_1723556821000_10', 'Desktop Browser', 'Desktop', 'https://panels.webdecisor...', '2025-08-13 13:47:01', false);

INSERT INTO survey_element_responses (response_id, element_id, answer, created_at)
VALUES (response_id, elemento_rating_id, '3', '2025-08-13 13:47:01');

END $$;

-- Verificar se os dados foram inseridos corretamente
SELECT COUNT(*) as total_responses FROM survey_responses WHERE survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' AND is_deleted = false;
SELECT COUNT(*) as total_element_responses FROM survey_element_responses ser 
JOIN survey_responses sr ON ser.response_id = sr.id 
WHERE sr.survey_id = '618430ce-b1d4-4d00-8ed5-32825d30a0b3' AND sr.is_deleted = false;
