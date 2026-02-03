-- Add in_progress field to projects table
ALTER TABLE projects
ADD COLUMN in_progress BOOLEAN NOT NULL DEFAULT false;

-- Optional: Update existing projects without endDate to be in_progress
UPDATE projects
SET in_progress = true
WHERE end_date IS NULL AND start_date IS NOT NULL;
