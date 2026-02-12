import api from './api'; 

// Busca notificações do usuário (Mantido)
export const getNotificacoes = async (usuarioId) => {
  return await api.get('/notificacoes', {
    params: { usuario_id: usuarioId }
  });
};

// CORREÇÃO: Mudamos de .put para .post para bater com o NotificacaoLerResource do Backend
export const marcarComoLida = async (notificacaoId) => {
  return await api.post(`/notificacoes/${notificacaoId}`);
};

// NOVA FUNÇÃO: Chama a rota que criamos para limpar tudo no PostgreSQL
export const marcarTodasComoLidas = async (usuarioId) => {
  return await api.post('/notificacoes/ler-tudo', null, {
    params: { usuario_id: usuarioId }
  });
};