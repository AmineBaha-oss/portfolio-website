const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string | null;
  client?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
  imageUrl?: string | null;
  color?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  featured: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  order: number;
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  location: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  gpa?: string | null;
  order: number;
}

export interface Hobby {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  color?: string | null;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company?: string | null;
  email: string;
  message: string;
  rating: number;
  status: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export async function getProjects(lang: string = 'en', featured?: boolean): Promise<{ projects: Project[] }> {
  const params = new URLSearchParams({ lang });
  if (featured) {
    params.append('featured', 'true');
  }
  return fetchAPI<{ projects: Project[] }>(`/api/public/projects?${params.toString()}`);
}

export async function getSkills(lang: string = 'en'): Promise<{ skills: Skill[] }> {
  return fetchAPI<{ skills: Skill[] }>(`/api/public/skills?lang=${lang}`);
}

export async function getExperience(lang: string = 'en'): Promise<{ experiences: WorkExperience[] }> {
  return fetchAPI<{ experiences: WorkExperience[] }>(`/api/public/experience?lang=${lang}`);
}

export async function getEducation(lang: string = 'en'): Promise<{ education: Education[] }> {
  return fetchAPI<{ education: Education[] }>(`/api/public/education?lang=${lang}`);
}

export async function getHobbies(lang: string = 'en'): Promise<{ hobbies: Hobby[] }> {
  return fetchAPI<{ hobbies: Hobby[] }>(`/api/public/hobbies?lang=${lang}`);
}

export async function getTestimonials(lang: string = 'en'): Promise<{ testimonials: Testimonial[] }> {
  return fetchAPI<{ testimonials: Testimonial[] }>(`/api/public/testimonials?lang=${lang}`);
}

export async function submitTestimonial(data: {
  name: string;
  position: string;
  company?: string;
  email: string;
  message: string;
  rating: number;
}): Promise<{ success: boolean; message: string; id?: string }> {
  return fetchAPI<{ success: boolean; message: string; id?: string }>('/api/public/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  return fetchAPI<{ success: boolean; message: string; id?: string }>('/api/public/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
