-- Verificar se a survey d7d7c589-1380-4134-9f4e-afa6acc973a5 existe e seu status
SELECT 
    s.id,
    s.title,
    s.is_active,
    s.api_key,
    s.project_id,
    p.name as project_name,
    p.base_domain,
    s.created_at
FROM surveys s
LEFT JOIN projects p ON s.project_id = p.id
WHERE s.id = 'd7d7c589-1380-4134-9f4e-afa6acc973a5';

-- Se não encontrar, listar as últimas 5 surveys criadas para comparação
SELECT 
    s.id,
    s.title,
    s.is_active,
    s.project_id,
    p.name as project_name,
    s.created_at
FROM surveys s
LEFT JOIN projects p ON s.project_id = p.id
ORDER BY s.created_at DESC
LIMIT 5;
