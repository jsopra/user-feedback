-- Script para gerar API keys para surveys que não têm
UPDATE surveys 
SET api_key = 'sk_' || encode(gen_random_bytes(16), 'hex')
WHERE api_key IS NULL OR api_key = '';
