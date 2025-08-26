-- Update existing survey_exposures records with improved device parsing
-- This script processes existing user_agent data to categorize devices more accurately

-- Add a temporary column for the new device type if it doesn't exist
-- (This is safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_exposures' 
                   AND column_name = 'device_type_new') THEN
        ALTER TABLE survey_exposures ADD COLUMN device_type_new VARCHAR(20);
    END IF;
END $$;

-- Update device types based on user_agent parsing
UPDATE survey_exposures 
SET device_type_new = CASE
    -- Tablets
    WHEN LOWER(user_agent) LIKE '%ipad%' THEN 'tablet'
    WHEN LOWER(user_agent) LIKE '%android%tablet%' OR LOWER(user_agent) LIKE '%android%pad%' THEN 'tablet'
    
    -- Mobile devices
    WHEN LOWER(user_agent) LIKE '%iphone%' THEN 'mobile'
    WHEN LOWER(user_agent) LIKE '%android%' AND LOWER(user_agent) LIKE '%mobile%' THEN 'mobile'
    WHEN LOWER(user_agent) LIKE '%mobile%' OR LOWER(user_agent) LIKE '%phone%' THEN 'mobile'
    
    -- Desktop (default)
    ELSE 'desktop'
END
WHERE device_type_new IS NULL OR device_type_new = '';

-- Update the original device column with the new parsed values
UPDATE survey_exposures 
SET device = device_type_new 
WHERE device_type_new IS NOT NULL;

-- Clean up temporary column
ALTER TABLE survey_exposures DROP COLUMN IF EXISTS device_type_new;

-- Also update survey_responses if it has device information
-- (Currently it doesn't have a device column, but this is future-proof)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'survey_responses' 
               AND column_name = 'device') THEN
        
        UPDATE survey_responses 
        SET device = CASE
            WHEN LOWER(user_agent) LIKE '%ipad%' THEN 'tablet'
            WHEN LOWER(user_agent) LIKE '%android%tablet%' OR LOWER(user_agent) LIKE '%android%pad%' THEN 'tablet'
            WHEN LOWER(user_agent) LIKE '%iphone%' THEN 'mobile'
            WHEN LOWER(user_agent) LIKE '%android%' AND LOWER(user_agent) LIKE '%mobile%' THEN 'mobile'
            WHEN LOWER(user_agent) LIKE '%mobile%' OR LOWER(user_agent) LIKE '%phone%' THEN 'mobile'
            ELSE 'desktop'
        END
        WHERE user_agent IS NOT NULL;
    END IF;
END $$;

-- Create indexes for better performance on device-based queries
CREATE INDEX IF NOT EXISTS idx_survey_exposures_device ON survey_exposures(device);
CREATE INDEX IF NOT EXISTS idx_survey_exposures_survey_device ON survey_exposures(survey_id, device);

-- Show summary of updated records
SELECT 
    device,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM survey_exposures 
GROUP BY device 
ORDER BY count DESC;
