import api from './api'; 

export const getNotificacoes = async (usuarioId) => {
  return await api.get('/notificacoes', {
    params: { usuario_id: usuarioId }
  });
};

export const marcarComoLida = async (notificacaoId) => {
  // Antes estava: api.post(`/notificacoes/${notificacaoId}/id`); 
  // O correto é PUT e sem o '/id' no final:
  return await api.put(`/notificacoes/${notificacaoId}`);
};