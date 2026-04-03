import api from './axios';

export const getPublicReportsApi = () =>
  api.get('/public/reports');

export const getPublicReportByIdApi = (id: number) =>
  api.get(`/public/reports/${id}`);