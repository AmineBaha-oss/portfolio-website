-- Add active column to testimonials table
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Update existing records to be active by default
UPDATE testimonials 
SET active = TRUE 
WHERE active IS NULL;
