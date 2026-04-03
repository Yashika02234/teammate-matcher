import axios from 'axios';
import type { Token } from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

// Login uses form-urlencoded (OAuth2PasswordRequestForm)
export async function login(username: string, password: string): Promise<Token> {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const response = await axios.post<Token>(`${BASE_URL}/token`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return response.data;
}

export function saveToken(token: string, userId: string): void {
  localStorage.setItem('syncup_token', token);
  localStorage.setItem('syncup_user_id', userId);
}

export function clearToken(): void {
  localStorage.removeItem('syncup_token');
  localStorage.removeItem('syncup_user_id');
}

export function getToken(): string | null {
  return localStorage.getItem('syncup_token');
}

export function getStoredUserId(): string | null {
  return localStorage.getItem('syncup_user_id');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
