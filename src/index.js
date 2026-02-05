import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import './assets/css/App.css'; // Verifique se o caminho do CSS está certo

// Layouts
import AdminLayout from 'layouts/admin'; 
import AuthLayout from 'layouts/auth';
import ProdutorLayout from 'layouts/produtor'; // <--- PRECISAMOS DESTE IMPORT

// Views (opcionais aqui se o layout já gerencia, mas ok manter)
import LandingPage from 'views/landing/LandingPage';
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';

// Contexto
import { AuthProvider } from 'contexts/AuthContext';
import ProtectedRoute from 'components/auth/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* --- Rotas Públicas --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />

            {/* --- Rotas Protegidas --- */}
            <Route element={<ProtectedRoute />}>
              {/* Rota do ADMIN usa o Layout de Admin */}
              <Route path="/admin/*" element={<AdminLayout />} />
              
              {/* Rota do PRODUTOR usa o Layout de Produtor (CORREÇÃO AQUI) */}
              <Route path="/produtor/*" element={<ProdutorLayout />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>
);