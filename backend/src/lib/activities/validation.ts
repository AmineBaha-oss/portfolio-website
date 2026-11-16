import { sanitizeText, validateURL, validateUUID } from '../utils/validation';

export const activityCategories = ['hackathon', 'community', 'competition', 'volunteering', 'other'] as const;
export class ActivityValidationError extends Error {}
function fail(message: string): never { throw new ActivityValidationError(message); }

function bilingual(value: unknown, label: string, required = true, max = 500) {
  if (!required && (value == null || value === '')) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must contain English and French text`);
  const data = value as Record<string, unknown>;
  const result = { en: '', fr: '' };
  for (const lang of ['en', 'fr'] as const) {
    if (typeof data[lang] !== 'string') fail(`${label} (${lang}) must be text`);
    const clean = sanitizeText(data[lang] as string);
    if (required && !clean) fail(`${label} (${lang}) is required`);
    if (clean.length > max) fail(`${label} (${lang}) must be at most ${max} characters`);
    result[lang] = clean;
  }
  return !required && !result.en && !result.fr ? null : result;
}

export function parseActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Activity must be an object');
  const data = input as Record<string, unknown>;
  const title = bilingual(data.title, 'Title')!;
  const description = bilingual(data.description, 'Description', true, 10000)!;
  const period = bilingual(data.period, 'Period', true, 200)!;
  const organization = bilingual(data.organization, 'Organization', false);
  const location = bilingual(data.location, 'Location', false);
  const category = data.category ?? 'hackathon';
  if (!activityCategories.includes(category as typeof activityCategories[number])) fail('Invalid activity category');
  const order = data.order ?? 0;
  if (typeof order !== 'number' || !Number.isInteger(order) || order < 0 || order > 2147483647) fail('Order must be a non-negative integer');
  const published = data.published ?? false;
  if (typeof published !== 'boolean') fail('Published must be a boolean');
  const projectId = data.projectId == null || data.projectId === '' ? null : data.projectId;
  if (projectId !== null && (typeof projectId !== 'string' || !validateUUID(projectId))) fail('Invalid linked project ID');
  const eventUrl = data.eventUrl == null || data.eventUrl === '' ? null : data.eventUrl;
  if (eventUrl !== null && (typeof eventUrl !== 'string' || eventUrl.length > 2000 || !validateURL(eventUrl))) fail('Event URL must use http or https');
  const technologies = data.technologies ?? [];
  if (!Array.isArray(technologies) || technologies.length > 30 || technologies.some(t => typeof t !== 'string' || !t.trim() || t.length > 100)) fail('Technologies must be a list of up to 30 non-empty strings');
  return { title, description, period, organization, location, category: category as typeof activityCategories[number], order, published, projectId: projectId as string | null, eventUrl: eventUrl as string | null, technologies: [...new Set((technologies as string[]).map(sanitizeText).filter(Boolean))] };
}
