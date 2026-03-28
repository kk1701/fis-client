import api from './axios';

export const getOwnProfileApi = () =>
  api.get('/faculty/profile');

export const updatePersonalApi = (data: any) =>
  api.patch('/faculty/profile/personal', data);

export const updateAcademicApi = (data: any) =>
  api.patch('/faculty/profile/academic', data);