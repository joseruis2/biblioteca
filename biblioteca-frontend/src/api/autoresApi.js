import api from './axios';

export const getAutores   = ()          => api.get('/autores');
export const createAutor  = (data)      => api.post('/autores', data);
export const updateAutor  = (id, data)  => api.put(`/autores/${id}`, data);
export const deleteAutor  = (id)        => api.delete(`/autores/${id}`);