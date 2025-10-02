-- Migrar senhas existentes para o novo formato de hash
UPDATE users 
SET password_hash = CONCAT('hashed_', password_hash)
WHERE password_hash NOT LIKE 'hashed_%';
