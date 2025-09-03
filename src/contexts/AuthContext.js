import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// A URL base do nosso back-end
const API_URL = "http://127.0.0.1:5000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect para carregar dados do localStorage quando a aplicação inicia
  useEffect(() => {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
    setLoading(false);
  }, []);

  // Função de Login (SIMPLIFICADA)
  const login = async (login, senha) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        login: login,
        senha: senha,
      });

      // O back-end agora devolve diretamente os dados do utilizador
      const userData = response.data;
      
      const newAuthData = {
        // Já não temos token, guardamos apenas os dados do utilizador
        user: userData,
      };

      // Guardamos no localStorage para persistir a sessão
      localStorage.setItem('authData', JSON.stringify(newAuthData));
      // Guardamos no estado para a UI reagir
      setAuthData(newAuthData);

      // Redirecionamos com base no perfil
      if (newAuthData.user.perfil === 'gestor') {
        navigate('/admin/default'); // Rota para o painel de admin
      } else {
        navigate('/'); // Rota padrão para outros perfis
      }

    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  // Função de Logout (continua igual)
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

// Hook customizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};