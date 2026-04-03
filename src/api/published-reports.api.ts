import api from './axios';

export const getAdminPublishedReportsApi = () =>
  api.get('/admin/published-reports');

export const updatePublishedReportApi = (id: number, data: {
  title?: string;
  description?: string;
  isPublic?: boolean;
}) => api.patch(`/admin/published-reports/${id}`, data);

export const deletePublishedReportApi = (id: number) =>
  api.delete(`/admin/published-reports/${id}`);