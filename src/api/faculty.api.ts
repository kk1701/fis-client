import api from './axios';

export const getOwnProfileApi = () =>
  api.get('/faculty/profile');

export const updatePersonalApi = (data: any) =>
  api.patch('/faculty/profile/personal', data);

export const updateAcademicApi = (data: any) =>
  api.patch('/faculty/profile/academic', data);

export const getAddressesApi = () =>
  api.get('/faculty/addresses');

export const upsertAddressApi = (type: 'CORRESPONDENCE' | 'PERMANENT', data: any) =>
  api.patch('/faculty/addresses', data, { params: { type } });

export const deleteAddressApi = (type: 'CORRESPONDENCE' | 'PERMANENT') =>
  api.delete('/faculty/addresses', { params: { type } });

export const uploadProfilePictureApi = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/faculty/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};