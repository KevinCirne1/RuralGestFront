import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Flex, Spinner, useToast } from '@chakra-ui/react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { authData, loading } = useAuth();
    const location = useLocation();
    const toast = useToast();

    if (loading) {
        return (
            <Flex height="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    //Se não estiver logado, manda para o Login
    if (!authData?.user) {
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    const perfilUsuario = authData.user.perfil?.toLowerCase();

    if (allowedRoles && !allowedRoles.includes(perfilUsuario)) {
        console.warn(`Acesso negado para o perfil: ${perfilUsuario}`);
        
        const redirectPath = perfilUsuario === 'produtor' || perfilUsuario === 'agricultor' 
            ? "/produtor/dashboard" 
            : "/admin/dashboard";
            
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;