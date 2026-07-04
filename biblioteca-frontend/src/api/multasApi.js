import api from './axios';

export const getMultas   = () => api.get('/multas');
export const pagarMulta  = (id) => api.post(`/multas/${id}/pagar`);