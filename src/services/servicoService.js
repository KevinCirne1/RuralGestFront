

import api from './api';

// Função para buscar TODOS os serviços (READ)
export const getServicos = () => {
    return api.get('/servicos');
};

// Função para buscar UM serviço por ID (READ)
export const getServicoById = (id) => {
    return api.get(`/servicos/${id}`);
};

// Função para CRIAR um novo serviço (CREATE)
export const createServico = (data) => {
    return api.post('/servicos', data);
};

// Função para ATUALIZAR um serviço existente (UPDATE)
export const updateServico = (id, data) => {
    return api.put(`/servicos/${id}`, data);
};

// Função para DELETAR um serviço (DELETE)
export const deleteServico = (id) => {
    return api.delete(`/servicos/${id}`);
};