-- Cria usuário administrador padrão para novos ambientes
INSERT INTO users (email, name, password_hash, role, is_active)
VALUES (
    'admin@example.com',
    'Administrador do Sistema',
    '$2b$10$.USalquyiPdH1F3qHS0A.OfMM.7MfzIilaCYhxhWkThTzTA3OI6fC',
    'admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
