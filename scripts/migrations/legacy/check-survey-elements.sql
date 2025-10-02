-- Verificar se a survey d7d7c589-1380-4134-9f4e-afa6acc973a5 tem elementos configurados
SELECT 
    se.id,
    se.type,
    se.question,
    se.required,
    se.order_index,
    se.config
FROM survey_elements se
WHERE se.survey_id = 'd7d7c589-1380-4134-9f4e-afa6acc973a5'
ORDER BY se.order_index;

-- Contar quantos elementos a survey tem
SELECT COUNT(*) as total_elements
FROM survey_elements se
WHERE se.survey_id = 'd7d7c589-1380-4134-9f4e-afa6acc973a5';

-- Se não tiver elementos, mostrar surveys que têm elementos para comparação
SELECT 
    s.id,
    s.title,
    COUNT(se.id) as element_count
FROM surveys s
LEFT JOIN survey_elements se ON s.id = se.survey_id
GROUP BY s.id, s.title
HAVING COUNT(se.id) > 0
ORDER BY s.created_at DESC
LIMIT 5;
