// src/routes.js

import React from 'react';
import { Icon } from '@chakra-ui/react';
import { MdPerson, MdHome, MdLandscape, MdBuild, MdLock, MdAssignment, MdList } from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/dashboard';
import Agricultores from 'views/admin/Agricultores';
import Propriedades from 'views/admin/Propriedades';
import Servicos from 'views/admin/Servicos'; 
import Solicitacoes from 'views/admin/Solicitacoes';
import Profile from 'views/admin/profile'; 
import Veiculos from 'views/admin/Veiculos'; 
import { MdDirectionsCar } from 'react-icons/md';

// Auth Imports
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';

// Produtor Imports
import DashboardProdutor from 'views/produtor/DashboardProdutor'; 
import MinhasSolicitacoes from 'views/produtor/MinhasSolicitacoes';

const routes = [
  // --- ROTAS DO PAINEL ADMIN ---
  {
    name: 'Dashboard Admin',
    layout: '/admin',
    path: '/dashboard', // <--- MUDANÇA AQUI (Era /default)
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
    name: 'Solicitações', 
    layout: '/admin',
    path: '/solicitacoes', 
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: Solicitacoes, 
  },
  {
    name: 'Serviços', 
    layout: '/admin',
    path: '/servicos',
    icon: <Icon as={MdBuild} width="20px" height="20px" color="inherit" />,
    component: Servicos, 
  },
  {
    name: "Frota de Veículos",
    layout: "/admin",
    path: "/veiculos",
    icon: <Icon as={MdDirectionsCar} width='20px' height='20px' color='inherit' />,
    component: Veiculos,
  },

  // --- ROTAS DO PRODUTOR ---
  {
    name: 'Painel do Produtor',
    layout: '/produtor',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: DashboardProdutor,
  },
  {
    name: 'Meus Pedidos',
    layout: '/produtor',
    path: '/minhas-solicitacoes',
    icon: <Icon as={MdList} width="20px" height="20px" color="inherit" />,
    component: MinhasSolicitacoes,
  },

  // --- ROTA DE PERFIL (Adicionada para ambos) ---
  {
    name: 'Meu Perfil',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },
  {
    name: 'Meu Perfil',
    layout: '/produtor',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: Profile,
  },

  // --- ROTAS DE AUTENTICAÇÃO ---
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