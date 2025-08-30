// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://127.0.0.1:5000";

// 1. Criamos o Contexto
const AuthContext = createContext();

// 2. Criamos o Provedor (o componente que vai "envelopar" nossa aplicação)
export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null); // Vai guardar os dados do usuário e o token
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect para carregar os dados do localStorage quando o app inicia
  useEffect(() => {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
    setLoading(false);
  }, []);

  // Função de Login
  const login = async (login, senha) => {
    try {
      // Usamos a API Falsa para buscar um usuário com aquele login
      const response = await axios.get(`${API_URL}/usuarios?login=${login}`);
      const user = response.data[0];

      // Se não encontrou um usuário ou a senha estiver errada (aqui não verificamos senha, é simulação)
      if (!user) {
        throw new Error("Usuário ou senha inválidos");
      }

      // Se encontrou, criamos nossos dados de autenticação (simulando um token)
      const newAuthData = {
        token: `fake-token-${user.id}`, // Token falso
        user: user,
      };

      // Salvamos no localStorage para persistir a sessão
      localStorage.setItem('authData', JSON.stringify(newAuthData));
      // Salvamos no estado
      setAuthData(newAuthData);

      // Redireciona com base no perfil do usuário
      if (user.perfil === 'produtor') {
        navigate('/produtor');
      } else {
        navigate('/admin');
      }

    } catch (error) {
      console.error("Erro no login:", error);
      // Lança o erro para que o formulário de login possa tratá-lo
      throw error;
    }
  };

  // Função de Logout
  const logout = () => {
    // Limpa o localStorage e o estado
    localStorage.removeItem('authData');
    setAuthData(null);
    // Redireciona para a tela de login
    navigate('/auth/sign-in');
  };

  // O "value" é o que será compartilhado com todos os componentes dentro do Provedor
  const value = {
    authData,
    loading,
    login,
    logout,
  };

  // Não renderiza nada até que a verificação inicial do localStorage seja feita
  if (loading) {
    return <div>Carregando sessão...</div>;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Criamos um "atalho" (hook customizado) para usar o contexto mais facilmente
export const useAuth = () => {
  return useContext(AuthContext);
};