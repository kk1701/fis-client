import api from './axios';

export const getStatsApi = () =>
  api.get('/admin/stats');

export const getFacultyListApi = (params?: {
  departmentId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => api.get('/admin/faculty', { params });

export const exportFacultyApi = () =>
  api.get('/admin/export/faculty', { responseType: 'blob' });

export const getPendingApprovalsApi = () =>
  api.get('/approvals/pending');

export const approveFacultyApi = (userId: number) =>
  api.post(`/approvals/${userId}/approve`, {});

export const rejectFacultyApi = (userId: number, reason: string) =>
  api.post(`/approvals/${userId}/reject`, { reason });

export const getAdminDepartmentsApi = () =>
  api.get('/admin/departments');

export const createDepartmentApi = (data: { name: string; code: string }) =>
  api.post('/admin/departments', data);

export const updateDepartmentApi = (id: number, data: { name?: string; code?: string }) =>
  api.patch(`/admin/departments/${id}`, data);

export const deleteDepartmentApi = (id: number) =>
  api.delete(`/admin/departments/${id}`);

export const getAdminCoursesApi = (params?: { departmentId?: number; level?: string }) =>
  api.get('/admin/courses', { params });

export const createAdminCourseApi = (data: any) =>
  api.post('/admin/courses', data);

export const updateAdminCourseApi = (id: number, data: any) =>
  api.patch(`/admin/courses/${id}`, data);

export const deleteAdminCourseApi = (id: number) =>
  api.delete(`/admin/courses/${id}`);