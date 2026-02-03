-- Add image_key columns to projects and hobbies tables for DO Spaces integration
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_key TEXT;
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS image_key TEXT;
