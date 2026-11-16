-- Initial hackathon entries are linked to existing projects by natural keys.
-- Re-running this script does not create duplicates or overwrite admin edits.
BEGIN;
INSERT INTO public.activities (title, description, organization, period, location, category, technologies, project_id, "order", published)
SELECT '{"en":"PeerTemp","fr":"PeerTemp"}'::jsonb,
  p.description,
  '{"en":"Cursor Community Hackathon — Botpress MTL","fr":"Hackathon Cursor Community — Botpress MTL"}'::jsonb,
  '{"en":"2026","fr":"2026"}'::jsonb,
  '{"en":"Montréal, QC","fr":"Montréal, QC"}'::jsonb,
  'hackathon', p.technologies, p.id, 1, true
FROM public.projects p
WHERE p.title->>'en' ILIKE '%PeerTemp%'
AND NOT EXISTS (SELECT 1 FROM public.activities a WHERE a.project_id = p.id AND a.category = 'hackathon');

INSERT INTO public.activities (title, description, organization, period, location, category, technologies, project_id, "order", published)
SELECT '{"en":"LANDERPRINT","fr":"LANDERPRINT"}'::jsonb,
  '{"en":"Co-developed an interactive 3D lunar landing-site explorer comparing solar power, battery reserves and Earth visibility using NASA terrain data. Integrated Python-processed datasets covering seven sites and 2,352 hourly samples into a browser-based simulation.","fr":"Codéveloppé un explorateur 3D de sites d’alunissage comparant production solaire, réserves de batterie et visibilité de la Terre à partir de données NASA. Intégré des données traitées en Python couvrant sept sites et 2 352 observations horaires dans une simulation web."}'::jsonb,
  '{"en":"NASA Space Apps Challenge — Lunar Landing Site Navigator","fr":"NASA Space Apps Challenge — Lunar Landing Site Navigator"}'::jsonb,
  '{"en":"2026","fr":"2026"}'::jsonb,
  NULL, 'hackathon', p.technologies, p.id, 2, true
FROM public.projects p
WHERE lower(rtrim(p.github_url,'/')) = 'https://github.com/aminebaha-oss/nasa'
AND NOT EXISTS (SELECT 1 FROM public.activities a WHERE a.project_id = p.id AND a.category = 'hackathon');

INSERT INTO public.activities (title, description, organization, period, location, category, technologies, project_id, "order", published)
SELECT '{"en":"CityPulse Montréal 2035","fr":"CityPulse Montréal 2035"}'::jsonb,
  p.description,
  '{"en":"Code Quest Hackathon","fr":"Hackathon Code Quest"}'::jsonb,
  '{"en":"November 2025","fr":"Novembre 2025"}'::jsonb,
  '{"en":"Montréal, QC","fr":"Montréal, QC"}'::jsonb,
  'hackathon', p.technologies, p.id, 3, true
FROM public.projects p
WHERE lower(rtrim(p.github_url,'/')) = 'https://github.com/aminebaha-oss/citypulse-montreal'
AND NOT EXISTS (SELECT 1 FROM public.activities a WHERE a.project_id = p.id AND a.category = 'hackathon');
COMMIT;
