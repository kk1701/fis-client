import api from './axios';

export const getOwnExperiencesApi = (type?: string) =>
  api.get('/faculty/experiences', { params: type ? { type } : {} });

export const addExperienceApi = (data: any) =>
  api.post('/faculty/experiences', data);

export const updateExperienceApi = (id: number, data: any) =>
  api.patch(`/faculty/experiences/${id}`, data);

export const deleteExperienceApi = (id: number) =>
  api.delete(`/faculty/experiences/${id}`);