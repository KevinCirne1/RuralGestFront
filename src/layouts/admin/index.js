// src/layouts/admin/index.jsx

import React, { useState, useEffect } from 'react';
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import Sidebar from 'components/sidebar/Sidebar';
import Navbar from 'components/navbar/NavbarAdmin';
import Footer from 'components/footer/FooterAdmin';

import routes from 'routes.js';
import { useAuth } from 'contexts/AuthContext';

export default function AdminLayout(props) {
  const { ...rest } = props;
  const location = useLocation();
  const { onOpen } = useDisclosure();
  const { authData, loading } = useAuth();
  const [brandText, setBrandText] = useState('Dashboard');
  const navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');

  useEffect(() => {
    const activeRoute = routes.find(
      (route) => window.location.href.indexOf(route.layout + route.path) !== -1
    );
    setBrandText(activeRoute ? activeRoute.name : 'Dashboard');
  }, [location, routes]);

  if (!loading && !authData) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const getAdminRoutes = (routes) => {
    return routes.filter(route => route.layout === "/admin");
  };

  return (
    <Box>
      <Sidebar routes={routes} {...rest} />
      <Box
        float="right"
        minHeight="100vh"
        height="100%"
        overflow="auto"
        position="relative"
        maxHeight="100%"
        w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
        maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
        bg={navbarBg}
      >
        <Navbar
          onOpen={onOpen}
          brandText={brandText}
          secondary={false}
          fixed={false}
          {...rest}
        />
        <Box mx="auto" p={{ base: '20px', md: '30px' }} pe="20px" minH="calc(100vh - 120px)">
          <Routes>
            {getAdminRoutes(routes).map((prop, key) => (
              <Route
                path={prop.path.replace("/admin", "")}
                // CORREÇÃO: Renderiza o componente como um elemento JSX
                element={<prop.component />}
                key={key}
              />
            ))}
            <Route path="*" element={<Navigate to="/admin/default" replace />} />
          </Routes>
        </Box>
        <Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}