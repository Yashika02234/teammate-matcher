import apiClient from './client';
import type { ProfileCreate, ProfileOut } from '../types';

export async function createProfile(data: ProfileCreate): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/profile', data);
  return response.data;
}

export async function updateProfile(data: Partial<ProfileCreate>): Promise<{ message: string }> {
  const response = await apiClient.put<{ message: string }>('/profile', data);
  return response.data;
}

export async function getProfiles(skip = 0, limit = 10): Promise<ProfileOut[]> {
  const response = await apiClient.get<ProfileOut[]>('/profiles', {
    params: { skip, limit },
  });
  return response.data;
}

export async function deleteAllProfiles(): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>('/reset-profiles');
  return response.data;
}
