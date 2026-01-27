-- Seed default contact information
-- This script adds default contact info to the database

-- Clear existing contact info (optional - remove if you want to keep existing data)
-- DELETE FROM contact_info;

-- Insert default email
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'email',
    'aminebaha115@gmail.com',
    0,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Insert GitHub link
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'social_links',
    'https://github.com/AmineBaha-oss',
    1,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Insert LinkedIn link
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'social_links',
    'https://www.linkedin.com/in/amine-baha-oss',
    2,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
