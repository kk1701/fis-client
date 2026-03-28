import api from './axios';

export const getOwnPublicationsApi = (type?: string) =>
  api.get('/faculty/publications', { params: type ? { type } : {} });

export const addPublicationApi = (data: any) =>
  api.post('/faculty/publications', data);

export const updatePublicationApi = (id: number, data: any) =>
  api.patch(`/faculty/publications/${id}`, data);

export const deletePublicationApi = (id: number) =>
  api.delete(`/faculty/publications/${id}`);