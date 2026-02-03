-- Migration: Add file metadata fields to resumes table
-- Date: 2026-02-02

-- Add new columns for file storage metadata
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_key TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN resumes.file_key IS 'DigitalOcean Spaces storage key for file deletion';
COMMENT ON COLUMN resumes.file_size IS 'File size in bytes';
COMMENT ON COLUMN resumes.language IS 'Resume language: en or fr';
