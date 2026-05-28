import { getApiBaseUrl } from './client';

const API_BASE_URL = getApiBaseUrl();

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const response = await fetch('/api/admin-auth');
    if (!response.ok) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return null;
    }
    const { token } = await response.json();
    cachedToken = token;
    return token;
  } catch {
    return null;
  }
}

async function fetchAdminAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    cachedToken = null;
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized. Please log in.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Projects
export async function getProjects() {
  return fetchAdminAPI<{ projects: any[] }>('/api/admin/projects');
}

export async function createProject(data: any) {
  return fetchAdminAPI<{ project: any }>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: any) {
  return fetchAdminAPI<{ project: any }>(`/api/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/projects/${id}`, {
    method: 'DELETE',
  });
}

// Skills
export async function getSkills() {
  return fetchAdminAPI<{ skills: any[] }>('/api/admin/skills');
}

export async function createSkill(data: any) {
  return fetchAdminAPI<{ skill: any }>('/api/admin/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSkill(id: string, data: any) {
  return fetchAdminAPI<{ skill: any }>(`/api/admin/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSkill(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/skills/${id}`, {
    method: 'DELETE',
  });
}

// Experience
export async function getExperience() {
  return fetchAdminAPI<{ experiences: any[] }>('/api/admin/experience');
}

export async function createExperience(data: any) {
  return fetchAdminAPI<{ experience: any }>('/api/admin/experience', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExperience(id: string, data: any) {
  return fetchAdminAPI<{ experience: any }>(`/api/admin/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteExperience(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/experience/${id}`, {
    method: 'DELETE',
  });
}

// Education
export async function getEducation() {
  return fetchAdminAPI<{ education: any[] }>('/api/admin/education');
}

export async function createEducation(data: any) {
  return fetchAdminAPI<{ education: any }>('/api/admin/education', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEducation(id: string, data: any) {
  return fetchAdminAPI<{ education: any }>(`/api/admin/education/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEducation(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/education/${id}`, {
    method: 'DELETE',
  });
}

// Hobbies
export async function getHobbies() {
  return fetchAdminAPI<{ hobbies: any[] }>('/api/admin/hobbies');
}

export async function createHobby(data: any) {
  return fetchAdminAPI<{ hobby: any }>('/api/admin/hobbies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHobby(id: string, data: any) {
  return fetchAdminAPI<{ hobby: any }>(`/api/admin/hobbies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHobby(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/hobbies/${id}`, {
    method: 'DELETE',
  });
}

// Testimonials
export async function getTestimonials() {
  return fetchAdminAPI<{ testimonials: any[] }>('/api/admin/testimonials');
}

export async function approveTestimonial(id: string) {
  return fetchAdminAPI<{ testimonial: any }>(`/api/admin/testimonials/${id}/approve`, {
    method: 'PUT',
  });
}

export async function rejectTestimonial(id: string) {
  return fetchAdminAPI<{ testimonial: any }>(`/api/admin/testimonials/${id}/reject`, {
    method: 'PUT',
  });
}

export async function deleteTestimonial(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleTestimonialActive(id: string) {
  return fetchAdminAPI<{ success: boolean; message: string; testimonial: any }>(`/api/admin/testimonials/${id}/toggle`, {
    method: 'PATCH',
  });
}

// Messages
export async function getMessages() {
  return fetchAdminAPI<{ messages: any[] }>('/api/admin/messages');
}

export async function markMessageRead(id: string) {
  return fetchAdminAPI<{ message: any }>(`/api/admin/messages/${id}/read`, {
    method: 'PUT',
  });
}

export async function deleteMessage(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/messages/${id}`, {
    method: 'DELETE',
  });
}

// Contact Info
export async function getContactInfo() {
  return fetchAdminAPI<{ contactInfo: any[] }>('/api/admin/contact-info');
}

export async function createContactInfo(data: { type: string; value: string; order: number }) {
  return fetchAdminAPI<{ contactInfo: any }>('/api/admin/contact-info', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContactInfo(id: string, data: { type?: string; value?: string; order?: number }) {
  return fetchAdminAPI<{ contactInfo: any }>(`/api/admin/contact-info/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteContactInfo(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/contact-info/${id}`, {
    method: 'DELETE',
  });
}

// Resume
export async function getResume(language?: string) {
  const url = language ? `/api/admin/resume?lang=${language}` : '/api/admin/resume';
  return fetchAdminAPI<{ resume: any }>(url);
}

export async function uploadResume(file: File, language: string = 'en') {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/api/admin/resume`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    cachedToken = null;
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized. Please log in.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function deleteResume(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/resume/${id}`, {
    method: 'DELETE',
  });
}

export async function getResumeStats() {
  return fetchAdminAPI<{ total: number; thisMonth: number; today: number }>('/api/admin/resume/stats');
}

export async function uploadImage(file: File): Promise<{ key: string; message: string }> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    cachedToken = null;
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized. Please log in.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
