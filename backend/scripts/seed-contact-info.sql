-- Seed default contact information (AMINE BAHA)
-- This script adds default contact info to the database

-- Ensure unique constraint exists
CREATE UNIQUE INDEX IF NOT EXISTS contact_info_type_value_unique ON contact_info(type, value);

-- Phone
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (gen_random_uuid(), 'phone', '+1 (438) 227-7034', 0, NOW(), NOW())
ON CONFLICT (type, value) DO NOTHING;

-- Location
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (gen_random_uuid(), 'location', 'Longueuil, QC', 1, NOW(), NOW())
ON CONFLICT (type, value) DO NOTHING;

-- Email
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (gen_random_uuid(), 'email', 'aminebaha115@gmail.com', 2, NOW(), NOW())
ON CONFLICT (type, value) DO NOTHING;

-- GitHub
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (gen_random_uuid(), 'github', 'https://github.com/AmineBaha-oss', 3, NOW(), NOW())
ON CONFLICT (type, value) DO NOTHING;

-- LinkedIn
INSERT INTO contact_info (id, type, value, "order", created_at, updated_at)
VALUES (gen_random_uuid(), 'linkedin', 'https://www.linkedin.com/in/amine-baha-oss', 4, NOW(), NOW())
ON CONFLICT (type, value) DO NOTHING;
