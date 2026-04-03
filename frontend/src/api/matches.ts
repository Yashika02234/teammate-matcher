import apiClient from './client';
import type { MatchResponse, ProjectMatchResponse } from '../types';

export async function getMatches(
  userId: string,
  skip = 0,
  limit = 5
): Promise<MatchResponse> {
  const response = await apiClient.get<MatchResponse>(`/match/${userId}`, {
    params: { skip, limit },
  });
  return response.data;
}

export async function getProjectMatches(
  projectId: string,
  skip = 0,
  limit = 5
): Promise<ProjectMatchResponse> {
  const response = await apiClient.get<ProjectMatchResponse>(
    `/project-match/${projectId}`,
    { params: { skip, limit } }
  );
  return response.data;
}
