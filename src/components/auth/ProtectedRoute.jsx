import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Flex, Spinner, useToast } from '@chakra-ui/react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { authData, loading } = useAuth();
    const location = useLocation();
    const toast = useToast();

    // 1. Mostra carregamento enquanto verifica a sessão
    if (loading) {
        return (
            <Flex height="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    // 2. Se não estiver logado, manda para o Login
    if (!authData?.user) {
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    // 3. RECUPERAR O PERFIL
    const perfilUsuario = authData.user.perfil?.toLowerCase();

    // 4. VERIFICAÇÃO DE PERMISSÃO
    // Se a rota exige perfis específicos e o usuário não tem, bloqueia
    if (allowedRoles && !allowedRoles.includes(perfilUsuario)) {
        // Opcional: Avisar o usuário
        console.warn(`Acesso negado para o perfil: ${perfilUsuario}`);
        
        // Redireciona para o Dashboard padrão do perfil dele
        const redirectPath = perfilUsuario === 'produtor' || perfilUsuario === 'agricultor' 
            ? "/produtor/dashboard" 
            : "/admin/dashboard";
            
        return <Navigate to={redirectPath} replace />;
    }

    // Se passou em tudo, libera a rota
    return <Outlet />;
};

export default ProtectedRoute;