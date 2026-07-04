import api from './axios';

export const getUsuarios   = ()          => api.get('/usuarios');
export const createUsuario = (data)      => api.post('/register', data); // ← ya existe
export const updateUsuario = (id, data)  => api.put(`/usuarios/${id}`, data);
export const toggleEstado  = (id)        => api.patch(`/usuarios/${id}/toggle`);