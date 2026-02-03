-- Add download tracking table for resume statistics
CREATE TABLE IF NOT EXISTS resume_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_resume_downloads_downloaded_at ON resume_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_resume_downloads_resume_id ON resume_downloads(resume_id);
