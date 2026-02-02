// src/layouts/produtor/index.jsx

import React, { useState } from 'react';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js'; // Opcional
import Navbar from 'components/navbar/NavbarAdmin.js'; // Reutilizando a Navbar do Admin
import Sidebar from 'components/sidebar/Sidebar.js';   // Reutilizando a Sidebar
import { Route, Routes, Navigate } from 'react-router-dom';
import routes from 'routes.js'; // Importante: Pega as rotas que definimos antes

import DashboardProdutor from 'views/produtor/DashboardProdutor';
import MinhasSolicitacoes from 'views/produtor/MinhasSolicitacoes';

export default function ProdutorLayout(props) {
  const { ...rest } = props;
  
  // Estados para controlar o menu lateral no mobile
  const [fixed] = useState(false);
  const { onOpen } = useDisclosure();

  // Função para pegar o nome da rota atual (para mostrar na Navbar)
  const getActiveRoute = (routes) => {
    let activeRoute = 'Painel do Produtor';
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  return (
    <Box>
      {/* 1. O Menu Lateral */}
      <Sidebar routes={routes} display='none' {...rest} />
      
      {/* 2. O Conteúdo Principal */}
      <Box
        float='right'
        minHeight='100vh'
        height='100%'
        overflow='auto'
        position='relative'
        maxHeight='100%'
        w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
        maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
        transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
        transitionDuration='.2s, .2s, .35s'
        transitionProperty='top, bottom, width'
        transitionTimingFunction='linear, linear, ease'>
        
        {/* 3. A Barra Superior (Navbar) */}
        <Portal>
          <Box>
            <Navbar
              onOpen={onOpen}
              logoText={'Gestão Rural'}
              brandText={getActiveRoute(routes)}
              secondary={false}
              message={''}
              fixed={fixed}
              {...rest}
            />
          </Box>
        </Portal>

        {/* 4. As Rotas (Onde o conteúdo muda) */}
        <Box mx='auto' p={{ base: '20px', md: '30px' }} pe='20px' minH='100vh' pt='50px'>
          <Routes>
            <Route path="dashboard" element={<DashboardProdutor />} />
            <Route path="minhas-solicitacoes" element={<MinhasSolicitacoes />} />
            
            {/* Redirecionamento padrão */}
            <Route path="/" element={<Navigate to="/produtor/dashboard" replace />} />
          </Routes>
        </Box>
        
        <Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}