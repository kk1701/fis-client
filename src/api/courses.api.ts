import api from './axios';

export const getOwnCoursesApi = (params?: { semester?: string; academicYear?: string }) =>
  api.get('/faculty/courses', { params });

export const addCourseApi = (data: any) =>
  api.post('/faculty/courses', data);

export const updateCourseApi = (id: number, data: any) =>
  api.patch(`/faculty/courses/${id}`, data);

export const deleteCourseApi = (id: number) =>
  api.delete(`/faculty/courses/${id}`);

export const getCourseCatalogApi = () =>
  api.get('/courses');