// src/routes.js

import React from 'react';
import { Icon } from '@chakra-ui/react';
import { MdPerson, MdHome, MdLandscape, MdBuild, MdLock, MdAssignment } from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/dashboard';
import Agricultores from 'views/admin/Agricultores';
import Propriedades from 'views/admin/Propriedades';
import Servicos from 'views/admin/Servicos'; // A NOVA tela do catálogo
import Solicitacoes from 'views/admin/Solicitacoes'; // A tela que foi RENOMEADA

// Auth Imports
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';

const routes = [
  // --- ROTAS DO PAINEL ADMIN ---
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
  },
  {
    name: 'Agricultores',
    layout: '/admin',
    path: '/agricultores',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Agricultores,
  },
  {
    name: 'Propriedades',
    layout: '/admin',
    path: '/propriedades',
    icon: <Icon as={MdLandscape} width="20px" height="20px" color="inherit" />,
    component: Propriedades,
  },
  {
    name: 'Solicitações', // <<< RENOMEADO
    layout: '/admin',
    path: '/solicitacoes', // <<< CAMINHO ATUALIZADO
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />, // Ícone novo
    component: Solicitacoes, // Aponta para o componente na pasta renomeada
  },
  {
    name: 'Serviços', // <<< NOVO ITEM DE MENU (O Catálogo)
    layout: '/admin',
    path: '/servicos',
    icon: <Icon as={MdBuild} width="20px" height="20px" color="inherit" />,
    component: Servicos, // Aponta para o novo CRUD de Serviços
  },
  // --- ROTAS DE AUTENTICAÇÃO (Não aparecem no menu, mas são usadas) ---
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignIn,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignUp,
  },
];

export default routes;