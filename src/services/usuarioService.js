import api from './api'; 

// Função de Cadastro Público 
export const createUsuario = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        throw error;
    }
};

// Função para Admin criar usuários internos 
export const createUsuarioInterno = async (userData) => {
    try {
        const response = await api.post('/usuarios', userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar usuário interno:", error);
        throw error;
    }
};

// Listar todos os usuários (Para Admin)
export const getUsuarios = async () => {
    try {
        const response = await api.get('/usuarios');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
    }
};

// Obter usuário específico
export const getUsuarioById = async (id) => {
    try {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        throw error;
    }
};

// Atualizar usuário
export const updateUsuario = async (id, userData) => {
    try {
        const response = await api.put(`/usuarios/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw error;
    }
};

// Deletar usuário
export const deleteUsuario = async (id) => {
    try {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        throw error;
    }
};