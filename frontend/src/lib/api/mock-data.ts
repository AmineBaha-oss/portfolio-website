import type { Project, Skill, WorkExperience, Education, Hobby, Testimonial } from './client';
import type { Activity } from './activity-types';

const project: Project = {
  id: 'local-demo-project', title: 'Sample Project', description: 'A sample project for local UI development.',
  fullDescription: 'Use this project to refine the layout, transitions, and project detail page.',
  client: 'Personal project', projectUrl: 'https://example.com', githubUrl: 'https://github.com',
  technologies: ['Next.js', 'TypeScript', 'PostgreSQL'], imageUrl: null, color: '#2a2b2c',
  status: 'published', featured: true, inProgress: false,
};

const skills: Skill[] = [
  { id: 'mock-skill-1', name: 'TypeScript', category: 'Languages', icon: 'typescript', order: 0 },
  { id: 'mock-skill-2', name: 'Next.js', category: 'Front-End', icon: 'nextjs', order: 1 },
  { id: 'mock-skill-3', name: 'PostgreSQL', category: 'Databases', icon: 'postgresql', order: 2 },
];

const experiences: WorkExperience[] = [{ id: 'mock-experience', position: 'Full-Stack Developer', company: 'Sample Studio', location: 'Montréal, QC', description: 'Built and shipped web features.\nCollaborated with designers and developers.', startDate: '2026-03-01', endDate: '2026-05-31', current: false, order: 0 }];
const education: Education[] = [{ id: 'mock-education', degree: 'Computer Science', institution: 'Sample University', location: 'Montréal, QC', description: 'Software development and data science.', startDate: '2026-09-01', endDate: null, order: 0 }];
const hobbies: Hobby[] = [{ id: 'mock-hobby', title: 'Photography', description: 'Exploring places and capturing details.', imageUrl: null, color: '#2a2b2c', order: 0 }];
const testimonials: Testimonial[] = [{ id: 'mock-testimonial', name: 'Sample Colleague', position: 'Developer', company: 'Sample Studio', email: 'sample@example.com', message: 'A thoughtful teammate who delivers.', rating: 5, status: 'approved' }];
const activities: Activity[] = [{ id: 'mock-activity', title: 'Sample Hackathon', description: 'Built a working prototype with a small team.', organization: 'Community Event', period: '2026', location: 'Montréal, QC', category: 'hackathon', technologies: ['TypeScript', 'Next.js'], projectId: project.id, eventUrl: null, order: 0, published: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }];

export function mockPublicResponse(endpoint: string): unknown {
  const path = endpoint.split('?')[0];
  if (path === '/api/public/projects') return { projects: [project] };
  if (path.startsWith('/api/public/projects/')) return { project };
  if (path === '/api/public/skills') return { skills };
  if (path === '/api/public/experience') return { experiences };
  if (path === '/api/public/education') return { education };
  if (path === '/api/public/hobbies') return { hobbies };
  if (path === '/api/public/testimonials') return { testimonials };
  if (path === '/api/public/activities') return { activities };
  return undefined;
}
