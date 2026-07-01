import api from './axios';

export const getLibros  = (page = 1) => api.get(`/libros?page=${page}`);
export const getLibro   = (id)       => api.get(`/libros/${id}`);
export const createLibro = (data)    => api.post('/libros', data);
export const updateLibro = (id, data)=> api.put(`/libros/${id}`, data);
export const deleteLibro = (id)      => api.delete(`/libros/${id}`);