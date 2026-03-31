import api from './axios';

export const getOwnThesesApi = () =>
  api.get('/faculty/thesis');

export const addThesisApi = (data: any) =>
  api.post('/faculty/thesis', data);

export const updateThesisApi = (id: number, data: any) =>
  api.patch(`/faculty/thesis/${id}`, data);

export const deleteThesisApi = (id: number) =>
  api.delete(`/faculty/thesis/${id}`);

export const getOwnDissertationsApi = () =>
  api.get('/faculty/dissertation');

export const addDissertationApi = (data: any) =>
  api.post('/faculty/dissertation', data);

export const updateDissertationApi = (id: number, data: any) =>
  api.patch(`/faculty/dissertation/${id}`, data);

export const deleteDissertationApi = (id: number) =>
  api.delete(`/faculty/dissertation/${id}`);