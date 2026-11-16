CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title jsonb NOT NULL,
  description jsonb NOT NULL,
  organization jsonb,
  period jsonb NOT NULL,
  location jsonb,
  category text NOT NULL DEFAULT 'hackathon',
  technologies text[] NOT NULL DEFAULT '{}',
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  event_url text,
  "order" integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT activities_category_check CHECK (category IN ('hackathon', 'community', 'competition', 'volunteering', 'other')),
  CONSTRAINT activities_order_check CHECK ("order" >= 0),
  CONSTRAINT activities_title_check CHECK (jsonb_typeof(title) = 'object' AND length(trim(coalesce(title->>'en',''))) > 0 AND length(trim(coalesce(title->>'fr',''))) > 0),
  CONSTRAINT activities_description_check CHECK (jsonb_typeof(description) = 'object' AND length(trim(coalesce(description->>'en',''))) > 0 AND length(trim(coalesce(description->>'fr',''))) > 0),
  CONSTRAINT activities_period_check CHECK (jsonb_typeof(period) = 'object' AND length(trim(coalesce(period->>'en',''))) > 0 AND length(trim(coalesce(period->>'fr',''))) > 0)
);
CREATE INDEX activities_published_order_idx ON public.activities ("order", created_at) WHERE published = true;
CREATE INDEX activities_project_id_idx ON public.activities (project_id);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.activities FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO portfolio_app, service_role;
CREATE POLICY deny_client_api_access ON public.activities FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
