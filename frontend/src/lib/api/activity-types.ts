export type BilingualText = { en: string; fr: string };
export const activityCategories = ['hackathon', 'community', 'competition', 'volunteering', 'other'] as const;
export type ActivityCategory = typeof activityCategories[number];
export interface ActivityInput {
  title: BilingualText;
  description: BilingualText;
  organization: BilingualText | null;
  period: BilingualText;
  location: BilingualText | null;
  category: ActivityCategory;
  technologies: string[];
  projectId: string | null;
  eventUrl: string | null;
  order: number;
  published: boolean;
}
export interface AdminActivity extends ActivityInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export interface Activity extends Omit<AdminActivity, 'title' | 'description' | 'organization' | 'period' | 'location'> {
  title: string;
  description: string;
  organization: string;
  period: string;
  location: string;
}
