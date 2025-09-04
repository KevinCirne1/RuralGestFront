import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';

// Layouts
import AdminLayout from 'layouts/admin';
import AuthLayout from 'layouts/auth';
import ProdutorLayout from 'layouts/produtor';

// Views
import LandingPage from 'views/landing/LandingPage';
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';


// Contexto de Autenticação
import { AuthProvider } from 'contexts/AuthContext';

// Componente de Proteção
import ProtectedRoute from 'components/auth/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* --- Rotas Públicas --- */}
            <Route path={`/`} element={<LandingPage />} />
            <Route path={`/auth/sign-in`} element={<SignIn />} />
            <Route path={`/auth/sign-up`} element={<SignUp />} />

            {/* --- Rotas Protegidas --- */}
            <Route element={<ProtectedRoute />}>
              <Route path={`/admin/*`} element={<AdminLayout />} />
              <Route path={`/produtor/*`} element={<ProdutorLayout />} />
            </Route>
            
            {/* Rota de fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>
);