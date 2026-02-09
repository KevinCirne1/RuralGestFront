import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Flex, Spinner } from '@chakra-ui/react';

const ProtectedRoute = () => {
    const { authData, loading } = useAuth();

    if (loading) {
        return (
            <Flex height="100vh" alignItems="center" justifyContent="center">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!authData) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;