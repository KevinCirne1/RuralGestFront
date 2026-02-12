import api from "./api"; 

// Buscar TODOS os agricultores (READ)
export const getAgricultores = () => {
  return api.get("/agricultores");
};

// Buscar UM agricultor por ID (READ)
export const getAgricultorById = (id) => {
  return api.get(`/agricultores/${id}`);
};

// Criar um novo agricultor (CREATE)
export const createAgricultor = (data) => {
  return api.post("/agricultores", data);
};

// Atualizar um agricultor existente (UPDATE)
export const updateAgricultor = (id, data) => {
  return api.put(`/agricultores/${id}`, data);
};

// Deletar um agricultor (DELETE)
export const deleteAgricultor = (id) => {
  return api.delete(`/agricultores/${id}`);
};

//  Buscar propriedades de um agricultor específico
export const getPropriedadesByAgricultor = (agricultorId) => {
  return api.get(`/agricultores/${agricultorId}/propriedades`);
};

//  Criar propriedade para um agricultor específico
export const createPropriedadeForAgricultor = (agricultorId, data) => {
  return api.post(`/agricultores/${agricultorId}/propriedades`, data);
};
