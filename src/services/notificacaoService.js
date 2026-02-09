import api from './api'; 

export const getNotificacoes = async (usuarioId) => {
  return await api.get('/notificacoes', {
    params: { usuario_id: usuarioId }
  });
};

export const marcarComoLida = async (notificacaoId) => {
  return await api.put(`/notificacoes/${notificacaoId}`);
};