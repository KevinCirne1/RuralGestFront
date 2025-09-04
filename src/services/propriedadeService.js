import api from './api';

// Função para buscar TODAS as propriedades de todos os agricultores (READ)
export const getPropriedades = () => {
    return api.get('/propriedades');
};

// Função para buscar UMA propriedade por ID (READ)
export const getPropriedadeById = (id) => {
    return api.get(`/propriedades/${id}`);
};


// A função agora espera o ID do agricultor e os dados da propriedade.
export const createPropriedade = (agricultorId, data) => {
    return api.post(`/agricultores/${agricultorId}/propriedades`, data);
};

// Função para ATUALIZAR uma propriedade existente (UPDATE)
export const updatePropriedade = (id, data) => {
    return api.put(`/propriedades/${id}`, data);
};

// Função para DELETAR uma propriedade (DELETE)
export const deletePropriedade = (id) => {
    return api.delete(`/propriedades/${id}`);
    };