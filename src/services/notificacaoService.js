// src/services/notificacaoService.js

import api from './api'; // Importa sua configuração padrão do Axios

// Busca todas as notificações de um usuário
export const getNotificacoes = async (usuarioId) => {
  // O endpoint deve bater com o que criamos no Python (/notificacoes/<id>)
  return await api.get(`/notificacoes/${usuarioId}`);
};

// Marca uma notificação específica como lida
export const marcarComoLida = async (notificacaoId) => {
  return await api.put(`/notificacoes/ler/${notificacaoId}`);
};