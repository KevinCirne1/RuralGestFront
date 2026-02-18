import api from './api';

export const getSolicitacoes = (params = {}) => {
    return api.get('/solicitacoes', { params: params });
}


// Função para buscar UMA solicitação por ID (READ)
export const getSolicitacaoById = (id) => {
    return api.get(`/solicitacoes/${id}`);
};

// Função para CRIAR uma nova solicitação (CREATE)
export const createSolicitacao = (data) => {
    return api.post('/solicitacoes', data);
};

// Função para ATUALIZAR uma solicitação existente (UPDATE)
export const updateSolicitacao = (id, data) => {
    return api.put(`/solicitacoes/${id}`, data);
};

// Função para DELETAR uma solicitação (DELETE)
export const deleteSolicitacao = (id) => {
    return api.delete(`/solicitacoes/${id}`);
};