// src/layouts/produtor/index.jsx

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';


import DashboardProdutor from 'views/produtor/DashboardProdutor';
import MinhasSolicitacoes from 'views/produtor/MinhasSolicitacoes';

export default function ProdutorLayout() {
  return (
    <Box>
      {/* */}
      <Routes>
          <Route path="dashboard" element={<DashboardProdutor />} />
          <Route path="minhas-solicitacoes" element={<MinhasSolicitacoes />} />

          {/* Rota padrão para a área do produtor */}
          <Route path="/" element={<Navigate to="/produtor/dashboard" replace />} />
      </Routes>
    </Box>
  );
}