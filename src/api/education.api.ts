import api from './axios';

export const getOwnEducationApi = () =>
  api.get('/faculty/education');

export const addDegreeApi = (data: any) =>
  api.post('/faculty/education', data);

export const updateDegreeApi = (id: number, data: any) =>
  api.patch(`/faculty/education/${id}`, data);

export const deleteDegreeApi = (id: number) =>
  api.delete(`/faculty/education/${id}`);