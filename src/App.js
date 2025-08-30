// src/App.js

import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';

// IMPORTAÇÕES ADICIONADAS
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './views/landing/LandingPage';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import ProdutorLayout from './layouts/produtor';

// Importe seus componentes
import MainDashboard from 'views/admin/dashboard';
import Agricultores from 'views/admin/Agricultores';
import Propriedades from 'views/admin/Propriedades';
import Servicos from 'views/admin/Servicos';
import TelaProdutor from 'views/admin/TelaProdutor';
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';

export default function Main() {
  const [currentTheme] = useState(initialTheme);

  return (
    <ChakraProvider theme={currentTheme}>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rotas de Autenticação (Aninhadas) */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="*" element={<Navigate to="sign-in" replace />} />
          </Route>

          {/* Rota Protegida (Admin) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="default" element={<MainDashboard />} />
            <Route path="agricultores" element={<Agricultores />} />
            <Route path="propriedades" element={<Propriedades />} />
            <Route path="servicos" element={<Servicos />} />
            <Route path="tela-produtor" element={<TelaProdutor />} />
            <Route path="*" element={<Navigate to="default" replace />} />
          </Route>
          
          {/* Rota Protegida (Produtor) */}
          <Route path="/produtor" element={<ProdutorLayout />}>
            {/* Adicione as rotas da Tela do Produtor aqui quando criá-las */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ChakraProvider>
  );
}