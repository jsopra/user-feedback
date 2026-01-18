-- Add language field to surveys table
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS surveys_language_idx ON surveys(language);
