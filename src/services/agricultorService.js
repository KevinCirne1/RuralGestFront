// src/services/agricultorService.js

import api from './api'; // Importa a nossa configuração base do Axios

// Função para buscar TODOS os agricultores (READ)
export const getAgricultores = () => {
  return api.get('/agricultores');
};

// Função para buscar UM agricultor por ID (READ)
export const getAgricultorById = (id) => {
  return api.get(`/agricultores/${id}`);
};

// Função para CRIAR um novo agricultor (CREATE)
export const createAgricultor = (data) => {
  return api.post('/agricultores', data);
};

// Função para ATUALIZAR um agricultor existente (UPDATE)
export const updateAgricultor = (id, data) => {
  return api.put(`/agricultores/${id}`, data);
};

// Função para DELETAR um agricultor (DELETE)
export const deleteAgricultor = (id) => {
  return api.delete(`/agricultores/${id}`);
};