// src/services/usuarioService.js

import api from './api';

// Função para buscar TODOS os usuários (READ)
export const getUsuarios = () => {
    return api.get('/usuarios');
};

// Função para buscar UM usuário por ID (READ)
export const getUsuarioById = (id) => {
    return api.get(`/usuarios/${id}`);
};

// Função para CRIAR um novo usuário (CREATE)
export const createUsuario = (data) => {
    return api.post('/usuarios', data);
};

// Função para ATUALIZAR um usuário existente (UPDATE)
export const updateUsuario = (id, data) => {
    return api.put(`/usuarios/${id}`, data);
};

// Função para DELETAR um usuário (DELETE)
export const deleteUsuario = (id) => {
    return api.delete(`/usuarios/${id}`);
};