import api from './axios';

export const getReservas      = ()    => api.get('/reservas/todas');
export const createReserva    = (data)=> api.post('/reservas', data);
export const cancelarReserva  = (id)  => api.post(`/reservas/${id}/cancelar`);
export const completarReserva = (id)  => api.post(`/reservas/${id}/completar`);
export const expirarReserva   = (id)  => api.post(`/reservas/${id}/expirar`);