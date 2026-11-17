import type { Project, Skill, WorkExperience, Education, Hobby, Testimonial } from './client';
import type { Activity } from './activity-types';

// Local presentation data. This file is only loaded when development mock mode is enabled.
const projects: Project[] = [
  ['Atlas Commerce', 'A bilingual storefront with a streamlined checkout.', 'Next.js, Spring Boot, PostgreSQL', '#2a2b2c'],
  ['Course Finder', 'Fast local search across course files and notes.', 'Rust, Tauri, Svelte', '#3c4651'],
  ['Lunar Explorer', 'An interactive 3D view of lunar landing sites.', 'React, Three.js, Python', '#464349'],
  ['Studio Portfolio', 'A content managed portfolio with a custom admin.', 'Next.js, TypeScript, PostgreSQL', '#454b41'],
].map(([title, description, stack, color], index) => ({
  id: `local-demo-project-${index + 1}`, title, description,
  fullDescription: `${description} This sample project gives the local detail page realistic content and spacing.`,
  client: 'Personal project', projectUrl: 'https://example.com', githubUrl: 'https://github.com',
  technologies: stack.split(', '), imageUrl: null, color, status: 'published', featured: true, inProgress: false,
}));

const skillGroups: Record<string, string[]> = {
  Languages: ['TypeScript', 'JavaScript', 'Rust', 'SQL'],
  Backend: ['Spring Boot', 'Node.js', 'Laravel', 'Flask'],
  'Front-End & Mobile': ['Next.js', 'React', 'Svelte', 'Tailwind CSS'],
  Databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
};
const skills: Skill[] = Object.entries(skillGroups).flatMap(([category, names], group) =>
  names.map((name, index) => ({ id: `mock-skill-${group}-${index}`, name, category, icon: name.toLowerCase().replace(/[^a-z]/g, ''), order: group * 4 + index }))
);

const experiences: WorkExperience[] = [
  ['Full-Stack Developer', 'Sample Studio', '2026-03-01', '2026-05-31', 'Built and shipped web features.\nCollaborated with designers and developers.'],
  ['Software Developer', 'North Labs', '2025-06-01', '2025-08-31', 'Created internal tools and APIs.\nImproved reporting workflows.'],
  ['Peer Tutor', 'Campus Learning Centre', '2025-09-01', '2025-12-31', 'Helped students understand programming fundamentals.\nGuided debugging sessions.'],
  ['Web Developer', 'Community Project', '2024-05-01', '2024-08-31', 'Delivered accessible pages for a local organization.\nWorked with feedback from volunteers.'],
].map(([position, company, startDate, endDate, description], order) => ({ id: `mock-experience-${order}`, position, company, location: 'Montréal, QC', description, startDate, endDate, current: false, order }));

const education: Education[] = [
  ['Bachelor of Computer Science — Data Science', 'Sample University', '2026-09-01', '', 'Expected graduation: 2029'],
  ['College Diploma — Computer Science', 'Sample College', '2023-08-01', '2026-06-01', 'Completed June 2026.'],
  ['Full-Stack Development Program', 'Developer Academy', '2022-09-01', '2023-05-01', 'Projects in web development and databases.'],
  ['Applied Data Workshop', 'Technology Institute', '2022-06-01', '2022-08-01', 'Hands-on work with datasets and visualizations.'],
].map(([degree, institution, startDate, endDate, description], order) => ({ id: `mock-education-${order}`, degree, institution, location: 'Montréal, QC', description, startDate, endDate: endDate || null, order }));

const hobbies: Hobby[] = [
  ['Photography', 'Exploring places and capturing details.'],
  ['Cycling', 'Finding new routes around the city.'],
  ['Cooking', 'Learning recipes from different cultures.'],
  ['Music', 'Discovering new artists and live performances.'],
].map(([title, description], order) => ({ id: `mock-hobby-${order}`, title, description, imageUrl: null, color: '#2a2b2c', order }));

const testimonials: Testimonial[] = [
  ['Alex Morgan', 'Developer', 'A thoughtful teammate who delivers.'],
  ['Sam Patel', 'Designer', 'Clear communication made the project easy to move forward.'],
  ['Taylor Nguyen', 'Project Lead', 'Reliable work and a strong eye for detail.'],
  ['Jordan Lee', 'Collaborator', 'Found practical solutions under a tight deadline.'],
].map(([name, position, message], index) => ({ id: `mock-testimonial-${index}`, name, position, company: 'Sample Studio', email: `sample${index}@example.com`, message, rating: 5, status: 'approved' }));

const activities: Activity[] = [
  ['Sample Hackathon', 'Built a working prototype with a small team.', 'Community Event', 'hackathon'],
  ['Open Source Meetup', 'Shared progress and reviewed contributions.', 'Developer Community', 'community'],
  ['Design Challenge', 'Presented a solution to a real user problem.', 'Campus Club', 'competition'],
  ['Volunteer Coding Day', 'Helped a local group improve its web presence.', 'Local Nonprofit', 'volunteering'],
].map(([title, description, organization, category], order) => ({
  id: `mock-activity-${order}`, title, description, organization, period: '2026', location: 'Montréal, QC',
  category: category as Activity['category'], technologies: ['TypeScript', 'Next.js'],
  projectId: projects[order].id, eventUrl: null, order, published: true,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}));

export function mockPublicResponse(endpoint: string): unknown {
  const path = endpoint.split('?')[0];
  if (path === '/api/public/projects') return { projects };
  if (path.startsWith('/api/public/projects/')) {
    const project = projects.find(item => item.id === decodeURIComponent(path.split('/').pop() || ''));
    if (project) return { project };
    return undefined;
  }
  if (path === '/api/public/skills') return { skills };
  if (path === '/api/public/experience') return { experiences };
  if (path === '/api/public/education') return { education };
  if (path === '/api/public/hobbies') return { hobbies };
  if (path === '/api/public/testimonials') return { testimonials };
  if (path === '/api/public/activities') return { activities };
  return undefined;
}
