// src/services/propriedadeService.js

import api from './api';

// Função para buscar TODAS as propriedades (READ)
export const getPropriedades = () => {
    return api.get('/propriedades');
};

// Função para buscar UMA propriedade por ID (READ)
export const getPropriedadeById = (id) => {
    return api.get(`/propriedades/${id}`);
};

// Função para CRIAR uma nova propriedade (CREATE)
export const createPropriedade = (data) => {
    return api.post('/propriedades', data);
};

// Função para ATUALIZAR uma propriedade existente (UPDATE)
export const updatePropriedade = (id, data) => {
    return api.put(`/propriedades/${id}`, data);
};

// Função para DELETAR uma propriedade (DELETE)
export const deletePropriedade = (id) => {
    return api.delete(`/propriedades/${id}`);
};