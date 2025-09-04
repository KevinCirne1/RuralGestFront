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
  const login = async (login, senha) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        login: login,
        senha: senha,
      });

      
      const userData = response.data;
      
      const newAuthData = {
       
        user: userData,
      };

      
      localStorage.setItem('authData', JSON.stringify(newAuthData));
      
      setAuthData(newAuthData);

      
      if (newAuthData.user.perfil === 'gestor') {
        navigate('/admin/default'); 
      } else {
        navigate('/'); 
      }

    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
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