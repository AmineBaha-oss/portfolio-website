import { authClient } from '@/lib/auth/auth-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getAuthToken(): Promise<string | null> {
  try {
    const tokenResult = await authClient.token();
    return tokenResult.data?.token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function fetchAdminAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please log in.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Admin API Error (${endpoint}):`, error);
    throw error;
  }
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

  const url = `${API_BASE_URL}/api/admin/resume`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please log in.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resume upload error:', error);
    throw error;
  }
}

export async function deleteResume(id: string) {
  return fetchAdminAPI<{ success: boolean }>(`/api/admin/resume/${id}`, {
    method: 'DELETE',
  });
}
