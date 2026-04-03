import apiClient from './client';
import type { ProjectCreate, ProjectOut } from '../types';

export async function createProject(data: ProjectCreate): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/project', data);
  return response.data;
}

export async function getProjects(skip = 0, limit = 10): Promise<ProjectOut[]> {
  const response = await apiClient.get<ProjectOut[]>('/projects', {
    params: { skip, limit },
  });
  return response.data;
}

export async function deleteAllProjects(): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>('/reset-projects');
  return response.data;
}
