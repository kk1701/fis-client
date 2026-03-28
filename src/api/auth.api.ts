import api from './axios';
import type { AuthUser } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  departmentId: number;
  role?: 'FACULTY';
}

export interface AuthResponse {
  access_token: string;
}

export const loginApi = (payload: LoginPayload) =>
  api.post<AuthResponse>('/auth/login', payload);

export const registerApi = (payload: RegisterPayload) =>
  api.post<AuthResponse>('/auth/register', payload);

export const getMeApi = () =>
  api.get<AuthUser>('/auth/me');