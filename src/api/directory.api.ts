import api from './axios';

export const getDirectoryApi = (params?: {
  departmentId?: number;
  search?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}) => api.get('/faculty/directory', { params });

export const getPublicProfileApi = (facultyId: number) =>
  api.get(`/faculty/${facultyId}/public`);