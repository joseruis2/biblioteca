import api from './axios';

export const getPrestamos     = ()    => api.get('/prestamos');
export const createPrestamo   = (data)=> api.post('/prestamos', data);
export const devolverPrestamo = (id)  => api.post(`/prestamos/${id}/devolver`);