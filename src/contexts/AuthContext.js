// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// A URL base do back-end
const API_URL = "http://127.0.0.1:5000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
    setLoading(false);
  }, []);

  // Função de Login
  const login = async (loginInput, senhaInput) => {
    try {
      // Faz a requisição enviando "login" e "senha" (chaves exatas do Python)
      const response = await axios.post(`${API_URL}/login`, {
        login: loginInput,
        senha: senhaInput,
      });

      const userData = response.data;

      // Estrutura os dados para salvar
      const newAuthData = {
        user: userData, // Aqui deve vir { id, nome, perfil, ... }
      };

      localStorage.setItem('authData', JSON.stringify(newAuthData));
      setAuthData(newAuthData);

      // --- LÓGICA DE REDIRECIONAMENTO INTELIGENTE (ATUALIZADA) ---
      // Verifica o perfil para mandar para a tela certa
      if (newAuthData.user.perfil === 'gestor' || newAuthData.user.perfil === 'admin') {
        navigate('/admin/dashboard'); 
      } else if (newAuthData.user.perfil === 'agricultor') {
        // MUDANÇA AQUI: Agora vai para o Painel (Dashboard) com os botões grandes
        navigate('/produtor/dashboard'); 
      } else {
        // Fallback caso não tenha perfil definido
        navigate('/'); 
      }

    } catch (error) {
      console.error("Erro no login:", error);
      throw error; // Lança o erro para o componente SignIn exibir o Toast
    }
  };

  // Função de Logout 
  const logout = () => {
    localStorage.removeItem('authData');
    setAuthData(null);
    navigate('/auth/sign-in');
  };

  const value = {
    authData,
    loading,
    login,
    logout,
  };

  if (loading) {
    return <div>A carregar sessão...</div>;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};