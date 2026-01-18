-- Add language columns to tables
-- Migration: 20250118_001_add_language_columns

-- Add preferred_language to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en';

-- Add language to surveys table
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN users.preferred_language IS 'User preferred language for interface (en, pt-br, es)';
COMMENT ON COLUMN surveys.language IS 'Survey display language for widget (en, pt-br, es)';
